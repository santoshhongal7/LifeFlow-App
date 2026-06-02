import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { Activity, ActivityLog } from '@/shared/types';

const ACTIVITIES_COL = 'activities';
const LOGS_COL = 'activityLogs';

export const subscribeToActivities = (
  userId: string,
  onData: (activities: Activity[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, ACTIVITIES_COL),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snap) => {
    const activities = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    } as Activity));
    onData(activities);
  });
};

export const createActivity = async (
  userId: string,
  activity: Omit<Activity, 'id' | 'createdAt'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, ACTIVITIES_COL), {
    ...activity,
    userId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateActivity = async (
  activityId: string,
  updates: Partial<Activity>
): Promise<void> => {
  await updateDoc(doc(db, ACTIVITIES_COL, activityId), updates);
};

export const deleteActivity = async (activityId: string): Promise<void> => {
  await deleteDoc(doc(db, ACTIVITIES_COL, activityId));
};

export const subscribeToActivityLogs = (
  userId: string,
  activityId: string,
  onData: (logs: ActivityLog[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, LOGS_COL),
    where('userId', '==', userId),
    where('activityId', '==', activityId),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snap) => {
    const logs = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    } as ActivityLog));
    onData(logs);
  });
};

export const logActivity = async (
  userId: string,
  log: Omit<ActivityLog, 'id'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, LOGS_COL), {
    ...log,
    userId,
    loggedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateActivityLog = async (
  logId: string,
  updates: Partial<ActivityLog>
): Promise<void> => {
  await updateDoc(doc(db, LOGS_COL, logId), updates);
};

export const deleteActivityLog = async (logId: string): Promise<void> => {
  await deleteDoc(doc(db, LOGS_COL, logId));
};
