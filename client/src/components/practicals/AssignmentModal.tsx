import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Assignment } from '../../types/assignment';
import { useAuth } from '../../contexts/AuthContext';
import { useAssignmentStore } from '../../store/useAssignmentStore';
import { useToast } from '../../contexts/ToastContext';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { createAssignment } = useAssignmentStore();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [labId, setLabId] = useState('lab-cpp');
  const [subjectCode, setSubjectCode] = useState('CS402-DSA');
  const [deadline, setDeadline] = useState('2026-11-25');
  const [maxMarks, setMaxMarks] = useState(30);
  const [instructionsText, setInstructionsText] = useState('1. Implement functions.\n2. Verify edge cases.');
  const [starterCode, setStarterCode] = useState('// Starter code template\n#include <iostream>\nint main() {\n    return 0;\n}');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    createAssignment({
      title: title.trim(),
      description: description.trim(),
      labId,
      labName: labId === 'lab-cpp' ? 'C / C++ Systems Lab' : labId === 'lab-sql' ? 'Relational DBMS & SQL Lab' : 'Python Computing & Algorithms',
      teacherId: user.id,
      teacherName: user.name,
      department: user.department,
      semester: 4,
      subjectCode,
      deadline: `${deadline}T23:59:59Z`,
      maxMarks,
      status: 'published',
      starterCode,
      language: labId === 'lab-cpp' ? 'cpp' : labId === 'lab-sql' ? 'sql' : 'python',
      instructions: instructionsText.split('\n').filter((l) => l.trim()),
      rubrics: [
        { id: 'r1', criterion: 'Algorithm correctness and edge cases', maxMarks: Math.round(maxMarks * 0.6) },
        { id: 'r2', criterion: 'Code cleanliness and documentation', maxMarks: Math.round(maxMarks * 0.4) },
      ],
    });

    toast.success('Assignment Published', 'New practical published to student dashboard.');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Practical Assignment"
      description="Define assignment parameters, deadline, evaluation rubrics, and starter code."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Input
          label="Assignment Title"
          placeholder="e.g. Practical 5: Red-Black Tree Balancing"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">Target Laboratory</label>
            <select
              value={labId}
              onChange={(e) => setLabId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-brand-text focus:outline-none focus:border-primary"
            >
              <option value="lab-cpp">C / C++ Systems Lab</option>
              <option value="lab-python">Python Computing & Algorithms</option>
              <option value="lab-sql">Relational DBMS & SQL Lab</option>
              <option value="lab-iot">IoT & Virtual Circuit Laboratory</option>
            </select>
          </div>

          <Input
            label="Subject Code"
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
            required
          />

          <Input
            label="Deadline Date"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy-900 mb-1">Assignment Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly state the goal and academic context..."
            className="w-full rounded-lg border border-slate-300 p-2 text-xs text-brand-text placeholder:text-slate-400 focus:outline-none focus:border-primary resize-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy-900 mb-1">
            Starter Code Template (Pre-filled for students)
          </label>
          <textarea
            rows={5}
            value={starterCode}
            onChange={(e) => setStarterCode(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-navy-950 font-mono text-emerald-300 p-2 text-xs focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button size="sm" variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" type="submit">
            Publish Assignment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
