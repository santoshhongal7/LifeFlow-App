import { db } from '../firebase';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { UserProfile } from '@/shared/types';

const COL = 'users';

export const subscribeToUserProfile = (
  userId: string,
  onData: (profile: UserProfile) => void
): Unsubscribe => {
  return onSnapshot(doc(db, COL, userId), (snap) => {
    if (snap.exists()) {
      onData(snap.data() as UserProfile);
    }
  });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, COL, userId));
  return snap.exists() ? (snap.data() as UserProfile) : null;
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  await setDoc(doc(db, COL, userId), updates, { merge: true });
};

export const updateUserSettings = async (
  userId: string,
  updates: Partial<UserProfile['settings']>
): Promise<void> => {
  await setDoc(
    doc(db, COL, userId),
    {
      settings: updates,
    },
    { merge: true }
  );
};
