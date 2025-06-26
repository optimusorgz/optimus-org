import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
  }

  body {
    font-family: 'Arial', sans-serif;
    /* background-color: ${({ theme }) => theme.background}; */
    color: ${({ theme }) => theme.text};
    line-height: 1.6;
    min-height: 100vh;
    transition: all 0.3s ease;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  @keyframes gradientFlowDark {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes zoomOut {
    0% {
      transform: scale(1.2);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .fade-in {
    animation: fadeIn 0.5s ease-in;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  a {
    color: ${({ theme }) => theme?.primary || '#00FFFF'};
    text-decoration: none;
  }

  button {
    background: transparent;
    border: none;
    cursor: pointer;
  }
`;