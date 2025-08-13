// Onboarding Store
// /Users/matthewsimon/Projects/eac/eac/store/onboarding.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  isOnboardingComplete: boolean;
  hasShownWelcome: boolean;
  isOnboardingActive: boolean;
  currentStep: 'welcome' | 'interest' | 'sharing' | 'audience' | 'goals' | 'personality' | 'url-input' | 'analyzing' | 'complete' | null;
  currentUserId: string | null; // Track current user
  
  // Store responses for brand framework generation
  responses: {
    interest?: string;
    sharing?: string;
    audience?: string;
    goals?: string;
    personality?: string;
    url?: string;
  };
  
  // Actions
  setOnboardingComplete: (complete: boolean) => void;
  setHasShownWelcome: (shown: boolean) => void;
  setOnboardingActive: (active: boolean) => void;
  setCurrentStep: (step: OnboardingState['currentStep']) => void;
  setResponse: (key: keyof OnboardingState['responses'], value: string) => void;
  resetOnboarding: () => void;
  completeOnboarding: () => void;
  setCurrentUser: (userId: string | null) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      isOnboardingComplete: false,
      hasShownWelcome: false,
      isOnboardingActive: false,
      currentStep: null,
      currentUserId: null,
      responses: {},
      
      setOnboardingComplete: (complete) => set({ isOnboardingComplete: complete }),
      setHasShownWelcome: (shown) => set({ hasShownWelcome: shown }),
      setOnboardingActive: (active) => set({ isOnboardingActive: active }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setResponse: (key, value) => set((state) => ({
        responses: { ...state.responses, [key]: value }
      })),
      
      resetOnboarding: () => set({
        isOnboardingComplete: false,
        hasShownWelcome: false,
        isOnboardingActive: false,
        currentStep: null,
        responses: {},
      }),
      
      completeOnboarding: () => set({
        isOnboardingComplete: true,
        isOnboardingActive: false,
        currentStep: 'complete',
      }),
      
      setCurrentUser: (userId) => {
        const state = get();
        // If this is a different user, reset onboarding state
        if (state.currentUserId !== userId) {
          set({
            currentUserId: userId,
            isOnboardingComplete: false,
            hasShownWelcome: false,
            isOnboardingActive: false,
            currentStep: null,
            responses: {},
          });
        }
      },
    }),
    {
      name: 'eac-onboarding-storage',
      // Store per user session with user ID tracking
      partialize: (state) => ({
        isOnboardingComplete: state.isOnboardingComplete,
        hasShownWelcome: state.hasShownWelcome,
        currentStep: state.currentStep,
        currentUserId: state.currentUserId,
      }),
    }
  )
);
