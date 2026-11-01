import { create } from 'zustand';
import { Assignment, Submission } from '../types/assignment';
import { MOCK_ASSIGNMENTS, MOCK_SUBMISSIONS } from '../services/mockData';

interface AssignmentState {
  assignments: Assignment[];
  submissions: Submission[];
  selectedAssignment: Assignment | null;
  selectedSubmission: Submission | null;

  createAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'submissionCount' | 'totalStudents'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  submitAssignment: (sub: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => void;
  gradeSubmission: (id: string, marks: number, feedback: string, rubricScores?: Record<string, number>) => void;
  setSelectedAssignment: (assignment: Assignment | null) => void;
  setSelectedSubmission: (submission: Submission | null) => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  assignments: MOCK_ASSIGNMENTS,
  submissions: MOCK_SUBMISSIONS,
  selectedAssignment: MOCK_ASSIGNMENTS[0],
  selectedSubmission: MOCK_SUBMISSIONS[0],

  createAssignment: (newAsg) =>
    set((state) => {
      const assignment: Assignment = {
        ...newAsg,
        id: `asg-${Date.now()}`,
        createdAt: new Date().toISOString(),
        submissionCount: 0,
        totalStudents: 45,
      };
      return { assignments: [assignment, ...state.assignments] };
    }),

  updateAssignment: (id, updates) =>
    set((state) => ({
      assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),

  deleteAssignment: (id) =>
    set((state) => ({
      assignments: state.assignments.filter((a) => a.id !== id),
    })),

  submitAssignment: (sub) =>
    set((state) => {
      const existingIdx = state.submissions.findIndex(
        (s) => s.assignmentId === sub.assignmentId && s.studentId === sub.studentId
      );

      const submission: Submission = {
        ...sub,
        id: existingIdx >= 0 ? state.submissions[existingIdx].id : `sub-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: 'pending',
      };

      if (existingIdx >= 0) {
        const updated = [...state.submissions];
        updated[existingIdx] = submission;
        return { submissions: updated };
      }

      // Update submission count in assignment
      const updatedAssignments = state.assignments.map((a) =>
        a.id === sub.assignmentId ? { ...a, submissionCount: a.submissionCount + 1 } : a
      );

      return {
        submissions: [submission, ...state.submissions],
        assignments: updatedAssignments,
      };
    }),

  gradeSubmission: (id, marks, feedback, rubricScores) =>
    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'graded',
              marksObtained: marks,
              feedback,
              gradedBy: 'Prof. Marcus Vance',
              gradedAt: new Date().toISOString(),
              rubricScores,
            }
          : s
      ),
    })),

  setSelectedAssignment: (assignment) => set({ selectedAssignment: assignment }),
  setSelectedSubmission: (submission) => set({ selectedSubmission: submission }),
}));
