import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  Unsubscribe,
} from 'firebase/firestore';
import { MainGoal, SubGoal } from '@/shared/types';

const COL = 'goals';

export const subscribeToGoals = (
  userId: string,
  onData: (goals: MainGoal[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const q = query(
    collection(db, COL),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const goals = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      } as MainGoal));
      onData(goals);
    },
    (error) => {
      console.error('Error fetching goals:', error);
      onError?.(error as Error);
    }
  );
};

export const createGoal = async (
  userId: string,
  goal: Omit<MainGoal, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, COL), {
    ...goal,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateGoal = async (
  goalId: string,
  updates: Partial<MainGoal>
): Promise<void> => {
  await updateDoc(doc(db, COL, goalId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteGoal = async (goalId: string): Promise<void> => {
  await deleteDoc(doc(db, COL, goalId));
};

export const addSubGoal = async (
  goalId: string,
  subGoal: Omit<SubGoal, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> => {
  const docRef = doc(db, COL, goalId);
  const timestamp = serverTimestamp();

  const newSubGoal: SubGoal = {
    ...subGoal,
    id: `${goalId}_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await updateDoc(docRef, {
    subGoals: arrayUnion(newSubGoal),
    updatedAt: timestamp,
  });
};

export const updateSubGoal = async (
  goalId: string,
  subGoalId: string,
  updates: Partial<SubGoal>
): Promise<void> => {
  const docRef = doc(db, COL, goalId);
  const goalSnapshot = await getDoc(docRef);
  const goalData = goalSnapshot.data() as MainGoal;

  const updatedSubGoals = goalData.subGoals.map(sg =>
    sg.id === subGoalId ? { ...sg, ...updates } : sg
  );

  await updateDoc(docRef, {
    subGoals: updatedSubGoals,
    updatedAt: serverTimestamp(),
  });
};

export const deleteSubGoal = async (
  goalId: string,
  subGoalId: string
): Promise<void> => {
  const docRef = doc(db, COL, goalId);
  const goalSnapshot = await getDoc(docRef);
  const goal = goalSnapshot.data() as MainGoal;

  const filteredSubGoals = goal.subGoals.filter((sg) => sg.id !== subGoalId);

  await updateDoc(docRef, {
    subGoals: filteredSubGoals,
    updatedAt: serverTimestamp(),
  });
};

export const reorderSubGoals = async (
  goalId: string,
  orderedSubGoals: SubGoal[]
): Promise<void> => {
  const docRef = doc(db, COL, goalId);

  await updateDoc(docRef, {
    subGoals: orderedSubGoals.map((sg, index) => ({
      ...sg,
      sortOrder: index,
    })),
    updatedAt: serverTimestamp(),
  });
};
