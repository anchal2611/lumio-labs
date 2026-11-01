import { UserRole } from './auth';

export type ResourceCategory = 
  | 'manuals'
  | 'code_snippets'
  | 'lecture_notes'
  | 'datasets'
  | 'circuit_diagrams'
  | 'experiment_templates';

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  fileType: 'pdf' | 'zip' | 'py' | 'cpp' | 'sql' | 'json' | 'image';
  fileSize: string;
  downloadUrl: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  downloadCount: number;
  uploadedAt: string;
  tags: string[];
  isFacultyOnly?: boolean;
}
