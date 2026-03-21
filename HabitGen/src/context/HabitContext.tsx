import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, DeviceEventEmitter } from 'react-native';
import notifee from '@notifee/react-native';
import { Habit, HabitSession, Streak, TimerState, NotificationSession } from '../types';
import { storage } from '../utils/storage';
import { notificationService } from '../api/notificationService';
import { NOTIF_SESSION_UPDATED } from '../api/notificationHandlers';
import { getLocalDateString } from '../utils/helpers';

interface HabitContextType {
  habits: Habit[];
  sessions: HabitSession[];
  streaks: Streak[];
  timerState: TimerState | null;
  notificationSessions: NotificationSession[];
  loading: boolean;
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  startTimer: (habitId: string, durationMinutes: number) => void;
  stopTimer: (completed: boolean) => Promise<void>;
  tickTimer: () => void;
  startBreak: () => void;
  getHabitStreak: (habitId: string) => Streak;
  addNotifSession: (session: NotificationSession) => Promise<void>;
  updateNotifSession: (sessionId: string, update: Partial<NotificationSession>) => Promise<void>;
  getNotifSessionsForHabit: (habitId: string, date?: string) => NotificationSession[];
  startNotifyHabit: (habitId: string) => Promise<{ ok: boolean; error?: string }>;
  stopNotifyHabit: (habitId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const HabitContext = createContext<HabitContextType>({} as HabitContextType);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [sessions, setSessions] = useState<HabitSession[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [notificationSessions, setNotificationSessions] = useState<NotificationSession[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    const [h, s, st, t, ns] = await Promise.all([
      storage.getHabits(),
      storage.getSessions(),
      storage.getStreaks(),
      storage.getTimerState(),
      storage.getNotificationSessions(),
    ]);
    setHabits(h);
    setSessions(s);
    setStreaks(st);
    setTimerState(t);
    setNotificationSessions(ns);
    setLoading(false);
  }, []);

  /**
   * Process pending notification actions from the queue, then mark
   * past-due sessions as skipped, then refresh all data from storage.
   * Order matters: pending queue first so completed sessions aren't
   * overwritten by markPassedAsSkipped.
   */
  const syncNotificationsAndRefresh = useCallback(async () => {
    // Step 1: Apply any queued actions (Completed/Skip from notification taps)
    const pending = await storage.getAndClearPendingNotifActions();
    for (const { sessionId, status } of pending) {
      await storage.updateNotificationSession(sessionId, {
        status,
        respondedAt: Date.now(),
      });
    }
    // Step 2: Auto-skip sessions still pending whose time has passed
    await notificationService.markPassedAsSkipped();
    // Step 3: Refresh React state from storage
    await refreshData();
  }, [refreshData]);

  useEffect(() => {
    syncNotificationsAndRefresh();
  }, [syncNotificationsAndRefresh]);

  // Foreground event: notification action while app is open
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(NOTIF_SESSION_UPDATED, () => {
      syncNotificationsAndRefresh();
    });
    return () => sub.remove();
  }, [syncNotificationsAndRefresh]);

  // When app returns to foreground: sync and refresh (+ delayed retry for slow handlers)
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        syncNotificationsAndRefresh();
        setTimeout(() => syncNotificationsAndRefresh(), 800);
      }
    });
    return () => sub.remove();
  }, [syncNotificationsAndRefresh]);

  // Cold start from notification tap
  useEffect(() => {
    const run = async () => {
      const initial = await notifee.getInitialNotification();
      if (initial?.notification?.data?.type === 'habit_reminder') {
        await syncNotificationsAndRefresh();
      }
    };
    run();
  }, [syncNotificationsAndRefresh]);

  const addHabit = useCallback(async (habit: Habit) => {
    const toSave = habit.habitMode === 'notify'
      ? { ...habit, notifyActive: false }
      : habit;
    const updated = [...habits, toSave];
    setHabits(updated);
    await storage.saveHabits(updated);
  }, [habits]);

  const updateHabit = useCallback(async (habit: Habit) => {
    const updated = habits.map(h => (h.id === habit.id ? habit : h));
    setHabits(updated);
    await storage.saveHabits(updated);
  }, [habits]);

  const startNotifyHabit = useCallback(async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit || habit.habitMode !== 'notify' || !habit.notifyConfig) {
      return { ok: false, error: 'Invalid habit' };
    }
    try {
      const hasPermission = await notificationService.requestPermission();
      if (!hasPermission) {
        return { ok: false, error: 'Notification permission is required. Please enable it in Settings.' };
      }
      const validation = await notificationService.validateTimeWindow(habit);
      if (!validation.valid) {
        return { ok: false, error: validation.reason };
      }
      await notificationService.scheduleForHabit({ ...habit, notifyActive: true });
      const updated = habits.map(h =>
        h.id === habitId ? { ...h, notifyActive: true } : h,
      );
      setHabits(updated);
      await storage.saveHabits(updated);
      await refreshData();
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Failed to start' };
    }
  }, [habits, refreshData]);

  const stopNotifyHabit = useCallback(async (habitId: string) => {
    await notificationService.cancelForHabit(habitId);
    // Remove today's pending sessions so restarting gets a clean slate
    const today = getLocalDateString(new Date());
    await storage.removeNotificationSessionsForHabit(habitId, today);
    const updated = habits.map(h =>
      h.id === habitId ? { ...h, notifyActive: false } : h,
    );
    setHabits(updated);
    await storage.saveHabits(updated);
    await refreshData();
  }, [habits, refreshData]);

  const deleteHabit = useCallback(async (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);
    await storage.saveHabits(updated);
    notificationService.cancelForHabit(id).catch(() => {});
  }, [habits]);

  const startTimer = useCallback((habitId: string, durationMinutes: number) => {
    const totalSeconds = durationMinutes * 60;
    const newTimer: TimerState = {
      habitId,
      isRunning: true,
      remainingSeconds: totalSeconds,
      totalSeconds,
      breakMode: false,
      breaksTaken: 0,
    };
    setTimerState(newTimer);
    storage.saveTimerState(newTimer);
  }, []);

  const tickTimer = useCallback(() => {
    setTimerState(prev => {
      if (!prev || !prev.isRunning) return prev;
      const remaining = prev.remainingSeconds - 1;
      if (remaining <= 0) {
        return { ...prev, remainingSeconds: 0, isRunning: false };
      }
      const updated = { ...prev, remainingSeconds: remaining };
      storage.saveTimerState(updated);
      return updated;
    });
  }, []);

  const startBreak = useCallback(() => {
    setTimerState(prev => {
      if (!prev) return prev;
      const breakTimer: TimerState = {
        ...prev,
        breakMode: true,
        remainingSeconds: 5 * 60,
        totalSeconds: 5 * 60,
        breaksTaken: prev.breaksTaken + 1,
      };
      storage.saveTimerState(breakTimer);
      return breakTimer;
    });
  }, []);

  const stopTimer = useCallback(async (completed: boolean) => {
    if (!timerState?.habitId) return;

    const now = Date.now();
    const elapsed = timerState.totalSeconds - timerState.remainingSeconds;

    const session: HabitSession = {
      id: `session_${now}`,
      habitId: timerState.habitId,
      startTime: now - elapsed * 1000,
      endTime: now,
      duration: elapsed,
      completed,
      date: getLocalDateString(new Date()),
    };

    await storage.addSession(session);
    setSessions(prev => [...prev, session]);

    // Update streak
    const streak = await storage.getStreak(timerState.habitId);
    const today = getLocalDateString(new Date());

    if (completed) {
      if (streak.lastCompletedDate === today) {
        // Already completed today, no change
      } else {
        const yesterday = getLocalDateString(new Date(Date.now() - 86400000));
        const newCurrent = streak.lastCompletedDate === yesterday
          ? streak.currentStreak + 1
          : 1;
        const updatedStreak: Streak = {
          ...streak,
          currentStreak: newCurrent,
          longestStreak: Math.max(newCurrent, streak.longestStreak),
          lastCompletedDate: today,
        };
        await storage.updateStreak(updatedStreak);
        setStreaks(prev => {
          const idx = prev.findIndex(s => s.habitId === streak.habitId);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = updatedStreak;
            return copy;
          }
          return [...prev, updatedStreak];
        });
      }
    } else {
      // Penalize streak for early stop
      const updatedStreak: Streak = {
        ...streak,
        currentStreak: Math.max(0, streak.currentStreak - 1),
        lastCompletedDate: streak.lastCompletedDate,
      };
      await storage.updateStreak(updatedStreak);
      setStreaks(prev => {
        const idx = prev.findIndex(s => s.habitId === streak.habitId);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = updatedStreak;
          return copy;
        }
        return [...prev, updatedStreak];
      });
    }

    setTimerState(null);
    await storage.saveTimerState(null);
  }, [timerState]);

  const getHabitStreak = useCallback((habitId: string): Streak => {
    return streaks.find(s => s.habitId === habitId) || {
      habitId,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: '',
    };
  }, [streaks]);

  const addNotifSession = useCallback(async (session: NotificationSession) => {
    setNotificationSessions(prev => [...prev, session]);
    await storage.addNotificationSession(session);
  }, []);

  const updateNotifSession = useCallback(async (
    sessionId: string,
    update: Partial<NotificationSession>,
  ) => {
    setNotificationSessions(prev =>
      prev.map(s => s.id === sessionId ? { ...s, ...update } : s),
    );
    await storage.updateNotificationSession(sessionId, update);
  }, []);

  const getNotifSessionsForHabit = useCallback(
    (habitId: string, date?: string): NotificationSession[] => {
      return notificationSessions.filter(
        s => s.habitId === habitId && (date ? s.date === date : true),
      );
    },
    [notificationSessions],
  );

  return (
    <HabitContext.Provider
      value={{
        habits,
        sessions,
        streaks,
        timerState,
        notificationSessions,
        loading,
        addHabit,
        updateHabit,
        deleteHabit,
        startTimer,
        stopTimer,
        tickTimer,
        startBreak,
        getHabitStreak,
        addNotifSession,
        updateNotifSession,
        getNotifSessionsForHabit,
        startNotifyHabit,
        stopNotifyHabit,
        refreshData,
      }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => useContext(HabitContext);
