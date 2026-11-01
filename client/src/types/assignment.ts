import { SupportedLanguage } from './lab';

export interface RubricCriterion {
  id: string;
  criterion: string;
  maxMarks: number;
}

export type AssignmentStatus = 'published' | 'draft' | 'archived';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  labId: string;
  labName: string;
  practicalId?: string;
  teacherId: string;
  teacherName: string;
  department: string;
  semester: number;
  subjectCode: string;
  deadline: string;
  maxMarks: number;
  status: AssignmentStatus;
  starterCode: string;
  language: SupportedLanguage;
  instructions: string[];
  rubrics: RubricCriterion[];
  submissionCount: number;
  totalStudents: number;
  createdAt: string;
  attachments?: { name: string; url: string; size: string }[];
}

export type SubmissionStatus = 'pending' | 'graded' | 'resubmission_requested';

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentRollNo: string;
  submittedAt: string;
  code: string;
  stdout?: string;
  notes?: string;
  status: SubmissionStatus;
  marksObtained?: number;
  maxMarks: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  rubricScores?: Record<string, number>;
}
