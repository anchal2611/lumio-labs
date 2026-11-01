import type { Database, QueryExecResult } from 'sql.js';

export interface TableColumn {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

export interface TableSchema {
  name: string;
  columns: TableColumn[];
  rowCount: number;
}

export interface SqlQueryResult {
  columns: string[];
  values: any[][];
  executionTimeMs: number;
  rowsAffected: number;
  error?: string;
}

export type SampleDatabaseId = 'university' | 'library' | 'employee' | 'ecommerce';

export interface SampleDatabaseMeta {
  id: SampleDatabaseId;
  name: string;
  description: string;
  tableCount: number;
}

export const SAMPLE_DATABASES: SampleDatabaseMeta[] = [
  {
    id: 'university',
    name: 'University Academic DB',
    description: 'Students, departments, professors, courses, and historical course enrollments with grade scores.',
    tableCount: 5,
  },
  {
    id: 'library',
    name: 'Campus Library DB',
    description: 'Books, authors, categories, registered members, and borrowing transaction logs.',
    tableCount: 4,
  },
  {
    id: 'employee',
    name: 'Enterprise HR & Payroll DB',
    description: 'Staff profiles, departments, active engineering projects, and salary tier distributions.',
    tableCount: 4,
  },
  {
    id: 'ecommerce',
    name: 'TechStore E-Commerce DB',
    description: 'Customers, hardware products, shopping orders, and line-item fulfillment statuses.',
    tableCount: 4,
  },
];

class SqlEngineService {
  private SQL: any = null;
  private db: Database | null = null;
  private currentDbId: SampleDatabaseId = 'university';
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized && this.db) return;

    try {
      const sqlModule: any = await import('sql.js');
      const initSqlJs = sqlModule.default || (window as any).initSqlJs || sqlModule;

      this.SQL = await initSqlJs({
        locateFile: (file: string) => `/${file}`,
      });
      this.loadDatabase(this.currentDbId);
      this.isInitialized = true;
    } catch (err) {
      console.warn('Failed to load local sql-wasm.wasm; attempting CDN fallback', err);
      try {
        const sqlModule: any = await import('sql.js');
        const initSqlJs = sqlModule.default || (window as any).initSqlJs || sqlModule;
        this.SQL = await initSqlJs({
          locateFile: () => 'https://sql.js.org/dist/sql-wasm.wasm',
        });
        this.loadDatabase(this.currentDbId);
        this.isInitialized = true;
      } catch (e) {
        console.error('SQL Engine could not be initialized:', e);
      }
    }
  }

  loadDatabase(dbId: SampleDatabaseId): void {
    if (!this.SQL) return;
    this.currentDbId = dbId;
    this.db = new this.SQL.Database();

    const sqlScript = SEED_SCRIPTS[dbId] || SEED_SCRIPTS.university;
    this.db?.run(sqlScript);
  }

  getCurrentDatabaseId(): SampleDatabaseId {
    return this.currentDbId;
  }

  resetCurrentDatabase(): void {
    this.loadDatabase(this.currentDbId);
  }

  executeQuery(sql: string): SqlQueryResult {
    if (!this.db) {
      return {
        columns: [],
        values: [],
        executionTimeMs: 0,
        rowsAffected: 0,
        error: 'Database engine not initialized.',
      };
    }

    const start = performance.now();
    try {
      const results: QueryExecResult[] = this.db.exec(sql);
      const elapsed = Math.round((performance.now() - start) * 100) / 100;

      if (!results || results.length === 0) {
        // Query might be CREATE, INSERT, UPDATE, DELETE (no returned rows)
        const rowsModified = this.db.getRowsModified();
        return {
          columns: ['status'],
          values: [[`Query executed successfully. (${rowsModified} rows affected)`]],
          executionTimeMs: elapsed,
          rowsAffected: rowsModified,
        };
      }

      const firstResult = results[0];
      return {
        columns: firstResult.columns,
        values: firstResult.values,
        executionTimeMs: elapsed,
        rowsAffected: firstResult.values.length,
      };
    } catch (err: any) {
      const elapsed = Math.round((performance.now() - start) * 100) / 100;
      return {
        columns: [],
        values: [],
        executionTimeMs: elapsed,
        rowsAffected: 0,
        error: err?.message || 'SQL execution failed.',
      };
    }
  }

  getSchema(): TableSchema[] {
    if (!this.db) return [];

    try {
      const tablesResult = this.db.exec(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
      );
      if (!tablesResult || tablesResult.length === 0) return [];

      const tableNames = tablesResult[0].values.map((v) => v[0] as string);
      const schemas: TableSchema[] = [];

      for (const name of tableNames) {
        const columnsResult = this.db.exec(`PRAGMA table_info("${name}");`);
        const countResult = this.db.exec(`SELECT COUNT(*) FROM "${name}";`);

        const columns: TableColumn[] = columnsResult[0]?.values.map((row) => ({
          cid: row[0] as number,
          name: row[1] as string,
          type: row[2] as string,
          notnull: row[3] as number,
          dflt_value: row[4],
          pk: row[5] as number,
        })) || [];

        const rowCount = (countResult[0]?.values[0][0] as number) || 0;

        schemas.push({
          name,
          columns,
          rowCount,
        });
      }

      return schemas;
    } catch {
      return [];
    }
  }
}

