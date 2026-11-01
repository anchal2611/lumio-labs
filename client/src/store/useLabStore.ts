import { create } from 'zustand';
import { LabItem, GuidedPractical, SupportedLanguage } from '../types/lab';
import { Experiment } from '../types/experiment';
import { MOCK_LABS, MOCK_GUIDED_PRACTICALS } from '../services/mockData';

interface LabState {
  labs: LabItem[];
  selectedCategory: string;
  searchQuery: string;
  activeLab: LabItem | null;
  activeMode: 'guided' | 'workspace';
  activePractical: GuidedPractical | null;
  savedExperiments: Experiment[];
  currentCode: string;
  currentLanguage: SupportedLanguage;
  terminalOutput: string;
  terminalStderr: string;
  isExecuting: boolean;
  activeTab: string;

  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setActiveLab: (lab: LabItem | null) => void;
  setActiveMode: (mode: 'guided' | 'workspace') => void;
  setActivePractical: (practical: GuidedPractical | null) => void;
  setCurrentCode: (code: string) => void;
  setCurrentLanguage: (lang: SupportedLanguage) => void;
  setTerminalOutput: (stdout: string, stderr?: string) => void;
  clearTerminal: () => void;
  setIsExecuting: (val: boolean) => void;
  setActiveTab: (tab: string) => void;
  saveExperiment: (experiment: Partial<Experiment>) => void;
}

export const useLabStore = create<LabState>((set) => ({
  labs: MOCK_LABS,
  selectedCategory: 'all',
  searchQuery: '',
  activeLab: MOCK_LABS[0],
  activeMode: 'guided',
  activePractical: MOCK_GUIDED_PRACTICALS['lab-python']?.[0] || null,
  savedExperiments: [
    {
      id: 'exp-01',
      userId: 'usr_student_01',
      labId: 'lab-python',
      title: 'Searching Algorithms Benchmark',
      language: 'python',
      code: MOCK_GUIDED_PRACTICALS['lab-python']?.[0]?.starterCode || '',
      files: [{ name: 'main.py', content: MOCK_GUIDED_PRACTICALS['lab-python']?.[0]?.starterCode || '', language: 'python' }],
      lastStdout: '=== LUMIO VIRTUAL LAB: SEARCH ALGORITHMS ===\nDataset: [12, 24, 35, 47, 59, 68, 77, 88, 99]\n[Result] Linear Search Found at Index: 5\n[Result] Binary Search Found at Index: 5',
      executionStatus: 'success',
      executionTimeMs: 24,
      memoryKb: 4120,
      isSaved: true,
      isShared: false,
      createdAt: '2026-10-30T10:00:00Z',
      updatedAt: '2026-10-31T12:00:00Z',
      tags: ['Python', 'DSA'],
    },
  ],
  currentCode: MOCK_GUIDED_PRACTICALS['lab-python']?.[0]?.starterCode || '',
  currentLanguage: 'python',
  terminalOutput: '',
  terminalStderr: '',
  isExecuting: false,
  activeTab: 'main.py',

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveLab: (lab) => {
    if (!lab) {
      set({ activeLab: null, activePractical: null });
      return;
    }
    const practicals = MOCK_GUIDED_PRACTICALS[lab.id];
    const defaultPractical = practicals && practicals.length > 0 ? practicals[0] : null;
    const defaultLang = lab.languages[0] || 'python';
    set({
      activeLab: lab,
      activePractical: defaultPractical,
      currentLanguage: defaultLang,
      currentCode: defaultPractical?.starterCode || `// Welcome to LUMIO ${lab.name}\n// Mode: Open Workspace\n\n`,
      terminalOutput: '',
      terminalStderr: '',
    });
  },
  setActiveMode: (mode) => set({ activeMode: mode }),
  setActivePractical: (practical) =>
    set({
      activePractical: practical,
      currentCode: practical?.starterCode || '',
      currentLanguage: practical?.defaultLanguage || 'python',
      terminalOutput: '',
      terminalStderr: '',
    }),
  setCurrentCode: (code) => set({ currentCode: code }),
  setCurrentLanguage: (lang) => set({ currentLanguage: lang }),
  setTerminalOutput: (stdout, stderr = '') => set({ terminalOutput: stdout, terminalStderr: stderr }),
  clearTerminal: () => set({ terminalOutput: '', terminalStderr: '' }),
  setIsExecuting: (val) => set({ isExecuting: val }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  saveExperiment: (expData) =>
    set((state) => {
      const newExp: Experiment = {
        id: `exp-${Date.now()}`,
        userId: 'usr_student_01',
        labId: state.activeLab?.id || 'lab-custom',
        title: expData.title || `${state.activeLab?.name || 'Experiment'} ${state.savedExperiments.length + 1}`,
        language: state.currentLanguage,
        code: state.currentCode,
        files: [{ name: state.activeTab, content: state.currentCode, language: state.currentLanguage }],
        lastStdout: state.terminalOutput,
        lastStderr: state.terminalStderr,
        executionStatus: state.terminalStderr ? 'error' : 'success',
        isSaved: true,
        isShared: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: state.activeLab ? [state.activeLab.category, state.currentLanguage] : [],
      };
      return { savedExperiments: [newExp, ...state.savedExperiments] };
    }),
}));
