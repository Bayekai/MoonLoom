import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserProfile = {
  id: string;
  primaryGoal: string | null;
  timezone: string;
  foodBalance: number;
  bondLevel: number;
  createdAt: string;
  shiftStart?: string;
  shiftEnd?: string;
  onboarded: boolean;
};

export type SleepSession = {
  id: string;
  userId: string;
  bedtime: string;
  wakeTime: string;
  durationMs: number;
  rating?: string; // Exhausted, Tired, Okay, Good, Excellent
};

export type LifestyleEvent = {
  id: string;
  userId: string;
  type: string; // caffeine, exercise, screen, etc.
  timestamp: string;
  value?: string;
};

export type WorkBreak = {
  id: string;
  userId: string;
  scheduledTime: string;
  durationMinutes: number;
  status: 'scheduled' | 'started' | 'completed' | 'skipped';
};

export type Experiment = {
  id: string;
  userId: string;
  variable: string;
  durationDays: number;
  startDate: string;
  status: 'active' | 'completed';
  results?: {
    averageSleepDiff: number;
    morningRatingDiff: number;
    conclusion: string;
  };
};

export type AIMemory = {
  id: string;
  userId: string;
  context: string;
  timestamp: string;
};

interface MoonloomState {
  profile: UserProfile;
  sleepSessions: SleepSession[];
  lifestyleEvents: LifestyleEvent[];
  workBreaks: WorkBreak[];
  experiments: Experiment[];
  aiMemory: AIMemory[];

  // Actions
  updateProfile: (updates: Partial<UserProfile>) => void;
  addSleepSession: (session: SleepSession) => void;
  addLifestyleEvent: (event: LifestyleEvent) => void;
  addWorkBreak: (workBreak: WorkBreak) => void;
  updateWorkBreak: (id: string, status: WorkBreak['status']) => void;
  addExperiment: (experiment: Experiment) => void;
  updateExperiment: (id: string, updates: Partial<Experiment>) => void;
  addMemory: (memory: AIMemory) => void;
  addFood: (amount: number) => void;
}

export const useStore = create<MoonloomState>()(
  persist(
    (set, get) => ({
      profile: {
        id: 'u1',
        primaryGoal: null,
        timezone: 'UTC',
        foodBalance: 0,
        bondLevel: 1,
        createdAt: new Date().toISOString(),
        onboarded: false
      },
      sleepSessions: [],
      lifestyleEvents: [],
      workBreaks: [],
      experiments: [],
      aiMemory: [],

      updateProfile: (updates) => set((state) => ({ profile: { ...state.profile, ...updates } })),
      addSleepSession: (session) => set((state) => ({ sleepSessions: [...state.sleepSessions, session] })),
      addLifestyleEvent: (event) => set((state) => ({ lifestyleEvents: [...state.lifestyleEvents, event] })),
      addWorkBreak: (workBreak) => set((state) => ({ workBreaks: [...state.workBreaks, workBreak] })),
      updateWorkBreak: (id, status) => set((state) => ({
        workBreaks: state.workBreaks.map(wb => wb.id === id ? { ...wb, status } : wb)
      })),
      addExperiment: (exp) => set((state) => ({ experiments: [...state.experiments, exp] })),
      updateExperiment: (id, updates) => set((state) => ({
        experiments: state.experiments.map(exp => exp.id === id ? { ...exp, ...updates } : exp)
      })),
      addMemory: (memory) => set((state) => ({ aiMemory: [...state.aiMemory, memory] })),
      addFood: (amount) => set((state) => ({ profile: { ...state.profile, foodBalance: Math.max(0, state.profile.foodBalance + amount) } }))
    }),
    {
      name: 'moonloom-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);