export const sqlEngine = new SqlEngineService();

// Pre-seeded SQL schemas and data
const SEED_SCRIPTS: Record<SampleDatabaseId, string> = {
  university: `
    CREATE TABLE departments (
      department_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      building TEXT NOT NULL,
      budget REAL NOT NULL
    );

    INSERT INTO departments VALUES 
      (1, 'Computer Science', 'Turing Hall', 1250000.00),
      (2, 'Electrical Engineering', 'Maxwell Building', 980000.00),
      (3, 'Mechanical Engineering', 'Newton Center', 850000.00),
      (4, 'Mathematics', 'Euler Pavilion', 600000.00);

    CREATE TABLE professors (
      professor_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      department_id INTEGER,
      email TEXT UNIQUE,
      salary REAL,
      FOREIGN KEY(department_id) REFERENCES departments(department_id)
    );

    INSERT INTO professors VALUES
      (201, 'Prof. Marcus Vance', 1, 'marcus.vance@university.edu', 115000),
      (202, 'Dr. Eleanor Brooks', 1, 'eleanor.brooks@university.edu', 108000),
      (203, 'Dr. Aris Thorne', 2, 'aris.thorne@university.edu', 112000),
      (204, 'Dr. Fiona Gallagher', 4, 'fiona.g@university.edu', 98000);

    CREATE TABLE students (
      student_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      semester INTEGER NOT NULL,
      email TEXT UNIQUE,
      gpa REAL
    );

    INSERT INTO students VALUES
      (101, 'Alex Chen', 'Computer Science', 4, 'alex.chen@university.edu', 3.88),
      (102, 'Priya Sharma', 'Computer Science', 4, 'priya.sharma@university.edu', 3.92),
      (103, 'Liam O''Connor', 'Electrical Eng', 4, 'liam.o@university.edu', 3.65),
      (104, 'Maya Patel', 'Computer Science', 4, 'maya.patel@university.edu', 3.75),
      (105, 'David Kim', 'Mechanical Eng', 3, 'david.kim@university.edu', 3.42);

    CREATE TABLE courses (
      course_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      credits INTEGER NOT NULL,
      department_id INTEGER,
      professor_id INTEGER,
      FOREIGN KEY(department_id) REFERENCES departments(department_id),
      FOREIGN KEY(professor_id) REFERENCES professors(professor_id)
    );

    INSERT INTO courses VALUES
      ('CS401', 'Operating Systems', 4, 1, 201),
      ('CS402', 'Data Structures & Algorithms', 4, 1, 202),
      ('CS404', 'Relational Database Systems', 3, 1, 201),
      ('EE301', 'Microcontroller Architecture', 4, 2, 203),
      ('MATH201', 'Discrete Mathematics', 3, 4, 204);

    CREATE TABLE enrollments (
      enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id TEXT NOT NULL,
      semester INTEGER NOT NULL,
      score REAL,
      grade TEXT,
      FOREIGN KEY(student_id) REFERENCES students(student_id),
      FOREIGN KEY(course_id) REFERENCES courses(course_id)
    );

    INSERT INTO enrollments (student_id, course_id, semester, score, grade) VALUES
      (101, 'CS401', 4, 94.5, 'A'),
      (101, 'CS402', 4, 91.0, 'A'),
      (101, 'CS404', 4, 91.5, 'A'),
      (102, 'CS401', 4, 88.0, 'B+'),
      (102, 'CS402', 4, 96.0, 'A+'),
      (102, 'CS404', 4, 85.0, 'B'),
      (103, 'EE301', 4, 90.0, 'A'),
      (103, 'CS401', 4, 78.5, 'C+'),
      (104, 'CS404', 4, 87.0, 'B+'),
      (104, 'CS402', 4, 83.0, 'B');
  `,

  library: `
    CREATE TABLE authors (
      author_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT
    );

    INSERT INTO authors VALUES
      (1, 'Donald Knuth', 'USA'),
      (2, 'Andrew Tanenbaum', 'Netherlands'),
      (3, 'C.J. Date', 'UK'),
      (4, 'Abraham Silberschatz', 'USA');

    CREATE TABLE books (
      isbn TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author_id INTEGER,
      category TEXT NOT NULL,
      copies_available INTEGER NOT NULL,
      FOREIGN KEY(author_id) REFERENCES authors(author_id)
    );

    INSERT INTO books VALUES
      ('978-0201896831', 'The Art of Computer Programming', 1, 'Algorithms', 4),
      ('978-0133591620', 'Modern Operating Systems (4th Ed)', 2, 'Operating Systems', 6),
      ('978-0321197849', 'An Introduction to Database Systems', 3, 'Databases', 3),
      ('978-0078022159', 'Database System Concepts (7th Ed)', 4, 'Databases', 8);

    CREATE TABLE members (
      member_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      membership_type TEXT NOT NULL,
      join_date TEXT NOT NULL
    );

    INSERT INTO members VALUES
      (1001, 'Alex Chen', 'Student', '2024-08-20'),
      (1002, 'Priya Sharma', 'Student', '2024-08-22'),
      (1003, 'Prof. Marcus Vance', 'Faculty', '2021-09-01');

    CREATE TABLE borrow_records (
      record_id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      isbn TEXT NOT NULL,
      borrow_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      return_date TEXT,
      FOREIGN KEY(member_id) REFERENCES members(member_id),
      FOREIGN KEY(isbn) REFERENCES books(isbn)
    );

    INSERT INTO borrow_records (member_id, isbn, borrow_date, due_date, return_date) VALUES
      (1001, '978-0133591620', '2026-10-15', '2026-11-05', NULL),
      (1002, '978-0078022159', '2026-10-18', '2026-11-08', '2026-10-30'),
      (1003, '978-0201896831', '2026-09-10', '2026-12-10', NULL);
  `,

  employee: `
    CREATE TABLE departments (
      dept_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL
    );

    INSERT INTO departments VALUES
      (10, 'Engineering', 'Building A'),
      (20, 'Research & Development', 'Building B'),
      (30, 'Operations', 'Building C');

    CREATE TABLE employees (
      emp_id INTEGER PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      dept_id INTEGER,
      job_title TEXT NOT NULL,
      salary REAL NOT NULL,
      hire_date TEXT NOT NULL,
      FOREIGN KEY(dept_id) REFERENCES departments(dept_id)
    );

    INSERT INTO employees VALUES
      (1, 'Elena', 'Rostova', 10, 'Principal Architect', 165000, '2020-03-15'),
      (2, 'Marcus', 'Sterling', 10, 'Senior Backend Engineer', 135000, '2021-07-01'),
      (3, 'Sophia', 'Li', 20, 'Research Scientist', 145000, '2019-11-12'),
      (4, 'Tariq', 'Mansoor', 30, 'Site Reliability Lead', 128000, '2022-01-10');

    CREATE TABLE projects (
      project_id INTEGER PRIMARY KEY,
      project_name TEXT NOT NULL,
      budget REAL NOT NULL,
      status TEXT NOT NULL
    );

    INSERT INTO projects VALUES
      (101, 'LUMIO Cloud Virtual Labs', 2500000, 'Active'),
      (102, 'NextGen Kernel Microcontroller', 1200000, 'Active'),
      (103, 'Legacy Migration Pipeline', 450000, 'Completed');
  `,

  ecommerce: `
    CREATE TABLE customers (
      customer_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      country TEXT NOT NULL
    );

    INSERT INTO customers VALUES
      (1, 'Alice Smith', 'alice@example.com', 'USA'),
      (2, 'Bob Jones', 'bob@example.com', 'Canada'),
      (3, 'Carla Rossi', 'carla@example.com', 'Italy');

    CREATE TABLE products (
      product_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL
    );

    INSERT INTO products VALUES
      (101, 'ESP32 Development Board', 'Microcontrollers', 12.99, 450),
      (102, 'Solderless Breadboard 830-tie', 'Prototyping', 6.50, 800),
      (103, 'RGB LED Multipack (50pcs)', 'Components', 8.99, 1200),
      (104, 'Ultrasonic Distance Sensor HC-SR04', 'Sensors', 4.25, 320);

    CREATE TABLE orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      order_date TEXT NOT NULL,
      total_amount REAL NOT NULL,
      FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
    );

    INSERT INTO orders VALUES
      (1001, 1, '2026-10-25', 38.48),
      (1002, 2, '2026-10-28', 12.99),
      (1003, 3, '2026-10-30', 25.49);
  `,
};
