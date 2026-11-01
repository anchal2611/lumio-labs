export type LabCategory = 
  | 'programming'
  | 'database'
  | 'web'
  | 'iot'
  | 'ai'
  | 'core_cs';

export type LabDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type SupportedLanguage = 
  | 'python'
  | 'cpp'
  | 'c'
  | 'java'
  | 'sql'
  | 'javascript'
  | 'html';

export interface VivaQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation: string;
}

export interface GuidedPractical {
  id: string;
  labId: string;
  practicalNumber: number;
  title: string;
  objective: string;
  theory: string;
  prerequisites: string[];
  procedure: string[];
  starterCode: string;
  defaultLanguage: SupportedLanguage;
  expectedOutput: string;
  vivaQuestions: VivaQuestion[];
  submissionRequirements: string[];
  maxMarks: number;
  tags: string[];
}

export interface LabItem {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: LabCategory;
  difficulty: LabDifficulty;
  iconName: string;
  experimentCount: number;
  supportedModes: ('guided' | 'workspace')[];
  tools: string[];
  estimatedHours: number;
  languages: SupportedLanguage[];
  isPopular?: boolean;
}
