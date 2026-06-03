import { create } from 'zustand';
import { DailyCheckIn, SubGoalEntry } from '@/shared/types';
import {
  subscribeToUserCheckIns,
  submitCheckIn,
  updateCheckIn,
  getCheckInId,
} from '@/lib/firestore/checkInsService';
import { Unsubscribe } from 'firebase/firestore';

interface CheckInStore {
  checkIns: DailyCheckIn[];
  loading: boolean;
  unsubscribe: Unsubscribe | null;

  // Listeners
  startListening: (userId: string) => void;
  stopListening: () => void;

  // Actions
  submitDailyCheckIn: (
    userId: string,
    goalId: string,
    date: string,
    subGoalEntries: SubGoalEntry[],
    isGoalDayComplete: boolean,
    completionPercentage: number
  ) => Promise<void>;
  updateDailyCheckIn: (
    userId: string,
    goalId: string,
    date: string,
    updates: Partial<DailyCheckIn>
  ) => Promise<void>;

  // Utilities
  getCheckInForGoalDate: (goalId: string, date: string) => DailyCheckIn | undefined;
  getCheckInsForGoal: (goalId: string) => DailyCheckIn[];
  getCheckInsForDate: (date: string) => DailyCheckIn[];
}

export const useCheckInStore = create<CheckInStore>((set, get) => ({
  checkIns: [],
  loading: false,
  unsubscribe: null,

  startListening: (userId: string) => {
    set({ loading: true });
    const unsub = subscribeToUserCheckIns(
      userId,
      (checkIns) => {
        set({ checkIns, loading: false });
      },
      (error) => {
        console.error('Error in check-in listener:', error);
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
    set({ checkIns: [], unsubscribe: null });
  },

  submitDailyCheckIn: async (
    userId: string,
    goalId: string,
    date: string,
    subGoalEntries: SubGoalEntry[],
    isGoalDayComplete: boolean,
    completionPercentage: number
  ) => {
    set({ loading: true });
    try {
      await submitCheckIn(userId, {
        userId,
        goalId,
        date,
        subGoalEntries,
        isGoalDayComplete,
        completionPercentage,
        wasAutoMissed: false,
      });
      set({ loading: false });
    } catch (error) {
      console.error('Error submitting check-in:', error);
      set({ loading: false });
      throw error;
    }
  },

  updateDailyCheckIn: async (
    userId: string,
    goalId: string,
    date: string,
    updates: Partial<DailyCheckIn>
  ) => {
    try {
      await updateCheckIn(userId, goalId, date, updates);
    } catch (error) {
      console.error('Error updating check-in:', error);
      throw error;
    }
  },

  getCheckInForGoalDate: (goalId: string, date: string) => {
    return get().checkIns.find((ci) => ci.goalId === goalId && ci.date === date);
  },

  getCheckInsForGoal: (goalId: string) => {
    return get().checkIns.filter((ci) => ci.goalId === goalId);
  },

  getCheckInsForDate: (date: string) => {
    return get().checkIns.filter((ci) => ci.date === date);
  },
}));
