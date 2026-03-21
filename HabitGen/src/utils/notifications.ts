/**
 * Notification utility for Notify-mode habits.
 *
 * This module contains helper functions used to calculate notification
 * schedules and format notification messages.
 *
 * NOTE: Actual push notification scheduling (via react-native-push-notification
 * or Notifee) should be added separately. This module prepares the data layer.
 */

import { NotifyConfig } from '../types';

/**
 * Calculate the total number of notifications within a duration window.
 * With the new model, frequencyCount IS the total notifications.
 */
export function calculateTotalNotifications(config: NotifyConfig): number {
  if (config.frequencyCount <= 0 || config.durationMinutes <= 0) return 0;
  return config.frequencyCount;
}

/**
 * Given a total duration and count of notifications, find the interval.
 *
 * Example 1: 9 notifications in 180 minutes → 180 / 9 = 20 minutes each
 * Example 2: 9 notifications in 60 minutes  → 60 / 9 ≈ 6.67 minutes (6m 40s)
 */
export function calculateFrequencyFromCount(
  durationMinutes: number,
  notificationCount: number,
): { minutes: number; seconds: number; totalMinutes: number } {
  if (notificationCount <= 0 || durationMinutes <= 0) {
    return { minutes: 0, seconds: 0, totalMinutes: 0 };
  }
  const exactMinutes = durationMinutes / notificationCount;
  const wholeMinutes = Math.floor(exactMinutes);
  const remainingSeconds = Math.round((exactMinutes - wholeMinutes) * 60);
  return {
    minutes: wholeMinutes,
    seconds: remainingSeconds,
    totalMinutes: exactMinutes,
  };
}

/**
 * Format a notification message.
 *
 * Example: "It's been 2 hours, it's time to Drink Water"
 */
export function formatNotificationMessage(
  habitName: string,
  intervalMinutes: number,
): string {
  const h = Math.floor(intervalMinutes / 60);
  const m = Math.round(intervalMinutes % 60);
  let timeStr = '';
  if (h > 0 && m > 0) {
    timeStr = `${h} hour${h > 1 ? 's' : ''} ${m} min`;
  } else if (h > 0) {
    timeStr = `${h} hour${h > 1 ? 's' : ''}`;
  } else {
    timeStr = `${m} minute${m > 1 ? 's' : ''}`;
  }
  return `It's been ${timeStr}, it's time to ${habitName}`;
}

/**
 * Given duration and frequency count, generate scheduled timestamps from a start time.
 * Interval = durationMinutes / frequencyCount
 */
export function generateScheduledTimestamps(
  startTime: number,
  config: NotifyConfig,
): number[] {
  const total = config.frequencyCount;
  if (total <= 0) return [];
  const intervalMs = (config.durationMinutes / total) * 60 * 1000;
  const timestamps: number[] = [];
  for (let i = 0; i < total; i++) {
    timestamps.push(startTime + (i + 1) * intervalMs);
  }
  return timestamps;
}

/**
 * Format frequency interval for display.
 * e.g., 120 → "2h", 90 → "1h 30m", 20 → "20m"
 */
export function formatFrequencyInterval(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes}m`;
}
