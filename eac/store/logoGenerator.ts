// Logo Generator Store
// /Users/matthewsimon/Projects/eac/eac/store/logoGenerator.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface GeneratedLogo {
  imageUrl: string;
  imageData: string;
  prompt: string;
  brief: {
    companyName: string;
    businessDescription?: string;
    industry: string;
    stylePreference: string;
    colorPreferences: string[];
    logoType: string;
    targetAudience: string;
    additionalInstructions?: string;
  };
  generatedAt: number;
}

interface LogoGeneratorState {
  // Current generated logo
  currentLogo: GeneratedLogo | null;
  // Logo generation history for variations
  logoHistory: GeneratedLogo[];
  // Generation state
  isGenerating: boolean;
  // Selected logo from history (for variations)
  selectedHistoryIndex: number | null;
  
  // Actions
  setCurrentLogo: (logo: GeneratedLogo) => void;
  addToHistory: (logo: GeneratedLogo) => void;
  setIsGenerating: (generating: boolean) => void;
  selectFromHistory: (index: number) => void;
  clearCurrentLogo: () => void;
  clearHistory: () => void;
}

export const useLogoGeneratorStore = create<LogoGeneratorState>()(
  devtools(
    (set, get) => ({
      // State
      currentLogo: null,
      logoHistory: [],
      isGenerating: false,
      selectedHistoryIndex: null,
      
      // Actions
      setCurrentLogo: (logo) => {
        set((state) => ({
          currentLogo: logo,
          logoHistory: [logo, ...state.logoHistory.slice(0, 9)] // Keep last 10
        }));
      },
      
      addToHistory: (logo) => {
        set((state) => ({
          logoHistory: [logo, ...state.logoHistory.slice(0, 9)]
        }));
      },
      
      setIsGenerating: (generating) => {
        set({ isGenerating: generating });
      },
      
      selectFromHistory: (index) => {
        const history = get().logoHistory;
        if (index >= 0 && index < history.length) {
          set({
            currentLogo: history[index],
            selectedHistoryIndex: index
          });
        }
      },
      
      clearCurrentLogo: () => {
        set({ currentLogo: null, selectedHistoryIndex: null });
      },
      
      clearHistory: () => {
        set({ logoHistory: [], selectedHistoryIndex: null });
      }
    }),
    { name: 'logo-generator-store' }
  )
);
