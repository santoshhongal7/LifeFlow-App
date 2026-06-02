import { MainGoal, DailyCheckIn, SubGoal } from '@/shared/types';
import { getDayNumber, getRemainingDays, getTodayKey } from './dateUtils';

/**
 * Get active goals for the current date
 */
export const getActiveGoals = (goals: MainGoal[], date: string = getTodayKey()): MainGoal[] => {
  return goals.filter((goal) => {
    const dayNum = getDayNumber(goal.startDate, date);
    return dayNum >= 1 && dayNum <= goal.totalDays && goal.status === 'active';
  });
};

/**
 * Get days remaining in a goal
 */
export const getDaysRemaining = (goal: MainGoal, date: string = getTodayKey()): number => {
  return getRemainingDays(goal.endDate, date);
};

/**
 * Get current day number in goal
 */
export const getCurrentDayNumber = (goal: MainGoal, date: string = getTodayKey()): number => {
  return getDayNumber(goal.startDate, date);
};

/**
 * Get completion percentage of a goal based on check-ins
 */
export const getGoalCompletionPercentage = (goal: MainGoal, checkIns: DailyCheckIn[]): number => {
  if (checkIns.length === 0) return 0;

  const completedDays = checkIns.filter((ci) => ci.isGoalDayComplete).length;
  return Math.round((completedDays / goal.totalDays) * 100);
};

/**
 * Get category color
 */
export const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    fitness: '#f5576c',
    wellness: '#00f2fe',
    mindfulness: '#fbc2eb',
    sports: '#38f9d7',
    diet: '#fee140',
    learning: '#d57eeb',
    sleep: '#764ba2',
    productivity: '#38ef7d',
    custom: '#ffd200',
  };
  return colors[category] || '#f093fb';
};

/**
 * Get category gradient
 */
export const getCategoryGradient = (category: string): string => {
  const gradients: { [key: string]: string } = {
    fitness: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    wellness: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    mindfulness: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    sports: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    diet: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    learning: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    sleep: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    productivity: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    custom: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  };
  return gradients[category] || 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
};

/**
 * Calculate required sub-goals completion based on rule
 */
export const calculateSubGoalCompletion = (
  goal: MainGoal,
  checkIn: DailyCheckIn
): { required: number; completed: number; percentage: number } => {
  const requiredSubGoals = goal.subGoals.filter((sg) => sg.isRequired);
  const completedSubGoals = checkIn.subGoalEntries.filter(
    (entry) => entry.status === 'done' && goal.subGoals.find((sg) => sg.id === entry.subGoalId)?.isRequired
  ).length;

  let percentage = 0;

  if (goal.completionRule === 'all_required') {
    percentage = requiredSubGoals.length > 0
      ? Math.round((completedSubGoals / requiredSubGoals.length) * 100)
      : 100;
  } else if (goal.completionRule === 'any_required') {
    percentage = completedSubGoals > 0 ? 100 : 0;
  } else if (goal.completionRule === 'percentage') {
    const threshold = goal.completionThreshold || 80;
    const allCompleted = checkIn.subGoalEntries.filter((entry) => entry.status === 'done').length;
    percentage = Math.round((allCompleted / goal.subGoals.length) * 100);
    percentage = percentage >= threshold ? 100 : percentage;
  }

  return { required: requiredSubGoals.length, completed: completedSubGoals, percentage };
};

/**
 * Check if a goal day is complete
 */
export const isGoalDayComplete = (goal: MainGoal, checkIn: DailyCheckIn): boolean => {
  if (goal.completionRule === 'all_required') {
    const requiredSubGoals = goal.subGoals.filter((sg) => sg.isRequired);
    return requiredSubGoals.every((sg) =>
      checkIn.subGoalEntries.find((e) => e.subGoalId === sg.id && e.status === 'done')
    );
  } else if (goal.completionRule === 'any_required') {
    return checkIn.subGoalEntries.some((e) => e.status === 'done');
  } else if (goal.completionRule === 'percentage') {
    const threshold = goal.completionThreshold || 80;
    const completed = checkIn.subGoalEntries.filter((e) => e.status === 'done').length;
    const percentage = Math.round((completed / goal.subGoals.length) * 100);
    return percentage >= threshold;
  }
  return false;
};

/**
 * Get sub-goals for a specific day of week
 */
export const getSubGoalsForDay = (goal: MainGoal, dayOfWeek: number): SubGoal[] => {
  return goal.subGoals.filter((sg) => sg.activeDays.includes(dayOfWeek));
};
