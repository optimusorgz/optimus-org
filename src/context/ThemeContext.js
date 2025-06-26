import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  
  const theme = {
    isDarkTheme,
    background: isDarkTheme ? '#000000' : '#ffffff',
    text: isDarkTheme ? '#ffffff' : '#000000',
    primary: isDarkTheme ? '#00FFFF' : '#008B8B',
    secondary: isDarkTheme ? '#008B8B' : '#006666',
    navBackground: isDarkTheme ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    cardBackground: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    cardBorder: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    shadow: isDarkTheme ? '0 4px 6px rgba(0, 255, 255, 0.1)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
    hoverColor: isDarkTheme ? '#00FFFF' : '#008B8B'
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};