import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ThemeMode } from '../types';
import { Theme, LightTheme, DarkTheme } from '../types/theme';
import { storage } from '../utils/storage';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DarkTheme,
  themeMode: 'dark',
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    storage.getUserPreferences().then(prefs => {
      if (prefs?.theme) {
        setThemeMode(prefs.theme);
      }
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      storage.updateUserPreferences({ theme: next });
      return next;
    });
  }, []);

  const theme = themeMode === 'dark' ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
