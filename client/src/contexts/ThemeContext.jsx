import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const THEME_KEY = 'candiez_theme';

export function ThemeProvider({ children }) {
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    // Also check system preference if no saved preference
    if (!saved) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return saved;
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
