import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext';

const ToggleButton = styled.button`
  background: ${props => props.theme.primary};
  color: ${props => props.theme.background};
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 20px;

  &:hover {
    background: ${props => props.theme.hoverColor};
    transform: scale(1.05);
  }
`;

const ThemeToggle = () => {
  const { theme, toggleTheme, isDarkTheme } = useTheme();

  return (
    <ToggleButton onClick={toggleTheme} theme={theme}>
      {isDarkTheme ? '☀️ Light' : '🌙 Dark'}
    </ToggleButton>
  );
};

export default ThemeToggle;