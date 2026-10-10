import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_THEME, DARK_THEME, COMMON_THEME } from '../constants/theme';

const THEME_STORAGE_KEY = 'tms_theme_mode';

export const ThemeContext = createContext({
  theme: { ...COMMON_THEME, colors: LIGHT_THEME.colors, mode: 'light' },
  isDark: false,
  toggleTheme: () => {},
  setThemeMode: () => {}
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode === 'light') {
          setIsDark(false);
        } else {
          setIsDark(true);
        }
      } catch (err) {
        console.error('Error loading theme preference:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  const toggleTheme = async () => {
    try {
      const nextMode = !isDark;
      setIsDark(nextMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode ? 'dark' : 'light');
    } catch (err) {
      console.error('Error saving theme preference:', err);
    }
  };

  const setThemeMode = async (mode) => {
    try {
      const nextMode = mode === 'dark';
      setIsDark(nextMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (err) {
      console.error('Error setting theme mode:', err);
    }
  };

  const activeColors = isDark ? DARK_THEME.colors : LIGHT_THEME.colors;

  const currentTheme = {
    ...COMMON_THEME,
    mode: isDark ? 'dark' : 'light',
    colors: activeColors
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        isDark,
        toggleTheme,
        setThemeMode,
        isLoading
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
