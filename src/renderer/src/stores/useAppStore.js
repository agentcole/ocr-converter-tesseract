import { create } from 'zustand'

const useAppStore = create((set, get) => ({
  // Onboarding
  onboardingComplete: false,
  currentStep: 0,

  // System info
  systemInfo: null,

  // Language selection
  selectedLanguages: ['eng'],

  // Installation
  installLog: [],
  installStatus: 'idle', // 'idle' | 'running' | 'success' | 'error'

  // Navigation
  currentView: 'converter', // 'converter' | 'settings'

  // Converter
  queuedFiles: [],
  conversionResults: [],
  outputFormat: 'docx',
  outputDir: '',

  // Actions
  setCurrentView: (view) => set({ currentView: view }),
  setOnboardingComplete: (v) => set({ onboardingComplete: v }),

  resetOnboarding: () => set({
    onboardingComplete: false,
    currentStep: 0,
    systemInfo: null,
    installLog: [],
    installStatus: 'idle',
    currentView: 'converter',
  }),
  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () => set(s => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set(s => ({ currentStep: Math.max(0, s.currentStep - 1) })),

  setSystemInfo: (info) => set({ systemInfo: info }),

  toggleLanguage: (lang) => set(s => {
    if (lang === 'eng') return s // can't deselect English
    const has = s.selectedLanguages.includes(lang)
    return {
      selectedLanguages: has
        ? s.selectedLanguages.filter(l => l !== lang)
        : [...s.selectedLanguages, lang]
    }
  }),

  appendInstallLog: (line) => set(s => ({ installLog: [...s.installLog, line] })),
  clearInstallLog: () => set({ installLog: [] }),
  setInstallStatus: (status) => set({ installStatus: status }),

  addQueuedFiles: (files) => set(s => ({
    queuedFiles: [...s.queuedFiles, ...files.map(f => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      name: f.name,
      size: f.size,
      status: 'queued', // queued | processing | done | error
      progress: 0,
      outputPath: null,
      error: null
    }))]
  })),
  removeQueuedFile: (id) => set(s => ({ queuedFiles: s.queuedFiles.filter(f => f.id !== id) })),
  updateFileStatus: (id, update) => set(s => ({
    queuedFiles: s.queuedFiles.map(f => f.id === id ? { ...f, ...update } : f)
  })),
  clearQueue: () => set({ queuedFiles: [] }),

  setOutputFormat: (fmt) => set({ outputFormat: fmt }),
  setOutputDir: (dir) => set({ outputDir: dir }),
}))

export default useAppStore
