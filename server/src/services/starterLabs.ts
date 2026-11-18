import db from '../db/database';

const INSTITUTE_STARTER_LABS = [
  {
    key: 'python',
    title: 'Python Foundations',
    description: 'Begin with Python output, variables, and small data collections.',
    category: 'programming',
    difficulty: 'beginner',
    language: 'python',
    exercises: [
      {
        order: 1,
        title: 'Print a greeting',
        description: 'Use print() to display the greeting shown in the expected output.',
        starterCode: '# Print a greeting\n',
        expectedOutput: 'Hello, LUMIO!',
        hints: ['Use the print() function.'],
        points: 10,
      },
      {
        order: 2,
        title: 'Work with a list',
        description: 'Create a list of three numbers and print their total.',
        starterCode: 'numbers = [4, 7, 9]\n# Print the sum of the numbers\n',
        expectedOutput: '20',
        hints: ['Try the built-in sum() function.'],
        points: 10,
      },
    ],
  },
  {
    key: 'sql',
    title: 'SQL Foundations',
    description: 'Practice selecting, filtering, and sorting records in the browser SQL workspace.',
    category: 'database',
    difficulty: 'beginner',
    language: 'sql',
    exercises: [
      {
        order: 1,
        title: 'Select rows',
        description: 'Select the requested columns from a table available in the SQL workspace.',
        starterCode: '-- Select columns from a table in the workspace\nSELECT 1 AS first_query;\n',
        expectedOutput: '1',
        hints: ['A SELECT statement can return a value without reading a table.'],
        points: 10,
      },
      {
        order: 2,
        title: 'Filter a result',
        description: 'Add a WHERE clause to return only rows matching a condition.',
        starterCode: "SELECT 'LUMIO' AS platform WHERE 1 = 1;\n",
        expectedOutput: 'LUMIO',
        hints: ['Use WHERE to filter rows.'],
        points: 10,
      },
    ],
  },
  {
    key: 'javascript',
    title: 'JavaScript Foundations',
    description: 'Write small programs and see their output in the JavaScript workspace.',
    category: 'programming',
    difficulty: 'beginner',
    language: 'javascript',
    exercises: [
      {
        order: 1,
        title: 'Log a message',
        description: 'Use console.log() to print the expected message.',
        starterCode: '// Print a message\n',
        expectedOutput: 'Hello, LUMIO!',
        hints: ['Pass a string to console.log().'],
        points: 10,
      },
      {
        order: 2,
        title: 'Calculate a total',
        description: 'Add the numbers and log their total.',
        starterCode: 'const numbers = [4, 7, 9];\n// Log the total\n',
        expectedOutput: '20',
        hints: ['The reduce() method can combine array values.'],
        points: 10,
      },
    ],
  },
];

export function ensureInstituteStarterLabs(instituteId: string, adminId: string): void {
  const admin = db.prepare('SELECT id FROM users WHERE id = ? AND institute_id = ? AND role = ?').get(adminId, instituteId, 'admin');
  if (!admin) return;

  const insertLab = db.prepare(`
    INSERT INTO lab_modules (id, title, description, category, difficulty, language, teacher_id, class_id, exercises, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, 1)
  `);

  for (const lab of INSTITUTE_STARTER_LABS) {
    const labId = `starter-${instituteId}-${lab.key}`;
    if (db.prepare('SELECT id FROM lab_modules WHERE id = ?').get(labId)) continue;
    const exercises = lab.exercises.map((exercise) => ({ ...exercise, id: `${lab.key}-${exercise.order}` }));
    insertLab.run(
      labId,
      lab.title,
      lab.description,
      lab.category,
      lab.difficulty,
      lab.language,
      adminId,
      JSON.stringify(exercises),
    );
  }
}

export function ensureStarterLabsForAllInstitutes(): void {
  const institutes = db.prepare('SELECT id, admin_user_id FROM institutes WHERE admin_user_id IS NOT NULL').all() as Array<{ id: string; admin_user_id: string }>;
  for (const institute of institutes) ensureInstituteStarterLabs(institute.id, institute.admin_user_id);
}
