import { format, parse, isToday, isPast, isFuture, isAfter, isBefore, differenceInDays } from 'date-fns';

/**
 * Convert Date to YYYY-MM-DD string
 */
export const toDateKey = (date: Date | string): string => {
  if (typeof date === 'string') return date;
  return format(date, 'yyyy-MM-dd');
};

/**
 * Parse YYYY-MM-DD string to Date
 */
export const parseDateKey = (dateKey: string): Date => {
  return parse(dateKey, 'yyyy-MM-dd', new Date());
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayKey = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

/**
 * Get today's date as Date object
 */
export const getToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Format date for display
 */
export const formatDate = (date: Date | string, formatStr = 'MMM dd, yyyy'): string => {
  const d = typeof date === 'string' ? parseDateKey(date) : date;
  return format(d, formatStr);
};

/**
 * Check if date is today
 */
export const isDateToday = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? parseDateKey(date) : date;
  return isToday(d);
};

/**
 * Check if date is in the past
 */
export const isDatePast = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? parseDateKey(date) : date;
  const today = getToday();
  return isPast(d) && !isDateToday(d);
};

/**
 * Check if date is in the future
 */
export const isDateFuture = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? parseDateKey(date) : date;
  const today = getToday();
  return isFuture(d) && !isDateToday(d);
};

/**
 * Get day of week (0 = Sunday, 6 = Saturday)
 */
export const getDayOfWeek = (date: Date | string): number => {
  const d = typeof date === 'string' ? parseDateKey(date) : date;
  return d.getDay();
};

/**
 * Add days to a date
 */
export const addDays = (date: Date | string, days: number): string => {
  const d = typeof date === 'string' ? parseDateKey(date) : date;
  d.setDate(d.getDate() + days);
  return toDateKey(d);
};

/**
 * Get difference in days between two dates
 */
export const getDaysDifference = (startDate: Date | string, endDate: Date | string): number => {
  const start = typeof startDate === 'string' ? parseDateKey(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseDateKey(endDate) : endDate;
  return differenceInDays(end, start);
};

/**
 * Get day number in goal duration
 */
export const getDayNumber = (startDate: string, currentDate: string): number => {
  return getDaysDifference(startDate, currentDate) + 1;
};

/**
 * Get remaining days in goal
 */
export const getRemainingDays = (endDate: string, currentDate: string = getTodayKey()): number => {
  const remaining = getDaysDifference(currentDate, endDate);
  return remaining >= 0 ? remaining : 0;
};

/**
 * Format duration in days to readable format
 */
export const formatDuration = (days: number): string => {
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
};

/**
 * Check if date is within a date range
 */
export const isDateInRange = (
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string
): boolean => {
  const d = typeof date === 'string' ? parseDateKey(date) : date;
  const start = typeof startDate === 'string' ? parseDateKey(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseDateKey(endDate) : endDate;

  return isAfter(d, start) && isBefore(d, end) ? true : d.getTime() === start.getTime() || d.getTime() === end.getTime();
};
