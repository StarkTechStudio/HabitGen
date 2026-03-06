export type ThemeMode = 'light' | 'dark';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Priority = 'low' | 'medium' | 'high';

export interface UserPreferences {
  wakeUpTime: string;
  bedTime: string;
  defaultGoal: string;
  theme: ThemeMode;
  onboardingComplete: boolean;
  isPremium: boolean;
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  sessionPresets: number[];
  customDuration: number;
  difficulty?: Difficulty;
  priority?: Priority;
  createdAt: string;
  isTimerRunning?: boolean;
}

export interface HabitSession {
  id: string;
  habitId: string;
  startTime: number;
  endTime: number;
  duration: number;
  completed: boolean;
  date: string;
}

export interface Streak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
}

export interface TimerState {
  habitId: string | null;
  isRunning: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  breakMode: boolean;
  breaksTaken: number;
}

export const DEFAULT_SESSION_PRESETS = [15, 30, 45, 60];

export const GOALS = [
  { id: 'fitness', label: 'Fitness', emoji: '\u{1F3CB}' },
  { id: 'reading', label: 'Reading', emoji: '\u{1F4DA}' },
  { id: 'meditation', label: 'Meditation', emoji: '\u{1F9D8}' },
  { id: 'coding', label: 'Coding', emoji: '\u{1F4BB}' },
  { id: 'writing', label: 'Writing', emoji: '\u{270F}\u{FE0F}' },
  { id: 'music', label: 'Music', emoji: '\u{1F3B5}' },
  { id: 'cooking', label: 'Cooking', emoji: '\u{1F373}' },
  { id: 'language', label: 'Language', emoji: '\u{1F30D}' },
  { id: 'art', label: 'Art', emoji: '\u{1F3A8}' },
  { id: 'sleep', label: 'Better Sleep', emoji: '\u{1F634}' },
  { id: 'hydration', label: 'Hydration', emoji: '\u{1F4A7}' },
  { id: 'focus', label: 'Deep Focus', emoji: '\u{1F3AF}' },
];
