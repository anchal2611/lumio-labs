import { create } from 'zustand';
import { LabItem, GuidedPractical, SupportedLanguage } from '../types/lab';
import { Experiment } from '../types/experiment';

interface LabState {
  labs: LabItem[];
  currentUserId: string;
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
  setCurrentUserId: (userId: string) => void;
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
  labs: [],
  currentUserId: '',
  selectedCategory: 'all',
  searchQuery: '',
  activeLab: null,
  activeMode: 'guided',
  activePractical: null,
  savedExperiments: [],
  currentCode: '',
  currentLanguage: 'python',
  terminalOutput: '',
  terminalStderr: '',
  isExecuting: false,
  activeTab: 'main.py',

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCurrentUserId: (userId) => set({ currentUserId: userId }),
  setActiveLab: (lab) => {
    if (!lab) {
      set({ activeLab: null, activePractical: null });
      return;
    }
    const defaultLang = lab.languages[0] || 'python';
    set({
      activeLab: lab,
      activePractical: null,
      currentLanguage: defaultLang,
      currentCode: '',
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
        userId: state.currentUserId,
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
