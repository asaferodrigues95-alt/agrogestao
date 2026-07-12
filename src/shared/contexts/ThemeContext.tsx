import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ensureSettings, updateSettings } from '@data/repositories';

interface ThemeCtx { theme: 'light' | 'dark'; toggleTheme: () => void; }
const ThemeContext = createContext<ThemeCtx>({ theme: 'light', toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    ensureSettings().then(s => setTheme(s.theme));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      updateSettings({ theme: next });
      return next;
    });
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
