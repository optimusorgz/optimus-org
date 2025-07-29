
import React, { useState, useEffect, useRef } from 'react';
import TypingText from './TypingText';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
// Import AVIF images
import backgroundShapes from '../assets/linkimg.avif';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faLinkedinIn, faGithub } from '@fortawesome/free-brands-svg-icons';


const SideText = styled.div`
  display: none;
`;

const pulseGradient = keyframes`
  0% {
    background-size: 100% 100%;
  }
  50% {
    background-size: 140% 140%;
  }
  100% {
    background-size: 100% 100%;
  }
`;

const HeroSection = styled.section`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 90vh;
  width: 100%;
  color: white;
  box-sizing: border-box;
  overflow: hidden;
  background: radial-gradient(
    circle 800px at 0% 0%,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.1) 30%,
    rgba(12, 12, 29, 0.8) 60%,
    rgba(12, 12, 29, 1) 80%,
    transparent 100%
  );
  z-index: 3;
  background-color: rgba(12,12,29,255);
  background-position: left top;
  background-size: 100% 100%;
  animation: ${pulseGradient} 5s ease-in-out infinite;
  align-items: stretch;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    min-height: 100vh;
  }
`;

const SocialIcons = styled.div`
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 100;
  
  a {
    color: white;
    font-size: 20px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.2);
      color:#00FFFF;
    }
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const HeroBg = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  padding: 0 10px;
  z-index: 1;
  pointer-events: none;
  &::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(15, 3, 38, 0.15);
    opacity: 1;
    z-index: -1;
    transition: opacity 0.3s ease;
  }
`;

const HeroImageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  z-index: 2;
  grid-row: 1;
  grid-column: 2;
  padding-top: 60px; /* Add space below navbar */
  @media (max-width: 600px) {
    order: -1;
    padding: 60px 0 0 0; /* More space for mobile */
    justify-content: center;
    align-items: center;
    grid-row: 1;
    grid-column: 1;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  margin: 0 10%;
  padding: 0 10% 0 8%;
  width: 100%;
  text-align: left;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  min-height: 0;
  height: 100%;
  grid-row: 1;
  grid-column: 1;

  @media (max-width: 900px) {
    margin : 0;
    padding: 0 5%;
    align-items: center;
    text-align: center;
    max-width: 100%;
    height: auto;
    grid-row: 2;
    grid-column: 1;
  }
`;


const GlobalHeroKeyframes = createGlobalStyle`
  @keyframes rotateLeftRight {
    0% { transform: rotate(-20deg); }
    50% { transform: rotate(20deg); }
    100% { transform: rotate(-20deg); }
  }
`;

const revealImage = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.35);
  }
  
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const AnimatedBgShape = styled.img`
  width: 90%;
  max-width: 600px;
  min-width: 250px;
  height: auto;
  animation: rotateLeftRight 10s infinite ease-in-out;
  will-change: transform;
  display: block;
  margin: 0 auto;
  opacity: 1;
  transform: scale(0.85);
  &.reveal {
    animation: ${revealImage} 1.2s cubic-bezier(0.4,0,0.2,1) forwards;
  }
  @media (max-width: 900px) {
    width: 80vw;
    max-width: 400px;
    margin-bottom: 24px;
  }
`;

const RotatingImage = styled.img`
  width: 90%;
  max-width: 600px;
  min-width: 250px;
  height: auto;
  animation: rotateLeftRight 4s infinite cubic-bezier(0.4,0,0.2,1);
  will-change: transform;
  @media (max-width: 900px) {
    width: 80vw;
    max-width: 400px;
    margin: 0 auto;
    display: block;
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 0;
  line-height: 1.2;
  color: white;
  font-weight: 700;
            <span className="desktop-welcome">
              <TypingText key={typingKey} text="Welcome To" speed={80} cursor={true} />
            </span>
            <span className="mobile-welcome">
              <TypingText key={typingKey} text="Welcome" speed={80} cursor={true} />
            </span>
  font-family: sans-serif;
  letter-spacing: -0.5px;
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Highlight = styled.span`
  font-size: 4.5rem;
  margin-bottom: 20px;
  line-height: 1.2;
  font-weight: 400;
  font-style: normal;
  color: rgba(255, 255, 255, 0.6);
  text-transform: none;
  position: relative;
  display: inline-block;
  font-family: sans-serif;
  letter-spacing: -0.5px;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.7s, transform 0.7s;
  &.show {
    opacity: 1;
    transform: translateY(0);
    animation: bounceOptimus 1.2s cubic-bezier(0.23, 1, 0.32, 1);
  }
  @media (max-width: 768px) {
    font-size: 1.7rem;
  }

  &::after {
    content: '';
    display: block;
    position: absolute;
    left: 50%;
    transform: translateX(-50%) scaleX(1);
    bottom: -8px;
    width: 80%;
  .desktop-welcome {
    display: inline;
    @media (max-width: 768px) {
      display: none;
    }
  }
  .mobile-welcome {
    display: none;
    @media (max-width: 768px) {
      display: inline;
    }
  }
    height: 5px;
    background: linear-gradient(90deg, #00FFFF 0%, #fff 100%);
    border-radius: 3px;
    opacity: 0.7;
    z-index: 1;
  }

  @keyframes bounceOptimus {
    0% { transform: scale(1); }
    10% { transform: scale(1.15, 0.85) translateY(-8px); }
    20% { transform: scale(0.95, 1.05) translateY(0px); }
    30% { transform: scale(1.05, 0.95) translateY(-4px); }
    40% { transform: scale(1, 1) translateY(0px); }
    100% { transform: scale(1); }
  }
`;

const Description = styled.p`
  font-size: 1.2rem;
  margin: 30px 0;
  max-width: 600px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
  font-weight: 400;
  opacity: 0;
  transition: opacity 0.7s;
  &.show {
    opacity: 1;
  }
  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin: 18px 0;
    text-align: center;
  }
`;



const StyledButton = styled(Link)`
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  background: transparent;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  pointer-events: auto;
  opacity: 0;
  transform: scale(0.35);
  &.reveal {
    animation: ${revealImage} 0.5s cubic-bezier(0.4,0,0.2,1) forwards;
  }
  &:first-child {
    background: white;
    color: #1a0740;
    border: 1px solid white;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
  }
  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 10px 14px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  text-align: left;
  justify-content: flex-start;
  gap: 15px;
  margin: 0 0 20px 0;
  padding: 0 0 30px 0;
  @media (max-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 0 0 40px 0;
    padding: 0 0 18px 0;
  }
`;

// ShapesContainer is not used and metallic3D is removed


const Shape = styled.img`
  position: absolute;
  right: -15%;
  top: 50%;
  transform: translateY(-50%);
  width: 120%;
  height: auto;
  object-fit: contain;
  z-index: 1; /* Keep this for the backgroundShapes image if needed 
  filter: drop-shadow(0 0 20px rgb(0, 0, 0));
  mix-blend-mode: normal;
`;


const Hero = () => {
  const { theme, isDarkTheme } = useTheme();
  const [showTitle, setShowTitle] = useState(false);
  const [typingKey, setTypingKey] = useState(0);
  const [showHighlight, setShowHighlight] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [descTyped, setDescTyped] = useState(false);
  const [revealImageActive, setRevealImageActive] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setShowTitle(true);
              setTypingKey(prev => prev + 1);
            }, 300);
            setTimeout(() => setShowHighlight(true), 1100);
            setTimeout(() => {
              setShowDesc(true);
              setShowButtons(true);
            }, 2100);
            setDescTyped(false);
            setRevealImageActive(true);
          } else {
            setShowTitle(false);
            setShowHighlight(false);
            setShowDesc(false);
            setShowButtons(false);
            setDescTyped(false);
          }
        });
      },
      { threshold: 0.1 }
    );
    const heroSection = document.getElementById('hero-section');
    if (heroSection) {
      observer.observe(heroSection);
    }
    return () => {
      if (heroSection) {
        observer.unobserve(heroSection);
      }
    };
  }, []);

  useEffect(() => {
    if (!revealImageActive) return;
    const timer = setTimeout(() => setRevealImageActive(false), 1200);
    return () => clearTimeout(timer);
  }, [revealImageActive]);

  // Prevent TypingText from re-typing after buttons appear
  const handleTypingEnd = () => {
    if (!showButtons) setShowButtons(true);
  };

  return (
    <>
      <GlobalHeroKeyframes />
      <HeroSection id="hero-section" theme={theme}>
        <SocialIcons>
          <a href="https://www.instagram.com/optimus.orgz/" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a href="https://www.linkedin.com/company/optimus16/" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faLinkedinIn} />
          </a>
        </SocialIcons>
        <SideText></SideText>
        <HeroImageWrapper>
          <AnimatedBgShape
            ref={imageRef}
            src={backgroundShapes}
            alt="OPTIMUS Shape"
            className={revealImageActive ? 'reveal' : ''}
          />
        </HeroImageWrapper>
        <HeroContent>
          <Title>
            <TypingText key={typingKey} text="Welcome To" speed={80} cursor={true} />
          </Title>
          <Highlight className={showHighlight ? 'show' : ''}>OPTIMUS</Highlight>
          <Description className={showDesc ? 'show' : ''}>
            A vibrant community empowering creativity, leadership, and collaboration to drive innovation and meaningful change.
          </Description>
          <ButtonContainer>
            <StyledButton
              as="a"
              href="https://script.google.com/macros/s/AKfycbyNXloPFC_uqhAFbFkTDSDiwWE3zQeTYfAEULkfOj216o-NhCI64NMpOM8QJo1YIJyg/exec"
              target="_blank"
              className={showButtons ? 'reveal' : ''}
            >
              LET'S CONNECT
            </StyledButton>
            <StyledButton
              to="/events"
              className={showButtons ? 'reveal' : ''}
            >
              EXPLORE EVENTS
            </StyledButton>
          </ButtonContainer>
        </HeroContent>
      </HeroSection>
    </>
  );
};

export default Hero;
