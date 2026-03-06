import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@habitgen_';

export const KEYS = {
  PREFERENCES: PREFIX + 'preferences',
  HABITS: PREFIX + 'habits',
  SESSIONS: PREFIX + 'sessions',
  TIMER: PREFIX + 'timer',
  USER: PREFIX + 'user',
  PREMIUM: PREFIX + 'premium',
};

export const storage = {
  async get(key) {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },
  async set(key, value) {
    try { await AsyncStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  },
  async remove(key) {
    try { await AsyncStorage.removeItem(key); }
    catch {}
  },
  async clearAll() {
    try { await AsyncStorage.multiRemove(Object.values(KEYS)); }
    catch {}
  },
};
