// Activity Categories
export type ActivityCategory =
  | 'fitness'
  | 'wellness'
  | 'mindfulness'
  | 'sports'
  | 'diet'
  | 'learning'
  | 'sleep'
  | 'productivity'
  | 'custom';

// Goal Status
export type GoalStatus = 'active' | 'completed' | 'failed' | 'paused' | 'upcoming';

// Check-in Status
export type CheckInStatus = 'done' | 'missed' | 'pending' | 'skipped';

// Calendar Day Status
export type CalendarDayStatus = 'complete' | 'partial' | 'missed' | 'future' | 'today' | 'not_applicable';

// Theme
export type Theme = 'dark' | 'light' | 'system';

// Sub-Goal Interface
export interface SubGoal {
  id: string;
  parentGoalId: string;
  title: string;
  description?: string;
  category: ActivityCategory;
  icon: string;
  color: string;
  targetType: 'boolean' | 'quantity';
  targetValue?: number;
  targetUnit?: string;
  activeDays: number[];
  isRequired: boolean;
  sortOrder: number;
  reminderTime?: string;
  createdAt: string;
  updatedAt: string;
}

// Main Goal Interface
export interface MainGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  category: ActivityCategory;
  totalDays: number;
  startDate: string;
  endDate: string;
  subGoals: SubGoal[];
  completionRule: 'all_required' | 'any_required' | 'percentage';
  completionThreshold?: number;
  status: GoalStatus;
  coverGradient: string;
  createdAt: string;
  updatedAt: string;
}

// Sub-Goal Entry
export interface SubGoalEntry {
  subGoalId: string;
  status: CheckInStatus;
  value?: number;
  loggedAt?: string;
}

// Daily Check-In
export interface DailyCheckIn {
  id: string;
  userId: string;
  goalId: string;
  date: string;
  subGoalEntries: SubGoalEntry[];
  isGoalDayComplete: boolean;
  completionPercentage: number;
  wasAutoMissed: boolean;
  submittedAt?: string;
  notes?: string;
}

// Goal Streak
export interface GoalStreak {
  goalId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompleteDate: string;
  totalCompleteDays: number;
  totalMissedDays: number;
  completionRate: number;
  milestones: number[];
}

// Sub-Goal Streak
export interface SubGoalStreak {
  subGoalId: string;
  goalId: string;
  currentStreak: number;
  longestStreak: number;
  lastDoneDate: string;
  totalDone: number;
  totalMissed: number;
}

// Activity
export interface Activity {
  id: string;
  userId: string;
  name: string;
  category: ActivityCategory;
  icon: string;
  color: string;
  unit: string;
  defaultTarget: number;
  createdAt: string;
}

// Activity Log
export interface ActivityLog {
  id: string;
  userId: string;
  activityId: string;
  date: string;
  value: number;
  unit: string;
  notes?: string;
  loggedAt: string;
}

// User Profile
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatar: string;
  createdAt: string;
  lastLoginAt: string;
  settings: UserSettings;
}

// User Settings
export interface UserSettings {
  theme: Theme;
  accentColor: string;
  reminderTime: string;
  weekStartsOn: 0 | 1;
  notificationsEnabled: boolean;
  autoMissAfterMidnight: boolean;
  schemaVersion: number;
}

// Calendar Day
export interface CalendarDay {
  date: string;
  status: CalendarDayStatus;
  completionPercentage: number;
  dayNumber: number;
}

// Firebase User
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
