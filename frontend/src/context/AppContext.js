import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage, KEYS } from '../services/storage';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [preferences, setPreferences] = useState(() => storage.get(KEYS.PREFERENCES));
  const [habits, setHabits] = useState(() => storage.get(KEYS.HABITS) || []);
  const [sessions, setSessions] = useState(() => storage.get(KEYS.SESSIONS) || []);
  const [user, setUser] = useState(() => storage.get(KEYS.USER));
  const [isPremium, setIsPremium] = useState(() => storage.get(KEYS.PREMIUM) || false);
  const [timerState, setTimerState] = useState(() => storage.get(KEYS.TIMER));

  useEffect(() => { storage.set(KEYS.PREFERENCES, preferences); }, [preferences]);
  useEffect(() => { storage.set(KEYS.HABITS, habits); }, [habits]);
  useEffect(() => { storage.set(KEYS.SESSIONS, sessions); }, [sessions]);
  useEffect(() => { if (user) storage.set(KEYS.USER, user); else storage.remove(KEYS.USER); }, [user]);
  useEffect(() => { storage.set(KEYS.PREMIUM, isPremium); }, [isPremium]);
  useEffect(() => { if (timerState) storage.set(KEYS.TIMER, timerState); else storage.remove(KEYS.TIMER); }, [timerState]);

  const savePreferences = useCallback((prefs) => {
    setPreferences({ ...prefs, onboardingDone: true });
  }, []);

  const addHabit = useCallback((habit) => {
    const newHabit = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      ...habit,
      createdAt: new Date().toISOString(),
    };
    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  }, []);

  const deleteHabit = useCallback((id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setSessions(prev => prev.filter(s => s.habitId !== id));
  }, []);

  const addSession = useCallback((session) => {
    setSessions(prev => [...prev, session]);
  }, []);

  const getStreak = useCallback((habitId) => {
    const completed = sessions
      .filter(s => s.habitId === habitId && s.completed)
      .map(s => {
        const d = new Date(s.endTime);
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      });
    const uniqueDates = [...new Set(completed)].sort().reverse();
    if (uniqueDates.length === 0) return 0;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;

    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) return 0;

    let streak = 0;
    let checkDate = new Date(uniqueDates[0] + 'T00:00:00');
    for (const dateStr of uniqueDates) {
      const checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth()+1).padStart(2,'0')}-${String(checkDate.getDate()).padStart(2,'0')}`;
      if (dateStr === checkStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [sessions]);

  const completeHabit = useCallback((habitId) => {
    const now = new Date().toISOString();
    addSession({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      habitId,
      startTime: now,
      endTime: now,
      duration: 0,
      completed: true,
      type: 'manual',
    });
  }, [addSession]);

  const isCompletedToday = useCallback((habitId) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    return sessions.some(s => {
      if (s.habitId !== habitId || !s.completed) return false;
      const d = new Date(s.endTime);
      const sStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      return sStr === todayStr;
    });
  }, [sessions]);

  const value = {
    preferences, habits, sessions, user, isPremium, timerState,
    setPreferences, setHabits, setSessions, setUser, setIsPremium, setTimerState,
    addHabit, deleteHabit, addSession, getStreak, completeHabit,
    isCompletedToday, savePreferences,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
