import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage, KEYS } from '../services/storage';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState(null);
  const [habits, setHabits] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [timerState, setTimerState] = useState(null);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      const [prefs, h, s, u, p, t] = await Promise.all([
        storage.get(KEYS.PREFERENCES),
        storage.get(KEYS.HABITS),
        storage.get(KEYS.SESSIONS),
        storage.get(KEYS.USER),
        storage.get(KEYS.PREMIUM),
        storage.get(KEYS.TIMER),
      ]);
      if (prefs) setPreferences(prefs);
      if (h) setHabits(h);
      if (s) setSessions(s);
      if (u) setUser(u);
      if (p) setIsPremium(p);
      if (t) setTimerState(t);
      setLoading(false);
    })();
  }, []);

  // Persist changes
  useEffect(() => { if (!loading) storage.set(KEYS.PREFERENCES, preferences); }, [preferences, loading]);
  useEffect(() => { if (!loading) storage.set(KEYS.HABITS, habits); }, [habits, loading]);
  useEffect(() => { if (!loading) storage.set(KEYS.SESSIONS, sessions); }, [sessions, loading]);
  useEffect(() => { if (!loading) { if (user) storage.set(KEYS.USER, user); else storage.remove(KEYS.USER); } }, [user, loading]);
  useEffect(() => { if (!loading) storage.set(KEYS.PREMIUM, isPremium); }, [isPremium, loading]);
  useEffect(() => { if (!loading) { if (timerState) storage.set(KEYS.TIMER, timerState); else storage.remove(KEYS.TIMER); } }, [timerState, loading]);

  const toDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  const savePreferences = useCallback((prefs) => {
    setPreferences({ ...prefs, onboardingDone: true });
  }, []);

  const addHabit = useCallback((habit) => {
    const h = { id: Date.now().toString() + Math.random().toString(36).slice(2,6), ...habit, createdAt: new Date().toISOString() };
    setHabits(prev => [...prev, h]);
    return h;
  }, []);

  const deleteHabit = useCallback((id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setSessions(prev => prev.filter(s => s.habitId !== id));
  }, []);

  const addSession = useCallback((session) => {
    setSessions(prev => [...prev, session]);
  }, []);

  const getStreak = useCallback((habitId) => {
    const completed = sessions.filter(s => s.habitId === habitId && s.completed).map(s => toDateStr(new Date(s.endTime)));
    const uniqueDates = [...new Set(completed)].sort().reverse();
    if (!uniqueDates.length) return 0;
    const today = new Date(); const todayStr = toDateStr(today);
    const yest = new Date(today); yest.setDate(yest.getDate()-1); const yestStr = toDateStr(yest);
    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yestStr) return 0;
    let streak = 0; let check = new Date(uniqueDates[0]+'T00:00:00');
    for (const ds of uniqueDates) {
      if (ds === toDateStr(check)) { streak++; check.setDate(check.getDate()-1); } else break;
    }
    return streak;
  }, [sessions]);

  const completeHabit = useCallback((habitId) => {
    const now = new Date().toISOString();
    addSession({ id: Date.now().toString()+Math.random().toString(36).slice(2,6), habitId, startTime: now, endTime: now, duration: 0, completed: true, type: 'manual' });
  }, [addSession]);

  const isCompletedToday = useCallback((habitId) => {
    const todayStr = toDateStr(new Date());
    return sessions.some(s => s.habitId === habitId && s.completed && toDateStr(new Date(s.endTime)) === todayStr);
  }, [sessions]);

  return (
    <AppContext.Provider value={{
      loading, preferences, habits, sessions, user, isPremium, timerState,
      setPreferences, setHabits, setSessions, setUser, setIsPremium, setTimerState,
      addHabit, deleteHabit, addSession, getStreak, completeHabit, isCompletedToday, savePreferences,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
