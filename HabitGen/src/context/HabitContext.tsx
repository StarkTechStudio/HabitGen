import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Habit, HabitSession, Streak, TimerState } from '../types';
import { storage } from '../utils/storage';

interface HabitContextType {
  habits: Habit[];
  sessions: HabitSession[];
  streaks: Streak[];
  timerState: TimerState | null;
  loading: boolean;
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  startTimer: (habitId: string, durationMinutes: number) => void;
  stopTimer: (completed: boolean) => Promise<void>;
  tickTimer: () => void;
  startBreak: () => void;
  getHabitStreak: (habitId: string) => Streak;
  refreshData: () => Promise<void>;
}

const HabitContext = createContext<HabitContextType>({} as HabitContextType);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [sessions, setSessions] = useState<HabitSession[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    const [h, s, st, t] = await Promise.all([
      storage.getHabits(),
      storage.getSessions(),
      storage.getStreaks(),
      storage.getTimerState(),
    ]);
    setHabits(h);
    setSessions(s);
    setStreaks(st);
    setTimerState(t);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addHabit = useCallback(async (habit: Habit) => {
    const updated = [...habits, habit];
    setHabits(updated);
    await storage.saveHabits(updated);
  }, [habits]);

  const updateHabit = useCallback(async (habit: Habit) => {
    const updated = habits.map(h => (h.id === habit.id ? habit : h));
    setHabits(updated);
    await storage.saveHabits(updated);
  }, [habits]);

  const deleteHabit = useCallback(async (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);
    await storage.saveHabits(updated);
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
      date: new Date().toISOString().split('T')[0],
    };

    await storage.addSession(session);
    setSessions(prev => [...prev, session]);

    // Update streak
    const streak = await storage.getStreak(timerState.habitId);
    const today = new Date().toISOString().split('T')[0];

    if (completed) {
      if (streak.lastCompletedDate === today) {
        // Already completed today, no change
      } else {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
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

  return (
    <HabitContext.Provider
      value={{
        habits,
        sessions,
        streaks,
        timerState,
        loading,
        addHabit,
        updateHabit,
        deleteHabit,
        startTimer,
        stopTimer,
        tickTimer,
        startBreak,
        getHabitStreak,
        refreshData,
      }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => useContext(HabitContext);
