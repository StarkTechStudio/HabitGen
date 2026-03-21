import { Dimensions, PixelRatio } from 'react-native';
import type { SleepSchedule } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375; // iPhone 11 reference width

// Scale font size based on screen width
export function scaleFontSize(size: number): number {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m} min` : `${h}h`;
}

export function formatMin(minutes: number): string {
  return `${minutes} min`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Returns today's date as YYYY-MM-DD in LOCAL timezone.
 * Must use local dates everywhere to avoid UTC offset mismatches.
 */
export function getTodayDateString(): string {
  return getLocalDateString(new Date());
}

/**
 * Format any Date as YYYY-MM-DD in LOCAL timezone.
 */
export function getLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  return Math.floor(Math.abs(d2 - d1) / 86400000);
}

export function isInSleepWindow(schedule: SleepSchedule): boolean {
  const now = new Date();
  const day = now.getDay();
  if (!schedule.days.includes(day)) return false;
  const [sh, sm] = schedule.startTime.split(':').map(Number);
  const [eh, em] = schedule.endTime.split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  const currentMins = now.getHours() * 60 + now.getMinutes();
  if (startMins > endMins) {
    return currentMins >= startMins || currentMins < endMins;
  }
  return currentMins >= startMins && currentMins < endMins;
}
