import { create } from 'zustand';
import { MainGoal, SubGoal } from '@/shared/types';
import {
  subscribeToGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from '@/lib/firestore/goalsService';
import { Unsubscribe } from 'firebase/firestore';

interface GoalStore {
  goals: MainGoal[];
  loading: boolean;
  unsubscribe: Unsubscribe | null;

  // Listeners
  startListening: (userId: string) => void;
  stopListening: () => void;

  // Actions
  addGoal: (userId: string, goal: Omit<MainGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<MainGoal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;

  // Utilities
  getGoalById: (goalId: string) => MainGoal | undefined;
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  loading: false,
  unsubscribe: null,

  startListening: (userId: string) => {
    set({ loading: true });
    const unsub = subscribeToGoals(
      userId,
      (goals) => {
        set({ goals, loading: false });
      },
      (error) => {
        console.error('Error in goal listener:', error);
        set({ loading: false });
      }
    );
    set({ unsubscribe: unsub });
  },

  stopListening: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
    }
    set({ goals: [], unsubscribe: null });
  },

  addGoal: async (userId: string, goal: Omit<MainGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    set({ loading: true });
    try {
      await createGoal(userId, goal);
      set({ loading: false });
    } catch (error) {
      console.error('Error creating goal:', error);
      set({ loading: false });
      throw error;
    }
  },

  updateGoal: async (goalId: string, updates: Partial<MainGoal>) => {
    try {
      await updateGoal(goalId, updates);
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  },

  deleteGoal: async (goalId: string) => {
    try {
      await deleteGoal(goalId);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  getGoalById: (goalId: string) => {
    return get().goals.find((goal) => goal.id === goalId);
  },
}));
