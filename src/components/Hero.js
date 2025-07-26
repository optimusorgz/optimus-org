import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faLinkedinIn, faGithub } from '@fortawesome/free-brands-svg-icons';

// Import AVIF images
import backgroundShapes from '../assets/6814a15afea82ff3505d163e_shape-2-p-800.avif';
import metallic3D from '../assets/6814a411594d8a7230486656_Color=Dark,-Variant=Metallic-(4)-p-800.avif';

const HeroSection = styled.section`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  color: white;
  width: 100%;
  min-height: 90vh;
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
  background-color: rgba(12,12,29,255); /* Adjusted background color */
  background-position: center;
  
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

const HeroBg = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  padding: 0 10px;
  z-index: 1;
  background-image: url(${backgroundShapes});
  background-repeat: no-repeat;
  background-size: 600px;
  background-position: bottom right;
  opacity: 1; /* Adjusted opacity */

  &::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(15, 3, 38, 0.15);
    opacity: 1; /* Adjusted opacity */
    z-index: -1;
    transition: opacity 0.3s ease;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  padding: 10% 0;
  width: 100%;
  height: 100%;
  text-align: left;
  padding-left: 5%;
  animation: zoomOut 1s ease-in backwards;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding-right: 45%;
  
  @media (max-width: 768px) {
    padding-right: 10%;
  }
`;

const Title = styled.h1`
  font-size: 4.5rem;
  margin-bottom: 0;
  width: 600px;
  
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
  font-family:
  margin-bottom: 20px;
  line-height: 1.2;
  font-weight: 400;
  font-style: normal;
  color: rgba(255, 255, 255, 0.6); /* Adjusted color to be lighter */
  text-transform: none;
  position: relative;
  display: block;
  font-family: sans-serif;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 2.8rem;
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

  &:first-child {
    background: white;
    color: #1a0740;
    border: 1px solid white;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
  }

  &:hover {
    transform: translateY(-3px);
    background: white; /* Keep hover background white for both */
    color: #1a0740; /* Keep hover color dark for both */
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  text-align: left;
  justify-content: flex-start;
  gap: 15px; /* Adjusted gap */
  margin-top: 40px;
`;

const ShapesContainer = styled.div`
  position: absolute;
  top: 10;
  right: 0;
  width: 70%; /* Adjusted width */
  height: 100%;
  z-index: 1;
  overflow: hidden;
  background-image: url(${metallic3D});
  background-size: cover; /* Keep cover */
  background-position: bottom right; /* Adjusted position */
  opacity: 1; /* Adjusted opacity */
  
  @media (max-width: 768px) {
    display: none;
  }
`;


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
    <HeroSection theme={theme}>
       <SocialIcons>
        <a href="https://www.instagram.com/optimus.orgz/" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faInstagram} />
        </a>
        <a href="https://www.linkedin.com/company/optimus16/" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faLinkedinIn} />
        </a>
        <a href="https://www.linkedin.com/company/optimus16/" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faGithub} />
        </a>
      </SocialIcons>
      <SideText></SideText> 
      <ShapesContainer>
      </ShapesContainer>
      <HeroBg isDarkTheme={isDarkTheme}>
        <HeroContent 
          data-aos="fade-right" 
          data-aos-duration="1000"
        >
          <Title>Welcome To</Title>
          <Highlight>OPTIMUS</Highlight>
          <Description>
          A vibrant community empowering creativity, leadership, and collaboration to drive innovation and meaningful change.          </Description>
          <ButtonContainer>
            <StyledButton as="a"
            href="https://script.google.com/macros/s/AKfycbzal-X62oMRF-VvE3KNk7fUsWuXlc_o29pzzX6aKy8hNpCsWoMv1aohOfHszGnX1S7O/exec" 
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
      </HeroBg>
    </HeroSection>
  );
};

export default Hero;
