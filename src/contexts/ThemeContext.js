import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? darkColors : lightColors
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Color schemes
const lightColors = {
  background: '#ffffff',
  text: '#333333',
  navBg: '#f0f0f0',
  navBorder: '#cccccc',
  cardBg: '#ffffff',
  cardShadow: 'rgba(0,0,0,0.1)',
  hoverBg: '#e0e0e0',
  primary: '#007bff',
  secondary: '#6c757d'
};

const darkColors = {
  background: '#1a1a1a',
  text: '#ffffff',
  navBg: '#2d2d2d',
  navBorder: '#404040',
  cardBg: '#2d2d2d',
  cardShadow: 'rgba(0,0,0,0.3)',
  hoverBg: '#404040',
  primary: '#0056b3',
  secondary: '#495057'
};