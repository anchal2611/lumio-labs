import path from 'path';
import fs from 'fs';

// ─── Setup storage path ───────────────────────────────────────────────────────
const dbDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, 'lumio.db');

// ─── Load sql.js (pure WASM, no native build needed) ─────────────────────────
// eslint-disable-next-line @typescript-eslint/no-var-requires
const initSqlJs = require('sql.js');

let sqlDb: any = null;

/** Load or create the SQLite database from disk */
function loadDatabase(): any {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const SQL = initSqlJs();  // synchronous in sql.js v1.x
  if (fs.existsSync(dbPath)) {
    const filebuffer = fs.readFileSync(dbPath);
    return new SQL.Database(filebuffer);
  }
  return new SQL.Database();
}

/** Persist in-memory database back to disk */
function saveDatabase(): void {
  if (!sqlDb) return;
  const data: Uint8Array = sqlDb.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

// Save to disk every 10 seconds and on process exit
setInterval(saveDatabase, 10_000);
process.on('exit', saveDatabase);
process.on('SIGINT', () => { saveDatabase(); process.exit(0); });
process.on('SIGTERM', () => { saveDatabase(); process.exit(0); });

// ─── Thin wrapper matching better-sqlite3's synchronous API ──────────────────
interface StmtResult { lastInsertRowid: number | bigint; changes: number }

class Statement {
  private sql: string;
  constructor(sql: string) { this.sql = sql; }

  run(...args: any[]): StmtResult {
    const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
    sqlDb.run(this.sql, params);
    // sql.js doesn't expose lastInsertRowid directly — query it
    const rows = sqlDb.exec('SELECT last_insert_rowid() as id, changes() as ch');
    const vals = rows[0]?.values[0] ?? [0, 0];
    return { lastInsertRowid: vals[0] as number, changes: vals[1] as number };
  }

  get(...args: any[]): any {
    const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
    const rows = sqlDb.exec(this.sql, params);
    if (!rows.length || !rows[0].values.length) return undefined;
    const cols = rows[0].columns;
    const vals = rows[0].values[0];
    return Object.fromEntries(cols.map((c: string, i: number) => [c, vals[i]]));
  }

  all(...args: any[]): any[] {
    const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
    const rows = sqlDb.exec(this.sql, params);
    if (!rows.length) return [];
    const cols = rows[0].columns;
    return rows[0].values.map((vals: any[]) =>
      Object.fromEntries(cols.map((c: string, i: number) => [c, vals[i]]))
    );
  }
}

class Database {
  prepare(sql: string): Statement { return new Statement(sql); }

  exec(sql: string): void { sqlDb.run(sql); }

  pragma(pragma: string): void { sqlDb.run(`PRAGMA ${pragma}`); }

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

// Singleton db instance
const db = new Database();
export default db;

// ─── Schema ───────────────────────────────────────────────────────────────────
export function initDatabase(): void {
  // Initialize sql.js synchronously
  sqlDb = loadDatabase();

  db.exec(`
    CREATE TABLE IF NOT EXISTS institutes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL DEFAULT 'university',
      city TEXT,
      website TEXT,
      logo_url TEXT,
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
      user_id TEXT PRIMARY KEY,
      designation TEXT,
      department TEXT,
      employee_id TEXT
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      user_id TEXT PRIMARY KEY,
      roll_number TEXT,
      branch TEXT,
      semester INTEGER,
      department TEXT
    );

    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT,
      join_code TEXT UNIQUE NOT NULL,
      teacher_id TEXT NOT NULL,
      institute_id TEXT,
      banner_color TEXT DEFAULT '#2563EB',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS class_enrollments (
      class_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (class_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS lab_modules (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'programming',
      difficulty TEXT NOT NULL DEFAULT 'beginner',
      language TEXT NOT NULL DEFAULT 'python',
      teacher_id TEXT NOT NULL,
      class_id TEXT,
      exercises TEXT NOT NULL DEFAULT '[]',
      is_published INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      lab_module_id TEXT NOT NULL,
      class_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      max_marks INTEGER NOT NULL DEFAULT 100,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      code TEXT,
      notes TEXT,
      marks INTEGER,
      feedback TEXT,
      status TEXT NOT NULL DEFAULT 'submitted',
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      graded_at TEXT,
      UNIQUE(assignment_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS collab_sessions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'peer',
      class_id TEXT,
      host_id TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'python',
      initial_code TEXT DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  console.log(`🗄️  Database ready at: ${dbPath}`);
}
