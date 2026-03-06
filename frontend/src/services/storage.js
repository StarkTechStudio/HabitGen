const PREFIX = 'habitgen_';

export const KEYS = {
  PREFERENCES: PREFIX + 'preferences',
  HABITS: PREFIX + 'habits',
  SESSIONS: PREFIX + 'sessions',
  TIMER: PREFIX + 'timer',
  USER: PREFIX + 'user',
  PREMIUM: PREFIX + 'premium',
};

export const storage = {
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch { /* storage full */ }
  },
  remove(key) {
    localStorage.removeItem(key);
  },
  clear() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  },
};
