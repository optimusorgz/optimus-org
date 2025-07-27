import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faLinkedinIn, faGithub } from '@fortawesome/free-brands-svg-icons';

// Import AVIF images
import backgroundShapes from '../assets/linkimg.avif';

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
    circle at top left,
    rgba(255, 255, 255, 0.3) 10%,
    rgba(255, 255, 255, 0.1) 20%,
    rgba(12, 12, 29, 0.8) 30%,
    rgba(12, 12, 29, 1) 60%,
    transparent 90%
  );
  background-color: rgba(12,12,29,255);
  background-position: center;
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

const SideText = styled.div`
  { /*position: fixed;
  right: -40px;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  font-size: 14px;
  letter-spacing: 2px;
  color: white;
  text-transform: uppercase;
  z-index: 100;
  
  @media (max-width: 768px) {
    display: none;
  } */ }
`;

// HeroBg removed backgroundShapes, now just a transparent overlay if needed
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
  @media (max-width: 900px) {
    order: -1;
    padding: 40px 0 0 0;
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
    padding: 24px 5% 0 5%;
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

const AnimatedBgShape = styled.img`
  width: 90%;
  max-width: 600px;
  min-width: 250px;
  height: auto;
  animation: rotateLeftRight 10s infinite ease-in-out;
  will-change: transform;
  display: block;
  margin: 0 auto;
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
  font-size: 4.5rem;
  margin-bottom: 0;
  line-height: 1.2;
  color: white;
  font-weight: 700;
  text-transform: none;
  font-family: sans-serif;
  letter-spacing: -0.5px;
  @media (max-width: 768px) {
    font-size: 2.8rem;
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
  animation: bounceOptimus 1.5s infinite;
  animation-delay: 0s;
  @media (max-width: 768px) {
    font-size: 2.8rem;
  }

  &::after {
    content: '';
    display: block;
    position: absolute;
    left: 50%;
    transform: translateX(-50%) scaleX(1);
    bottom: -8px;
    width: 80%;
    height: 5px;
    background: linear-gradient(90deg, #00FFFF 0%, #fff 100%);
    border-radius: 3px;
    opacity: 0.7;
    animation: bounceUnderline 1.5s infinite;
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
  @keyframes bounceUnderline {
    0% { transform: translateX(-50%) scaleX(1) scaleY(1); }
    10% { transform: translateX(-50%) scaleX(1.15) scaleY(0.7); }
    20% { transform: translateX(-50%) scaleX(0.95) scaleY(1.1); }
    30% { transform: translateX(-50%) scaleX(1.05) scaleY(0.85); }
    40% { transform: translateX(-50%) scaleX(1) scaleY(1); }
    100% { transform: translateX(-50%) scaleX(1) scaleY(1); }
  }
`;

const Description = styled.p`
  font-size: 1.2rem; /* Adjusted font size */
  margin: 30px 0;
  max-width: 600px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8); /* Adjusted color to be lighter */
  text-align: left;
  font-weight: 400;
`;

const StyledButton = styled(Link)`
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  background: transparent;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  transform: scale(0.7);
  opacity: 0;
  animation: buttonZoomIn 0.7s cubic-bezier(0.4,0,0.2,1) 0.2s forwards, rotateLeftButton 3s infinite linear;

  &:first-child {
    background: white;
    color: #1a0740;
    border: 1px solid white;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
    animation: buttonZoomIn 0.7s cubic-bezier(0.4,0,0.2,1) 0.2s forwards, rotateLeftButton 3s infinite linear;
  }

  &:hover {
    transform: scale(1.05) translateY(-3px);
    background: white;
    color: #1a0740;
  }

  &:nth-child(2) {
    animation: buttonZoomIn 0.7s cubic-bezier(0.4,0,0.2,1) 0.4s forwards, rotateRightButton 3s infinite linear;
  }

  @keyframes buttonZoomIn {
    0% {
      transform: scale(0.7);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  @keyframes rotateLeftButton {
    0% { transform: scale(1) rotate(0deg); }
    20% { transform: scale(1.03) rotate(-5deg); }
    50% { transform: scale(1) rotate(0deg); }
    70% { transform: scale(1.03) rotate(5deg); }
    100% { transform: scale(1) rotate(0deg); }
  }
  @keyframes rotateRightButton {
    0% { transform: scale(1) rotate(0deg); }
    20% { transform: scale(1.03) rotate(5deg); }
    50% { transform: scale(1) rotate(0deg); }
    70% { transform: scale(1.03) rotate(-5deg); }
    100% { transform: scale(1) rotate(0deg); }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  text-align: left;
  justify-content: flex-start;
  gap: 15px; /* Adjusted gap */
  margin-top: 40px;
  padding: 30px 0;
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

  return (
    <>
      <GlobalHeroKeyframes />
      <HeroSection theme={theme}>
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
          <AnimatedBgShape src={backgroundShapes} alt="OPTIMUS Shape" />
        </HeroImageWrapper>
        <HeroContent
          data-aos="fade-right"
          data-aos-duration="1000"
        >
          <Title>Welcome To</Title>
          <Highlight>OPTIMUS</Highlight>
          <Description>
            A vibrant community empowering creativity, leadership, and collaboration to drive innovation and meaningful change.
          </Description>
          <ButtonContainer>
            <StyledButton as="a"
              href="https://script.google.com/macros/s/AKfycbyNXloPFC_uqhAFbFkTDSDiwWE3zQeTYfAEULkfOj216o-NhCI64NMpOM8QJo1YIJyg/exec"
              target="_blank"
              data-aos="zoom-in"
              data-aos-delay="300"
            >
              LET'S CONNECT
            </StyledButton>
            <StyledButton
              to="/events"
              data-aos="zoom-in"
              data-aos-delay="400"
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
