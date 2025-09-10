import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useStore } from '../state/store';
import { lightTheme, darkTheme } from '../data/dummyThemes';
import { AppTheme } from '../theme/types';

interface ThemeContextType {
  theme: AppTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeMode = useStore((state) => state.theme);
  const currentTheme = useMemo<AppTheme>(() =>
    themeMode === 'dark' ? darkTheme : lightTheme,
    [themeMode]
  );

  return (
    <ThemeContext.Provider value={{ theme: currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): AppTheme => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used within a ThemeProvider');
  return context.theme;
};
