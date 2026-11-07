import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { apiGet, apiPost } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface AssignmentModalProps { isOpen: boolean; onClose: () => void; onCreated?: () => void; }
type ClassItem = { id: string; name: string; subject: string };
type LabItem = { id: string; title: string; class_id: string | null; language: string };

export const AssignmentModal: React.FC<AssignmentModalProps> = ({ isOpen, onClose, onCreated }) => {
  const toast = useToast();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [labs, setLabs] = useState<LabItem[]>([]);
  const [classId, setClassId] = useState('');
  const [labId, setLabId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const availableLabs = useMemo(() => labs.filter((lab) => !lab.class_id || lab.class_id === classId), [labs, classId]);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true); setError('');
    Promise.all([apiGet<{ classes: ClassItem[] }>('/classes'), apiGet<{ labs: LabItem[] }>('/labs')])
      .then(([classData, labData]) => { setClasses(classData.classes || []); setLabs(labData.labs || []); })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load classes and labs.'))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!classId || !labId) { setError('Choose a class and one of its labs.'); return; }
    setSaving(true); setError('');
    try {
      await apiPost('/assignments', { classId, labModuleId: labId, title: title.trim(), description: description.trim(), dueDate: dueDate || undefined, maxMarks });
      toast.success('Assignment created', 'The assignment is now available to students in this class.');
      setTitle(''); setDescription(''); setDueDate(''); setMaxMarks(100); setClassId(''); setLabId('');
      onClose(); onCreated?.();
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not create assignment.'); }
    finally { setSaving(false); }
  };

  return <Modal isOpen={isOpen} onClose={onClose} title="Create assignment" description="Choose a class and lab, then set the assignment details." maxWidth="2xl">
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <label className="block"><span className="mb-1 block text-xs font-semibold text-navy-900">Class</span><select required value={classId} onChange={(e) => { setClassId(e.target.value); setLabId(''); }} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm"><option value="">{loading ? 'Loading classes…' : 'Select a class'}</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.subject}</option>)}</select></label>
      <label className="block"><span className="mb-1 block text-xs font-semibold text-navy-900">Lab module</span><select required value={labId} onChange={(e) => setLabId(e.target.value)} disabled={!classId || loading} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm"><option value="">{classId ? 'Select a lab' : 'Select a class first'}</option>{availableLabs.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.language.toUpperCase()}</option>)}</select></label>
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={160} />
      <label className="block"><span className="mb-1 block text-xs font-semibold text-navy-900">Description</span><textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full resize-y rounded-lg border border-slate-300 p-3 text-sm" maxLength={4000} /></label>
      <div className="grid gap-3 sm:grid-cols-2"><Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /><Input label="Maximum marks" type="number" min={1} max={10000} value={maxMarks} onChange={(e) => setMaxMarks(Number(e.target.value))} required /></div>
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3"><Button size="sm" type="button" variant="outline" onClick={onClose}>Cancel</Button><Button size="sm" type="submit" disabled={saving || loading || !classes.length || !availableLabs.length}>{saving ? 'Creating…' : 'Create assignment'}</Button></div>
    </form>
  </Modal>;
};
