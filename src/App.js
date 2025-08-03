/**
 * @file App.js
 * @description Main application component responsible for routing, theme provisioning, and global layout.
 * It sets up the React Router, provides theme context to the entire application, and initializes AOS animations.
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Context Imports
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Style Imports
import { GlobalStyles } from './styles/GlobalStyles';

// Component Imports
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HighlightsAndMission from './components/HighlightsAndMission';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Page Imports
import Team from './pages/Team';
import Gallery from './pages/Gallery';
import Events from './pages/Events';
import Post from './pages/Post';

// Styled component for the main application container
const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${({ isDarkTheme }) =>
      isDarkTheme
        ? 'linear-gradient(120deg, rgba(0, 27, 47, 0.95), rgba(56, 0, 61, 0.95))'
        : 'linear-gradient(120deg, rgba(255, 255, 255, 0.95), rgba(240, 240, 255, 0.95))'};
    z-index: -1;
    transition: all 0.3s ease;
  }
`;

/**
 * AppContent component.
 * Manages theme application, initializes AOS animations, and defines the main routing structure.
 * @returns {JSX.Element} The main content of the application.
 */
function AppContent() {
  const { theme, isDarkTheme } = useTheme();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      mirror: false
    });
  }, []);

  return (
    <AppContainer theme={theme} isDarkTheme={isDarkTheme}>
      <GlobalStyles theme={theme} />
      <Navbar />
      <Routes>
        <Route
          index
          element={
            <>
              <Hero />
              <HighlightsAndMission />
            </>
          }
        />
        <Route path="/team" element={<Team />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/events" element={<Events />} />
        <Route path="/post" element={<Post />} />
      </Routes>
      <Footer />
    </AppContainer>
  );
}

/**
 * App component.
 * Serves as the root component, providing ThemeProvider and BrowserRouter to the application.
 * It wraps the AppContent and ScrollToTop components.
 * @returns {JSX.Element} The root React application.
 */
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
