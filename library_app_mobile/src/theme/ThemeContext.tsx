import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useStore } from '../state/store';
import { lightTheme, darkTheme } from './index';
import { AppTheme } from './types';

interface ThemeContextType {
  theme: AppTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme } = useStore();
  const currentTheme = useMemo<AppTheme>(() => 
    theme === 'dark' ? darkTheme : lightTheme, 
    [theme]
  );

  return (
    <ThemeContext.Provider value={{ theme: currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): AppTheme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context.theme;
};