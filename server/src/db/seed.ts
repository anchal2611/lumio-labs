import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import db from './database';

export async function seedDatabase(): Promise<void> {
  // Check if already seeded
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@demo.lumio.app');
  if (existing) return;

  console.log('🌱 Seeding LUMIO demo data...');

  const instituteId = uuid();
  const adminId = uuid();
  const teacherId = uuid();
  const studentId = uuid();

  const adminHash = await bcrypt.hash('admin123', 10);
  const teacherHash = await bcrypt.hash('teacher123', 10);
  const studentHash = await bcrypt.hash('student123', 10);

  const domains = JSON.stringify(['demo.lumio.app']);

  // Insert demo institute
  db.prepare(`
    INSERT INTO institutes (id, name, slug, type, city, website, email_domains, admin_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(instituteId, 'LUMIO Demo Institute', 'lumio-demo', 'university', 'New Delhi', 'https://lumio.app', domains, adminId);

  // Insert admin
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, institute_id, is_verified, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(adminId, 'Dean Sarah Jenkins', 'admin@demo.lumio.app', adminHash, 'admin', instituteId, 1, 'active');

  // Insert teacher
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, institute_id, is_verified, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(teacherId, 'Prof. Marcus Vance', 'teacher@demo.lumio.app', teacherHash, 'teacher', instituteId, 1, 'active');

  db.prepare(`
    INSERT INTO teacher_profiles (user_id, designation, department, employee_id)
    VALUES (?, ?, ?, ?)
  `).run(teacherId, 'Associate Professor', 'Computer Science', 'EMP-001');

  // Insert student
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, institute_id, is_verified, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(studentId, 'Alex Chen', 'student@demo.lumio.app', studentHash, 'student', instituteId, 1, 'active');

  db.prepare(`
    INSERT INTO student_profiles (user_id, roll_number, branch, semester, department)
    VALUES (?, ?, ?, ?, ?)
  `).run(studentId, 'CS-2024-042', 'Software Engineering', 4, 'Computer Science');

  // Create a demo class
  const classId = uuid();
  const joinCode = 'LUMIO01';
  db.prepare(`
    INSERT INTO classes (id, name, subject, description, join_code, teacher_id, institute_id, banner_color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(classId, 'CSE301 — Data Structures & Algorithms', 'CSE301', 'Core programming and algorithm design class for 3rd semester students.', joinCode, teacherId, instituteId, '#7C3AED');

  // Enroll the demo student
  db.prepare(`
    INSERT INTO class_enrollments (class_id, student_id) VALUES (?, ?)
  `).run(classId, studentId);

  // Create a demo lab module with exercises
  const labId = uuid();
  const exercises = JSON.stringify([
    {
      id: uuid(),
      order: 1,
      title: 'Hello World & Variables',
      description: 'Write a program that prints "Hello, LUMIO!" and declares variables for name and age.',
      starterCode: '# Exercise 1: Hello World\n# Your task: Print "Hello, LUMIO!" and declare variables\n\n# Write your code below\n',
      expectedOutput: 'Hello, LUMIO!\nName: Alex\nAge: 20',
      hints: ['Use the print() function', 'Variables don\'t need type declarations in Python'],
      points: 10,
    },
    {
      id: uuid(),
      order: 2,
      title: 'List Operations',
      description: 'Create a list of 5 numbers, find the sum, maximum and minimum values.',
      starterCode: '# Exercise 2: List Operations\n# Create a list of 5 numbers and perform operations\n\nnumbers = []  # Add 5 numbers here\n\n# Find sum, max, min\n',
      expectedOutput: 'Sum: 150\nMax: 50\nMin: 10',
      hints: ['Use sum(), max(), min() built-in functions'],
      points: 15,
    },
    {
      id: uuid(),
      order: 3,
      title: 'Function Definition',
      description: 'Write a function called `factorial` that returns the factorial of a given number using recursion.',
      starterCode: '# Exercise 3: Recursive Factorial\n\ndef factorial(n):\n    # Your code here\n    pass\n\nprint(factorial(5))  # Expected: 120\nprint(factorial(0))  # Expected: 1\n',
      expectedOutput: '120\n1',
      hints: ['Base case: n == 0 returns 1', 'Recursive case: n * factorial(n-1)'],
      points: 25,
    },
  ]);

  db.prepare(`
    INSERT INTO lab_modules (id, title, description, category, difficulty, language, teacher_id, class_id, exercises, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(labId, 'Python Fundamentals — Week 1', 'Introduction to Python basics: variables, lists, and functions.', 'programming', 'beginner', 'python', teacherId, classId, exercises, 1);

  // Create a demo assignment
  const assignmentId = uuid();
  db.prepare(`
    INSERT INTO assignments (id, lab_module_id, class_id, title, description, due_date, max_marks)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(assignmentId, labId, classId, 'Python Week 1 Practical', 'Complete all 3 exercises from the Python Fundamentals lab module.', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), 50);

  console.log('✅ Seed data inserted successfully.');
  console.log('   📧 Admin:   admin@demo.lumio.app   / admin123');
  console.log('   📧 Teacher: teacher@demo.lumio.app / teacher123');
  console.log('   📧 Student: student@demo.lumio.app / student123');
  console.log('   🔑 Class Join Code: LUMIO01');
}
