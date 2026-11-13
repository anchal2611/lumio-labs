import path from 'path';
import fs from 'fs';

// ─── Setup storage path ───────────────────────────────────────────────────────
function resolveDataDir(): string {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  const rootData = path.resolve(__dirname, '../../../data');
  const serverData = path.resolve(__dirname, '../../data');
  if (fs.existsSync(rootData)) return rootData;
  if (fs.existsSync(serverData)) return serverData;
  return path.resolve(process.cwd(), 'data');
}
const dbDir = resolveDataDir();
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, 'lumio.db');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const initSqlJs = require('sql.js');

let sqlDb: any = null; // live in-memory database instance

/** Persist in-memory database to disk */
function saveDatabase(): void {
  if (!sqlDb) return;
  try {
    const data: Uint8Array = sqlDb.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  } catch (e) {
    console.error('Failed to persist database:', e);
  }
}

// Auto-save every 10 seconds and on process exit
setInterval(saveDatabase, 10_000).unref();
process.on('exit', saveDatabase);
process.on('SIGINT', () => { saveDatabase(); process.exit(0); });
process.on('SIGTERM', () => { saveDatabase(); process.exit(0); });

// ─── Thin wrapper matching better-sqlite3's synchronous API ──────────────────
class Statement {
  private sql: string;
  constructor(sql: string) { this.sql = sql; }

  private normalise(args: any[]): any[] {
    if (args.length === 1 && Array.isArray(args[0])) return args[0];
    return args;
  }

  run(...args: any[]): { lastInsertRowid: number; changes: number } {
    const params = this.normalise(args);
    sqlDb.run(this.sql, params);
    const rows = sqlDb.exec('SELECT last_insert_rowid() as id, changes() as ch');
    const vals = rows[0]?.values[0] ?? [0, 0];
    return { lastInsertRowid: vals[0] as number, changes: vals[1] as number };
  }

  get(...args: any[]): any | undefined {
    const params = this.normalise(args);
    const rows = sqlDb.exec(this.sql, params);
    if (!rows.length || !rows[0].values.length) return undefined;
    const cols: string[] = rows[0].columns;
    const vals: any[] = rows[0].values[0];
    return Object.fromEntries(cols.map((c, i) => [c, vals[i]]));
  }

  all(...args: any[]): any[] {
    const params = this.normalise(args);
    const rows = sqlDb.exec(this.sql, params);
    if (!rows.length) return [];
    const cols: string[] = rows[0].columns;
    return rows[0].values.map((vals: any[]) =>
      Object.fromEntries(cols.map((c, i) => [c, vals[i]]))
    );
  }
}

class Database {
  prepare(sql: string): Statement { return new Statement(sql); }
  exec(sql: string): void { sqlDb.run(sql); }
  pragma(_: string): void { /* no-op for sql.js */ }
  transaction<T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: any[]) => {
      sqlDb.run('BEGIN');
      try {
        const result = fn(...args);
        sqlDb.run('COMMIT');
        saveDatabase();
        return result;
      } catch (e) {
        sqlDb.run('ROLLBACK');
        throw e;
      }
    }) as unknown as T;
  }
}

const db = new Database();
export default db;

// ─── Initialize: async because sql.js WASM returns a Promise ─────────────────
export async function initDatabase(): Promise<void> {
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const buf = fs.readFileSync(dbPath);
    sqlDb = new SQL.Database(buf);
    console.log('Loaded existing database from: ' + dbPath);
  } else {
    sqlDb = new SQL.Database();
    console.log('Created new database at: ' + dbPath);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS institutes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL DEFAULT 'university',
      city TEXT, website TEXT, logo_url TEXT,
      email_domains TEXT NOT NULL DEFAULT '[]',
      admin_user_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      institute_id TEXT,
      is_verified INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      avatar TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS teacher_profiles (
      user_id TEXT PRIMARY KEY, designation TEXT, department TEXT, employee_id TEXT
    );
    CREATE TABLE IF NOT EXISTS student_profiles (
      user_id TEXT PRIMARY KEY, roll_number TEXT, branch TEXT, semester INTEGER, department TEXT
    );
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL, subject TEXT NOT NULL, description TEXT,
      join_code TEXT UNIQUE NOT NULL,
      teacher_id TEXT NOT NULL, institute_id TEXT,
      banner_color TEXT DEFAULT '#2563EB',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS class_enrollments (
      class_id TEXT NOT NULL, student_id TEXT NOT NULL,
      enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (class_id, student_id)
    );
    CREATE TABLE IF NOT EXISTS lab_modules (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL, description TEXT,
      category TEXT NOT NULL DEFAULT 'programming',
      difficulty TEXT NOT NULL DEFAULT 'beginner',
      language TEXT NOT NULL DEFAULT 'python',
      teacher_id TEXT NOT NULL, class_id TEXT,
      exercises TEXT NOT NULL DEFAULT '[]',
      is_published INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      lab_module_id TEXT NOT NULL, class_id TEXT NOT NULL,
      title TEXT NOT NULL, description TEXT, due_date TEXT,
      max_marks INTEGER NOT NULL DEFAULT 100,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL, student_id TEXT NOT NULL,
      code TEXT, notes TEXT, marks INTEGER, feedback TEXT,
      status TEXT NOT NULL DEFAULT 'submitted',
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      graded_at TEXT,
      UNIQUE(assignment_id, student_id)
    );
    CREATE TABLE IF NOT EXISTS collab_sessions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'peer',
      class_id TEXT, host_id TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'python',
      initial_code TEXT DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL, token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      institute_id TEXT NOT NULL,
      member_a TEXT NOT NULL,
      member_b TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(member_a, member_b)
    );
    CREATE TABLE IF NOT EXISTS conversation_members (
      conversation_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      last_read_at TEXT,
      PRIMARY KEY (conversation_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      client_message_id TEXT,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(sender_id, client_message_id)
    );
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      link TEXT,
      read_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at);
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      institute_id TEXT NOT NULL,
      actor_id TEXT,
      actor_email TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT NOT NULL DEFAULT '',
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_audit_logs_institute_created ON audit_logs(institute_id, created_at);
    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      institute_id TEXT NOT NULL,
      class_id TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'reference',
      file_type TEXT NOT NULL DEFAULT 'link',
      file_size TEXT NOT NULL DEFAULT '',
      download_url TEXT NOT NULL,
      uploader_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_resources_institute_created ON resources(institute_id, created_at);
  `);
}
