import { create } from 'zustand';
import { auth } from '@/lib/firebase';
import {
  registerUser,
  signInUser,
  signOutUser,
  AuthError,
} from '@/lib/auth/authService';
import { User } from 'firebase/auth';

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: AuthError | null;

  // Actions
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  error: null,

  signUp: async (email: string, password: string, name: string) => {
    set({ loading: true, error: null });
    try {
      await registerUser(email, password, name);
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error as AuthError,
        loading: false,
      });
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      await signInUser(email, password);
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error as AuthError,
        loading: false,
      });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await signOutUser();
      set({ user: null, loading: false });
    } catch (error: any) {
      set({
        error: error as AuthError,
        loading: false,
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setUser: (user: User | null) => {
    set({ user, loading: false });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },
}));
