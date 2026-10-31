import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: AppTheme;
  dark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>('light');
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem('lpu-events-theme')
      .then((value) => {
        if (!active) return;
        if (value === 'dark' || value === 'light') setTheme(value);
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (hydrated) void AsyncStorage.setItem('lpu-events-theme', theme);
  }, [hydrated, theme]);
  const value = useMemo(() => ({
    theme,
    dark: theme === 'dark',
    toggleTheme: () => setTheme((current) => current === 'dark' ? 'light' : 'dark'),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used within ThemeProvider');
  return value;
}
