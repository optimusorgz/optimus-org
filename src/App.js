import React, { useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { GlobalStyles } from './styles/GlobalStyles';
import { useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styled from 'styled-components';
import Hero from './components/Hero';
import { Highlights } from './components/Highlights';
import Mission from './components/Mission';
import GalleryComponent from './components/Gallery';
import Footer from './components/Footer';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Team from './pages/Team';
import Gallery from './pages/Gallery';
import Events from './pages/Events';
import ScrollToTop from './components/ScrollToTop';

function AppContent() {
  const { theme } = useTheme();
  
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      mirror: false
    });
  }, []);

  return (
    <AppContainer theme={theme} isDarkTheme={theme.isDarkTheme}>
      <GlobalStyles theme={theme} />
      <Navbar />
      <Routes>
        <Route index element={
          <>
            <Hero />
            <Highlights />
            <Mission />
            <GalleryComponent />
          </>
        } />
        <Route path="/team" element={<Team />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/events" element={<Events />} />
      </Routes>
      <Footer />
    </AppContainer>
  );
}

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


function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename="/Optimus">
        <ScrollToTop />
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
