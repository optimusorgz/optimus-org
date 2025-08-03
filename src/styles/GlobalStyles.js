import { createGlobalStyle, keyframes } from 'styled-components';

// --- Keyframe Animations ---
// Fade in animation with a slight upward translation
export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Gradient flow animation for backgrounds
export const gradientFlowDark = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Zoom out animation
export const zoomOut = keyframes`
  0% {
    transform: scale(1.2);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// Fade in from right animation
export const fadeRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Zoom in animation
export const zoomIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// Pulsing gradient animation (adapted from Post.js)
export const pulseGradient = keyframes`
  0%, 100% {
    background-size: 100% 100%;
    background-position: left top;
  }
  50% {
    background-size: 110% 110%;
    background-position: right bottom;
  }
`;

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap');

  /* Universal box-sizing and reset margins/paddings */
  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  /* Base body styles */
  body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(120deg, #001b2f, #38003d, #001b2f, #37003c, #001b2f, #37003c);
    background-size: 300% 300%;
    animation: ${gradientFlowDark} 12s ease infinite;
    margin: 0;
    min-height: 100vh;
    box-sizing: border-box;
    color: ${({ theme }) => theme.text}; /* Use theme for text color */
    line-height: 1.6;
    overflow-x: hidden;
  }

  /* Anchor tag base styles */
  a {
    color: ${({ theme }) => theme?.primary || '#00FFFF'};
    text-decoration: none;
  }

  /* Button base styles */
  button {
    background: transparent;
    border: none;
    cursor: pointer;
  }
`;