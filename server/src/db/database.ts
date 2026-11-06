import BetterSQLite3 from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Store DB file in /data dir for Render persistent disk, fallback to cwd
const dbDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, 'lumio.db');
const db = new BetterSQLite3(dbPath);

// Enable WAL for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase(): void {
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
      role TEXT NOT NULL CHECK(role IN ('student','teacher','admin')),
      institute_id TEXT REFERENCES institutes(id),
      is_verified INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive','suspended')),
      avatar TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS teacher_profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      designation TEXT,
      department TEXT,
      employee_id TEXT
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
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
      teacher_id TEXT NOT NULL REFERENCES users(id),
      institute_id TEXT REFERENCES institutes(id),
      banner_color TEXT DEFAULT '#2563EB',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS class_enrollments (
      class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
      teacher_id TEXT NOT NULL REFERENCES users(id),
      class_id TEXT REFERENCES classes(id),
      exercises TEXT NOT NULL DEFAULT '[]',
      is_published INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      lab_module_id TEXT NOT NULL REFERENCES lab_modules(id) ON DELETE CASCADE,
      class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      max_marks INTEGER NOT NULL DEFAULT 100,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code TEXT,
      notes TEXT,
      marks INTEGER,
      feedback TEXT,
      status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','graded','returned')),
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      graded_at TEXT,
      UNIQUE(assignment_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS collab_sessions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'peer' CHECK(type IN ('peer','faculty','class')),
      class_id TEXT REFERENCES classes(id),
      host_id TEXT NOT NULL REFERENCES users(id),
      language TEXT NOT NULL DEFAULT 'python',
      initial_code TEXT DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_institute ON users(institute_id);
    CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_student ON class_enrollments(student_id);
    CREATE INDEX IF NOT EXISTS idx_labs_class ON lab_modules(class_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
  `);
}

export default db;
