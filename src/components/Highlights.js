import React, { useEffect, useState, useRef } from 'react';
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
import TypingText from './TypingText';

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


// Smoother bounce keyframes for title letters
const bounceUp = keyframes`
  0% { transform: translateY(0); }
  10% { transform: translateY(-10px); }
  20% { transform: translateY(-18px); }
  30% { transform: translateY(-12px); }
  40% { transform: translateY(-6px); }
  50% { transform: translateY(0); }
  60% { transform: translateY(-3px); }
  70% { transform: translateY(0); }
  100% { transform: translateY(0); }
`;

const AnimatedLetter = styled.span`
  display: inline-block;
  transition: color 0.2s;
  font-size: inherit;
  &.bounce {
    animation: ${bounceUp} 1.5s cubic-bezier(0.23, 1, 0.32, 1);
    color: #00FFFF;
    will-change: transform;
  }
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const Section = styled.section`
  padding: 50px 5% ;
  text-align: center;
  position: relative;
  overflow: hidden;
background: radial-gradient(
  circle at bottom right,
  rgba(255, 255, 255, 0.3) 120px,
  rgba(255, 255, 255, 0.1) 250px,
  rgba(12, 12, 29, 0.8) 450px,
  rgba(12, 12, 29, 1) 500px,
  transparent 100%
);
background-color: rgba(12,12,29,255); /* Adjusted background color */
background-position: center;
background-size: 100% 100%;
animation: ${pulseGradient} 5s ease-in-out infinite;

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
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 1.6); /* Adjusted color to be lighter */
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

  @media (max-width: 768px) {
    font-size: 0.8rem;
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
  padding: 10px 0 0 0;
  width: 100%;
`;

const ScrollContainer = styled.div`
  display: flex;
  gap: 12px;
  border-radius: 15px;
  animation: ${scrollX} 60s linear infinite;
  width: fit-content;
  padding-right: 0;
  opacity: ${props => (props.fadein ? 1 : 0)};
  transform: translateY(${props => (props.fadein ? '0' : '40px')});
  transition: opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1);

  @media (max-width: 768px) {
    gap: 0;
    padding-right: 0;
  }
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
  margin: 0 10px;
  padding: 30px 20px;
  text-align: center;
  width: 180px;
  min-width: 180px;
  max-width: 180px;
  aspect-ratio: 1 / 1;
  height: 180px;
  min-height: 180px;
  max-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

  @media (max-width: 768px) {
    width: 34vw;
    min-width: 34vw;
    max-width: 34vw;
    aspect-ratio: 1 / 1;
    height: 34vw;
    min-height: 34vw;
    max-height: 34vw;
    padding: 5px 6px;
    margin: 0 5px;
    svg {
      font-size: 1.7rem;
      margin-bottom: 10px;
    }
    h4 {
      font-size: 1.1rem;
    }
    p {
      font-size: 0.8rem;
    }
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
    font-size: 1.6rem;
    color: rgba(255, 255, 255, 0.6); /* Adjusted color to be lighter */
    background: ${props => props.isDarkTheme
    ? 'linear-gradient(45deg, #00FFFF, #00BFFF)'
    : 'linear-gradient(45deg, #008B8B, #006666)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 12px;
    transition: transform 0.3s ease;
  }

  h3 {
    color: ${props => props.theme.primary};
    font-size: 1.1rem;
    margin-bottom: 8px;
  }

  p {
    color: ${props => props.isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'};
    line-height: 1.5;
    font-size: 0.8rem;
  }

  @media (max-width: 768px) {
    .icon {
      font-size: 1.1rem;
      margin-bottom: 6px;
    }
    h3 {
      font-size: 0.8rem;
      margin-bottom: 4px;
    }
    p {
      font-size: 0.65rem;
    }
  }

  &:hover .icon {
    transform: scale(1.1);
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
  const [paused, setPaused] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [typingKey, setTypingKey] = useState(0);
  const sectionRef = useRef(null);
  const scrollTimeout = useRef();

  useEffect(() => {
    setPaused(true);
    setFadeIn(false);
    scrollTimeout.current = setTimeout(() => {
      setPaused(false);
      setFadeIn(true);
    }, 200);
    return () => clearTimeout(scrollTimeout.current);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setPaused(true);
            setFadeIn(false);
            clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => {
              setPaused(false);
              setFadeIn(true);
              setTypingKey(prev => prev + 1);
            }, 200);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      clearTimeout(scrollTimeout.current);
    };
  }, []);

  // Pause scroll on hover
  const handleMouseEnter = () => setPaused(true);
  const handleMouseLeave = () => setPaused(false);

  const title = 'What We Do';

  return (
    <Section id="highlights" theme={theme} isDarkTheme={isDarkTheme} ref={sectionRef}>
      <Title
        theme={theme}
        isDarkTheme={isDarkTheme}
        style={{ textAlign: 'center', display: 'block' }}
      >
        <TypingText key={typingKey} text={title} speed={80} cursor={true} />
      </Title>
      <Cards>
        <ScrollContainer
          className="scroll-container"
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
          fadein={fadeIn}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {Array(6).fill(null).flatMap(() => highlights).map((item, index) => (
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
