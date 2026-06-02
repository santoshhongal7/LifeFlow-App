import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { DailyCheckIn } from '@/shared/types';

const COL = 'checkIns';

export const getCheckInId = (userId: string, goalId: string, date: string): string => {
  return `${userId}_${goalId}_${date}`;
};

export const subscribeToCheckIns = (
  userId: string,
  goalId: string,
  onData: (checkIns: DailyCheckIn[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const q = query(
    collection(db, COL),
    where('userId', '==', userId),
    where('goalId', '==', goalId),
    orderBy('date', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const checkIns = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      } as DailyCheckIn));
      onData(checkIns);
    },
    (error) => {
      console.error('Error fetching check-ins:', error);
      onError?.(error as Error);
    }
  );
};

export const subscribeToUserCheckIns = (
  userId: string,
  onData: (checkIns: DailyCheckIn[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const q = query(
    collection(db, COL),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const checkIns = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      } as DailyCheckIn));
      onData(checkIns);
    },
    (error) => {
      console.error('Error fetching check-ins:', error);
      onError?.(error as Error);
    }
  );
};

export const submitCheckIn = async (
  userId: string,
  checkIn: Omit<DailyCheckIn, 'id'>
): Promise<void> => {
  const id = getCheckInId(userId, checkIn.goalId, checkIn.date);

  await setDoc(doc(db, COL, id), {
    ...checkIn,
    userId,
    submittedAt: serverTimestamp(),
  });
};

export const updateCheckIn = async (
  userId: string,
  goalId: string,
  date: string,
  updates: Partial<DailyCheckIn>
): Promise<void> => {
  const id = getCheckInId(userId, goalId, date);

  await setDoc(
    doc(db, COL, id),
    {
      ...updates,
      userId,
      goalId,
      date,
      submittedAt: serverTimestamp(),
    },
    { merge: true }
  );
};
