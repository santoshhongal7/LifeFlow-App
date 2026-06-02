import { DailyCheckIn, GoalStreak, SubGoalStreak, CheckInStatus } from '@/shared/types';
import { getDaysDifference, getTodayKey } from './dateUtils';

const MILESTONES = [1, 3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365, 500, 1000];

/**
 * Calculate streaks for a goal
 */
export const calculateGoalStreak = (
  checkIns: DailyCheckIn[],
  startDate: string
): GoalStreak => {
  const sortedByDate = [...checkIns].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastCompleteDate = '';
  let totalCompleteDays = 0;
  let totalMissedDays = 0;

  const today = getTodayKey();
  let checkingDate = today;

  for (const checkIn of sortedByDate) {
    if (checkIn.isGoalDayComplete) {
      totalCompleteDays++;
      lastCompleteDate = lastCompleteDate || checkIn.date;

      if (checkIn.date === checkingDate || currentStreak === 0) {
        currentStreak++;
        tempStreak = currentStreak;
      } else {
        const daysDiff = getDaysDifference(checkIn.date, checkingDate);
        if (daysDiff === 1) {
          currentStreak++;
        } else {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 1;
          currentStreak = 1;
        }
      }
      checkingDate = checkIn.date;
    } else {
      totalMissedDays++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      tempStreak = 0;
    }
  }

  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
  }

  const completionRate = totalCompleteDays + totalMissedDays > 0
    ? Math.round((totalCompleteDays / (totalCompleteDays + totalMissedDays)) * 100)
    : 0;

  const achievedMilestones = MILESTONES.filter((m) => m <= longestStreak);

  return {
    goalId: checkIns[0]?.goalId || '',
    currentStreak: currentStreak > 0 ? currentStreak : 0,
    longestStreak: Math.max(longestStreak, currentStreak),
    lastCompleteDate,
    totalCompleteDays,
    totalMissedDays,
    completionRate,
    milestones: achievedMilestones,
  };
};

/**
 * Calculate streaks for a sub-goal
 */
export const calculateSubGoalStreak = (
  checkIns: DailyCheckIn[],
  subGoalId: string
): SubGoalStreak | null => {
  const subGoalCheckIns = checkIns.map((ci) => {
    const entry = ci.subGoalEntries.find((e) => e.subGoalId === subGoalId);
    return entry;
  }).filter((e) => e !== undefined);

  if (subGoalCheckIns.length === 0) {
    return null;
  }

  const sortedByDate = [...checkIns]
    .filter((ci) => ci.subGoalEntries.some((e) => e.subGoalId === subGoalId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDoneDate = '';
  let totalDone = 0;
  let totalMissed = 0;

  const today = getTodayKey();
  let checkingDate = today;

  for (const checkIn of sortedByDate) {
    const entry = checkIn.subGoalEntries.find((e) => e.subGoalId === subGoalId);
    if (!entry) continue;

    if (entry.status === 'done') {
      totalDone++;
      lastDoneDate = lastDoneDate || checkIn.date;

      if (checkIn.date === checkingDate || currentStreak === 0) {
        currentStreak++;
        tempStreak = currentStreak;
      } else {
        const daysDiff = getDaysDifference(checkIn.date, checkingDate);
        if (daysDiff === 1) {
          currentStreak++;
        } else {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 1;
          currentStreak = 1;
        }
      }
      checkingDate = checkIn.date;
    } else if (entry.status === 'missed') {
      totalMissed++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      tempStreak = 0;
    }
  }

  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
  }

  return {
    subGoalId,
    goalId: checkIns[0]?.goalId || '',
    currentStreak: currentStreak > 0 ? currentStreak : 0,
    longestStreak: Math.max(longestStreak, currentStreak),
    lastDoneDate,
    totalDone,
    totalMissed,
  };
};

/**
 * Get milestone progress message
 */
export const getMilestoneMessage = (streak: number): string => {
  const nextMilestone = MILESTONES.find((m) => m > streak);
  if (!nextMilestone) return `Amazing! You've reached the max milestone!`;
  return `${nextMilestone - streak} days until ${nextMilestone} day milestone!`;
};

/**
 * Check if current streak is broken
 */
export const isStreakBroken = (lastCompleteDate: string): boolean => {
  if (!lastCompleteDate) return true;
  const diff = getDaysDifference(lastCompleteDate, getTodayKey());
  return diff > 1;
};

/**
 * Get streak status color
 */
export const getStreakColor = (streak: number): string => {
  if (streak === 0) return 'text-gray-400';
  if (streak < 7) return 'text-yellow-500';
  if (streak < 30) return 'text-orange-500';
  if (streak < 100) return 'text-red-500';
  return 'text-purple-500';
};
