import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, Habit, HabitSession, Streak, TimerState, SleepSchedule, NotificationSession } from '../types';

const KEYS = {
  USER_PREFS: '@habitgen_user_prefs',
  HABITS: '@habitgen_habits',
  SESSIONS: '@habitgen_sessions',
  STREAKS: '@habitgen_streaks',
  TIMER: '@habitgen_timer',
  NOTIFICATION_SESSIONS: '@habitgen_notification_sessions',
  PENDING_NOTIF_ACTIONS: '@habitgen_pending_notif_actions',
};

export interface PendingNotifAction {
  sessionId: string;
  status: 'completed' | 'skipped';
}

const defaultPrefs: UserPreferences = {
  wakeUpTime: '07:00',
  bedTime: '23:00',
  defaultGoal: '',
  theme: 'dark',
  onboardingComplete: false,
  isPremium: false,
};

async function getUserPreferences(): Promise<UserPreferences> {
  const data = await AsyncStorage.getItem(KEYS.USER_PREFS);
  return data ? JSON.parse(data) : defaultPrefs;
}

async function setUserPreferences(prefs: UserPreferences): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_PREFS, JSON.stringify(prefs));
}

async function updateUserPreferences(partial: Partial<UserPreferences>): Promise<void> {
  const current = await getUserPreferences();
  await setUserPreferences({ ...current, ...partial });
}

async function getHabits(): Promise<Habit[]> {
  const data = await AsyncStorage.getItem(KEYS.HABITS);
  return data ? JSON.parse(data) : [];
}

async function saveHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.HABITS, JSON.stringify(habits));
}

async function getSessions(): Promise<HabitSession[]> {
  const data = await AsyncStorage.getItem(KEYS.SESSIONS);
  return data ? JSON.parse(data) : [];
}

async function saveSessions(sessions: HabitSession[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
}

async function addSession(session: HabitSession): Promise<void> {
  const sessions = await getSessions();
  sessions.push(session);
  await saveSessions(sessions);
}

async function getStreaks(): Promise<Streak[]> {
  const data = await AsyncStorage.getItem(KEYS.STREAKS);
  return data ? JSON.parse(data) : [];
}

async function saveStreaks(streaks: Streak[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.STREAKS, JSON.stringify(streaks));
}

async function getStreak(habitId: string): Promise<Streak> {
  const streaks = await getStreaks();
  return streaks.find(s => s.habitId === habitId) || {
    habitId,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: '',
  };
}

async function updateStreak(streak: Streak): Promise<void> {
  const streaks = await getStreaks();
  const idx = streaks.findIndex(s => s.habitId === streak.habitId);
  if (idx >= 0) {
    streaks[idx] = streak;
  } else {
    streaks.push(streak);
  }
  await saveStreaks(streaks);
}

async function getTimerState(): Promise<TimerState | null> {
  const data = await AsyncStorage.getItem(KEYS.TIMER);
  return data ? JSON.parse(data) : null;
}

async function saveTimerState(timer: TimerState | null): Promise<void> {
  if (timer) {
    await AsyncStorage.setItem(KEYS.TIMER, JSON.stringify(timer));
  } else {
    await AsyncStorage.removeItem(KEYS.TIMER);
  }
}

async function clearAll(): Promise<void> {
  const keys = Object.values(KEYS);
  await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
}

async function getSleepSchedule(): Promise<SleepSchedule | null> {
  const prefs = await getUserPreferences();
  return prefs.sleepSchedule || null;
}

async function setSleepSchedule(schedule: SleepSchedule | null): Promise<void> {
  await updateUserPreferences({ sleepSchedule: schedule ?? undefined });
}

// ---- Notification Sessions ----

async function getNotificationSessions(): Promise<NotificationSession[]> {
  const data = await AsyncStorage.getItem(KEYS.NOTIFICATION_SESSIONS);
  return data ? JSON.parse(data) : [];
}

async function saveNotificationSessions(sessions: NotificationSession[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.NOTIFICATION_SESSIONS, JSON.stringify(sessions));
}

async function addNotificationSession(session: NotificationSession): Promise<void> {
  const sessions = await getNotificationSessions();
  sessions.push(session);
  await saveNotificationSessions(sessions);
}

async function updateNotificationSession(
  sessionId: string,
  update: Partial<NotificationSession>,
): Promise<void> {
  const sessions = await getNotificationSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx >= 0) {
    sessions[idx] = { ...sessions[idx], ...update };
    await saveNotificationSessions(sessions);
  }
}

async function getNotificationSessionsForHabit(
  habitId: string,
  date?: string,
): Promise<NotificationSession[]> {
  const sessions = await getNotificationSessions();
  return sessions.filter(
    s => s.habitId === habitId && (date ? s.date === date : true),
  );
}

// Pending notification actions (from background/headless - processed by main app)
async function appendPendingNotifAction(action: PendingNotifAction): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.PENDING_NOTIF_ACTIONS);
  const list: PendingNotifAction[] = raw ? JSON.parse(raw) : [];
  list.push(action);
  await AsyncStorage.setItem(KEYS.PENDING_NOTIF_ACTIONS, JSON.stringify(list));
}

async function getAndClearPendingNotifActions(): Promise<PendingNotifAction[]> {
  const raw = await AsyncStorage.getItem(KEYS.PENDING_NOTIF_ACTIONS);
  await AsyncStorage.removeItem(KEYS.PENDING_NOTIF_ACTIONS);
  return raw ? JSON.parse(raw) : [];
}

export const storage = {
  getUserPreferences,
  setUserPreferences,
  updateUserPreferences,
  getHabits,
  saveHabits,
  getSessions,
  saveSessions,
  addSession,
  getStreaks,
  saveStreaks,
  getStreak,
  updateStreak,
  getTimerState,
  saveTimerState,
  getSleepSchedule,
  setSleepSchedule,
  getNotificationSessions,
  saveNotificationSessions,
  addNotificationSession,
  updateNotificationSession,
  getNotificationSessionsForHabit,
  appendPendingNotifAction,
  getAndClearPendingNotifActions,
  clearAll,
};
