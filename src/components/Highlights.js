import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import AOS from 'aos';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLaptopCode, 
  faCodeBranch, 
  faUsersCog, 
  faChalkboardTeacher 
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';

const Section = styled.section`
  padding: 50px 5% ;
  text-align: center;
  position: relative;
  overflow: hidden;
background: radial-gradient(
  circle at bottom right,
  rgba(255, 255, 255, 0.3) 50px,
  rgba(255, 255, 255, 0.1) 200px,
  rgba(12, 12, 29, 0.8) 400px,
  rgba(12, 12, 29, 1) 500px,
  transparent 100%
);  background-color: rgba(12,12,29,255); /* Adjusted background color */
  background-position: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    background-color: rgba(15, 3, 38, 0.15);
  }

  @media (max-width: 768px) {
    padding: 60px 5%;
  }
`;

const Title = styled.h2`
  font-size: 2.5rem;
  color: rgba(255, 255, 255, 1.6); /* Adjusted color to be lighter */
;
  margin-bottom: 20px;
  position: relative;
  z-index: 2;

  &::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background-color: rgba(255, 255, 255, 0.6); /* Adjusted color to be lighter */

    margin: 10px auto;
  }
`;

const scrollX = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
`;

const Cards = styled.div`
  position: relative;
  z-index: 2;
  overflow: hidden;
  padding: 50px 10px;
  width: 100%;

  &:hover .scroll-container {
    animation-play-state: paused;
  }
`;

const ScrollContainer = styled.div`
  display: flex;
  gap: 30px;
  border-radius: 15px;
  animation: ${scrollX} 30s linear infinite;
  width: fit-content;
  padding-right: 30px;
`;

const Card = styled.div`
  background: ${props => props.isDarkTheme 
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.05)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.isDarkTheme 
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 15px;
  padding: 30px 20px;
  text-align: center;
  width: 20%;
  height: 70%;
  
  flex-shrink: 0;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${props => props.isDarkTheme
      ? 'linear-gradient(45deg, transparent, rgba(0, 255, 255, 0.1), transparent)'
      : 'linear-gradient(45deg, transparent, rgba(0, 139, 139, 0.1), transparent)'};
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }

  &:hover {
    transform: translateY(-10px);
    box-shadow: ${props => props.isDarkTheme
      ? '0 20px 40px rgba(0, 255, 255, 0.1)'
      : '0 20px 40px rgba(0, 139, 139, 0.1)'};
    border-color: ${props => props.isDarkTheme
      ? 'rgba(0, 255, 255, 0.3)'
      : 'rgba(0, 139, 139, 0.3)'};
  }

  &:hover::before {
    transform: translateX(100%);
  }

  .icon {
    font-size: 3rem;
      color: rgba(255, 255, 255, 0.6); /* Adjusted color to be lighter */
    background: ${props => props.isDarkTheme
      ? 'linear-gradient(45deg, #00FFFF, #00BFFF)'
      : 'linear-gradient(45deg, #008B8B, #006666)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 20px;
    transition: transform 0.3s ease;
  }

  &:hover .icon {
    transform: scale(1.1);
  }

  h3 {
    color: ${props => props.theme.primary};
    font-size: 1.8rem;
    margin-bottom: 15px;
  }

  p {
    color: ${props => props.isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'};
    line-height: 1.6;
    font-size: 1.1rem;
  }
`;

const highlights = [
  {
    icon: faLaptopCode,
    title: "Workshops",
    description: "Hands-on learning in Web, AI, IoT & more. Master new skills with expert guidance."
  },
  {
    icon: faCodeBranch,
    title: "Hackathons",
    description: "Innovate & compete in exciting challenges. Turn ideas into reality in 48 hours."
  },
  {
    icon: faUsersCog,
    title: "Team Projects",
    description: "Build real-world solutions together. Collaborate and create impactful projects."
  },
  {
    icon: faChalkboardTeacher,
    title: "Tech Talks",
    description: "Sessions with industry experts & alumni. Learn from the best in the field."
  }
];

export const Highlights = () => {
  const { theme, isDarkTheme } = useTheme();

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true
    });
  }, []);
  return (
    <Section id="highlights" theme={theme} isDarkTheme={isDarkTheme}>
      <Title 
        theme={theme} 
        isDarkTheme={isDarkTheme}
        data-aos="fade-up" 
        data-aos-duration="1000"
      >
        What We Do
      </Title>
      <Cards>
        <ScrollContainer className="scroll-container">
          {[...highlights, ...highlights].map((item, index) => (
            <Card
              key={index}
              theme={theme}
              isDarkTheme={isDarkTheme}
            >
              <FontAwesomeIcon icon={item.icon} className="icon" />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Card>
          ))}
        </ScrollContainer>
      </Cards>
    </Section>
  );
};

export default Highlights;
