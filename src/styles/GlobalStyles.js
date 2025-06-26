import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(120deg, #001b2f, #38003d, #001b2f, #37003c, #001b2f, #37003c);
    background-size: 300% 300%;
    animation: gradientFlowDark 12s ease infinite;
    margin: 0;
    min-height: 100vh;
    box-sizing: border-box;
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