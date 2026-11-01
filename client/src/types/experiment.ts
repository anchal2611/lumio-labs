import { SupportedLanguage } from './lab';

export interface ExperimentFile {
  name: string;
  content: string;
  language: SupportedLanguage;
}

export interface Experiment {
  id: string;
  userId: string;
  labId: string;
  title: string;
  description?: string;
  language: SupportedLanguage;
  code: string;
  files: ExperimentFile[];
  stdin?: string;
  lastStdout?: string;
  lastStderr?: string;
  executionStatus?: 'success' | 'error' | 'timeout' | 'idle';
  executionTimeMs?: number;
  memoryKb?: number;
  isSaved: boolean;
  isShared: boolean;
  shareCode?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}
