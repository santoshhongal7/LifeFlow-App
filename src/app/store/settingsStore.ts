import { create } from 'zustand';
import { UserSettings, UserProfile } from '@/shared/types';
import {
  subscribeToUserProfile,
  updateUserSettings,
} from '@/lib/firestore/userService';
import { Unsubscribe } from 'firebase/firestore';

interface SettingsStore {
  profile: UserProfile | null;
  loading: boolean;
  unsubscribe: Unsubscribe | null;

  // Listeners
  startListening: (userId: string) => void;
  stopListening: () => void;

  // Actions
  updateSettings: (userId: string, updates: Partial<UserSettings>) => Promise<void>;

  // Utilities
  getSettings: () => UserSettings | null;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  profile: null,
  loading: false,
  unsubscribe: null,

  startListening: (userId: string) => {
    set({ loading: true });
    const unsub = subscribeToUserProfile(userId, (profile) => {
      set({ profile, loading: false });
    });
    set({ unsubscribe: unsub });
  },

  stopListening: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
    }
    set({ profile: null, unsubscribe: null });
  },

  updateSettings: async (userId: string, updates: Partial<UserSettings>) => {
    try {
      await updateUserSettings(userId, updates);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  getSettings: () => {
    return get().profile?.settings || null;
  },
}));
