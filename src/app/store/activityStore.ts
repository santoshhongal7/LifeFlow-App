import { create } from 'zustand';
import { Activity, ActivityLog } from '@/shared/types';
import {
  subscribeToActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from '@/lib/firestore/activitiesService';
import { Unsubscribe } from 'firebase/firestore';

interface ActivityStore {
  activities: Activity[];
  loading: boolean;
  unsubscribe: Unsubscribe | null;

  // Listeners
  startListening: (userId: string) => void;
  stopListening: () => void;

  // Actions
  addActivity: (
    userId: string,
    activity: Omit<Activity, 'id' | 'createdAt'>
  ) => Promise<void>;
  updateActivity: (activityId: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (activityId: string) => Promise<void>;

  // Utilities
  getActivityById: (activityId: string) => Activity | undefined;
}

export const useActivityStore = create<ActivityStore>((set, get) => ({
  activities: [],
  loading: false,
  unsubscribe: null,

  startListening: (userId: string) => {
    set({ loading: true });
    const unsub = subscribeToActivities(userId, (activities) => {
      set({ activities, loading: false });
    });
    set({ unsubscribe: unsub });
  },

  stopListening: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
    }
    set({ activities: [], unsubscribe: null });
  },

  addActivity: async (
    userId: string,
    activity: Omit<Activity, 'id' | 'createdAt'>
  ) => {
    set({ loading: true });
    try {
      await createActivity(userId, activity);
      set({ loading: false });
    } catch (error) {
      console.error('Error creating activity:', error);
      set({ loading: false });
      throw error;
    }
  },

  updateActivity: async (activityId: string, updates: Partial<Activity>) => {
    try {
      await updateActivity(activityId, updates);
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  },

  deleteActivity: async (activityId: string) => {
    try {
      await deleteActivity(activityId);
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  },

  getActivityById: (activityId: string) => {
    return get().activities.find((activity) => activity.id === activityId);
  },
}));
