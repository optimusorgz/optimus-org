import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

// Local Imports
import TypingText from './TypingText';
import InfiniteTypingText from './InfiniteTypingText';
import { useTheme } from '../context/ThemeContext';

// FontAwesome Icons
import {
  faLaptopCode,
  faCodeBranch,
  faUsersCog,
  faChalkboardTeacher,
  faBullseye,
  faEye,
  faLightbulb,
  faUsers,
  faTrophy,
  faSeedling,
  faGlobeAmericas,
  faRocket
} from '@fortawesome/free-solid-svg-icons';

// Keyframe Animations
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

const pulseRadial = keyframes`
  0% {
    background-size: 420px 420px;
  }
  50% {
    background-size: 600px 600px;
  }
  100% {
    background-size: 420px 420px;
  }
`;

const revealFade = keyframes`
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const pulseGradient = keyframes`
  0%, 100% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0.9;
  }
`;

const underlinePulse = keyframes`
  0% { width: 80px; }
  50% { width: 160px; }
  100% { width: 80px; }
`;

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

// Styled Components - Common
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

// Styled Components - Highlights Section
const HighlightsSection = styled.section`
  padding: 50px 5% ;
  text-align: center;
  position: relative;
  overflow: hidden;
  background-color: rgba(12,12,29,255);
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
  padding: 20px 0 0 0;
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


const MissionSection = styled.section`
  position: relative;
  min-height: 100%;
  padding-top: 0;
  background-color: rgba(12, 12, 29, 1);
  background-position: left top;
  background-size: 100% 100%;
  align-items: stretch;
  transition: background-color 0.3s ease;
  overflow: visible;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 95%;
    left: 102%; /* Bottom Left */
    width: 800px;
    height: 800px;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.3) 2%,
      rgba(255, 255, 255, 0.1) 8%,
      rgba(12, 12, 29, 0.8) 25%,
      rgba(12, 12, 29, 1) 40%,
      transparent 90%
    );
    border-radius: 50%;
    z-index: 1;
    animation: ${pulseGradient} 5s ease-in-out infinite;
  }

  &::before {
    top: 15%;
    right: calc(100% - 10px); /* Top Right */
    transform: translate(-50%, -50%) scale(1);
  }

  &::after {
    bottom: 5%;
    left: -70px; /* Bottom Right */
    transform: translate(50%, 50%) scale(1);
  }

  .extra-glow {
    position: absolute;
    bottom: 0;
    right: 100%; /* Bottom Left */
    width: 800px;
    height: 800px;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.3) 5%,
      rgba(255, 255, 255, 0.1) 10%,
      rgba(12, 12, 29, 0.8) 25%,
      rgba(12, 12, 29, 1) 40%,
      transparent 90%
    );
    border-radius: 50%;
    z-index: 2;
    animation: ${pulseGradient} 5s ease-in-out infinite;
    transform: translate(0, 50%) scale(1);
    pointer-events: none;
  }

  @media (max-width: 900px) {
    min-height: 100vh;
  }

  @media (max-width: 768px) {
    padding: 60px 5%;
  }

`;

const MissionContainer = styled.div`
  max-width: 1200px;
  margin: auto;
  position: relative;
  z-index: 2;
`;

const MissionHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
  &.values {
    margin-top: 60px;
  }
`;

const rotateZ = keyframes`
  0% { transform: rotateZ(0deg); }
  20% { transform: rotateZ(5deg); }
  50% { transform: rotateZ(0deg); }
  70% { transform: rotateZ(-5deg); }
  100% { transform: rotateZ(0deg); }
`;

const HeaderTitle = styled.h2`
  font-size: 2.5rem;
  color: #fff;
  font-weight: 700;
  text-align: center;
  margin-bottom: 30px;
  margin-top: 40px;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.18);
  position: relative;
  font-family: inherit;

  &::after {
    content: '';
    display: block;
    margin: 0.5em auto 0 auto;
    width: 80px;
    height: 4px;
    background-color: #ffffffff;
    border-radius: 2px;
    animation: ${underlinePulse} 2.2s ease-in-out infinite;
  }

  @media (max-width: 600px) {
    font-size: 1.45rem;
    margin-bottom: 16px;
    margin-top: 22px;
    &::after {
      width: 50px;
      height: 3px;
    }
  }
`;

const MissionContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 70px;
  padding: 20px 10%;

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 30px;
    padding: 10px 2%;
    align-items: stretch;
  }
`;

const fadeLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-60px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;
const fadeRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(60px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const MissionSectionBox = styled.div`
  flex: 1 1 0;
  min-width: 220px;
  max-width: 500px;
  min-height: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${props => props.isDarkTheme ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'};
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
  background-size: 100% 100%;
  border-radius: 18px;
  padding: 10% 5%;
  margin: 0;
  transition: border-color 0.3s;
  box-sizing: border-box;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  width: 100%;
  border: 2.5px solid ${props => props.isDarkTheme ? 'rgba(0,255,255,0.25)' : 'rgba(0,139,139,0.25)'};
  opacity: 1;
  animation: none;

  @media (max-width: 1024px) {
    min-width: 0;
    max-width: 100%;
    width: 100%;
    padding: 28px 12px;
  }
`;

const CardTitle = styled.h2`
  font-size: 2.25rem;
  color: rgba(255, 255, 255, 1.6);
  margin-bottom: 16px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  justify-content: center;
  text-align: center;
  margin: 0 10px 30px 10px;
  font-family: inherit;

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    top: 100%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background-color: rgba(255, 255, 255, 1.6);
    border-radius: 2px;
    animation: ${underlinePulse} 2.2s ease-in-out infinite;
  }

  svg {
    font-size: 1.4rem;
    filter: drop-shadow(0 0 6px ${props => props.isDarkTheme
    ? 'rgba(0, 255, 255, 0.2)'
    : 'rgba(0, 139, 139, 0.2)'});
  }

  @media (max-width: 600px) {
    font-size: 1.45rem;
    margin-bottom: 10px;
    margin: 0 4px 18px 4px;
    svg {
      font-size: 1.1rem;
    }
  }
`;

const CardText = styled.p`
  font-size: 1.02rem;
  color: #e0e0e0;
  margin-bottom: 0;
  text-align: center;
  font-weight: 400;
  margin: 0 10px 0 10px;
  font-family: inherit;
  opacity: 1;
  transform: none;
  animation: none;
  &.reveal {
    animation: ${revealImage} 0.8s cubic-bezier(0.4,0,0.2,1) forwards;
  }
  @media (max-width: 900px) {
    font-size: 0.92rem;
  }
  @media (max-width: 600px) {
    font-size: 0.82rem;
    margin: 0 4px 0 4px;
  }
`;

const CoreValues = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 40px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ValueItem = styled.div`
  background: ${props => props.isDarkTheme
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(0, 0, 0, 0.03)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.isDarkTheme
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

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
    ? '0 15px 30px rgba(0, 255, 255, 0.1)'
    : '0 15px 30px rgba(0, 139, 139, 0.1)'};
    border-color: ${props => props.isDarkTheme
    ? 'rgba(0, 255, 255, 0.2)'
    : 'rgba(0, 139, 139, 0.2)'};
  }

  &:hover::before {
    transform: translateX(100%);
  }

  svg {
    font-size: 2.5rem;
    color: ${props => props.isDarkTheme ? '#00FFFF' : '#008B8B'};
    margin-bottom: 20px;
    filter: drop-shadow(0 0 10px ${props => props.isDarkTheme
    ? 'rgba(0, 255, 255, 0.3)'
    : 'rgba(0, 139, 139, 0.3)'});
    transition: font-size 0.3s;
  }

  @media (max-width: 768px) {
    width: 41vw;
    min-width: 41vw;
    max-width: 41vw;
    aspect-ratio: 1 / 1;
    height: 41vw;
    min-height: 41vw;
    max-height: 41vw;
    padding: 5px 6px;
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
`;

const ValueTitle = styled.h4`
  color: ${props => props.isDarkTheme ? '#00FFFF' : '#008B8B'};
  font-size: 1.55rem;
  margin-bottom: 10px;
`;

const ValueText = styled.p`
  font-size: 0.9rem;
  color: ${props => props.isDarkTheme
    ? 'rgba(255, 255, 255, 0.8)'
    : 'rgba(0, 0, 0, 0.8)'};
  margin: 0;
`;

// Styled Components - Gallery Section
const GallerySection = styled.section`
  padding: 0px 7% 100px 7%;
  padding-top: 0 !important;
  position: relative;
  overflow: hidden;
  background-color: rgba(12,12,29,255);
  transition: background 0.3s ease;
  @media (max-width: 768px) {
    padding: 60px 5%;
  }
`;

const GalleryHeader = styled.div`
  text-align: center;
  margin: 60px 0 0 0;
  position: relative;
  z-index: 1;

  h2 {
    font-size: 2.5rem;
    color: #fff;
    font-weight: 700;
    text-align: center;
    margin-bottom: 30px;
    margin-top: 40px;
    letter-spacing: 1px;
    text-shadow: 0 2px 8px rgba(0,0,0,0.18);
    position: relative;
    font-family: inherit;
    display: inline-block;
    transition: all 0.3s ease;
    &::after {
      content: '';
      display: block;
      margin: 0.5em auto 0 auto;
      width: 80px;
      height: 4px;
      background-color: #ffffffff;
      border-radius: 2px;
      animation: ${underlinePulse} 2.2s ease-in-out infinite;
    }
    @media (max-width: 600px) {
      font-size: 1.45rem;
      margin-bottom: 16px;
      margin-top: 22px;
      &::after {
        width: 50px;
        height: 3px;
      }
    }
  }
`;

const StyledSwiper = styled(Swiper)`
  width: 100%;
  padding: 50px 0;  .swiper-slide {
    position: relative;
    width: 400px;
    height: 400px;
    overflow: hidden;
    border-radius: 15px;
    transform: scale(0.7) translateY(50px);
    transition: all 0.5s ease;
    opacity: 0.6;
    box-shadow: ${props => props.isDarkTheme
    ? '0 10px 30px rgba(0, 255, 255, 0.1)'
    : '0 10px 30px rgba(0, 139, 139, 0.1)'};
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }    &:hover {
      img {
        transform: scale(1.1);
      }
    }
  }  .swiper-slide-active {
    transform: scale(1) translateY(0);
    opacity: 1;
    z-index: 2;
  }
  
  .swiper-slide-prev {
    transform: scale(0.7) translateY(50px) translateX(25%) rotate(-5deg);
    opacity: 0.7;
  }
  
  .swiper-slide-next {
    transform: scale(0.7) translateY(50px) translateX(-25%) rotate(5deg);
    opacity: 0.7;
  }

  .swiper-pagination-bullet {
    background: ${props => props.isDarkTheme ? '#00FFFF' : '#008B8B'};
    opacity: 0.5;
    transition: all 0.3s ease;
  }

  .swiper-pagination-bullet-active {
    opacity: 1;
    background: ${props => props.isDarkTheme
    ? 'linear-gradient(to right, #00FFFF, #00BFFF)'
    : 'linear-gradient(to right, #008B8B, #006666)'};
  }
`;

// Decorative Elements
const GradientDivider = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  width: 300px;
  height: 600px;
  z-index: 1;
  pointer-events: none;
  background: none;
  background-color: rgba(12,12,29,255);
  filter: none;
  opacity: 1;
  animation: none;
  @media (max-width: 900px) {
    width: 220px;
    height: 220px;
    top: -30px;
    animation: none;
  }
`;

function HighlightsAndMission() {
  const { theme, isDarkTheme } = useTheme();

  // Highlights Section State and Effects
  const [paused, setPaused] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [typingKey, setTypingKey] = useState(0);
  const highlightsSectionRef = useRef(null);
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
    const section = highlightsSectionRef.current;
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

  const handleMouseEnter = () => setPaused(true);
  const handleMouseLeave = () => setPaused(false);
  const highlightsTitle = 'What We Do';

  const highlightsData = [
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

  // Mission Section State and Effects
  const [isHoveredMission, setIsHoveredMission] = useState(false);
  const [isHoveredVision, setIsHoveredVision] = useState(false);

  const { ref: missionRef, inView: missionInView } = useInView({ triggerOnce: false, threshold: 0.2 });
  const { ref: visionRef, inView: visionInView } = useInView({ triggerOnce: false, threshold: 0.2 });
  const { ref: coreRef, inView: coreInView } = useInView({ triggerOnce: false, threshold: 0.2 });
  const [missionRevealKey, setMissionRevealKey] = useState(0);
  const [visionRevealKey, setVisionRevealKey] = useState(0);

  useEffect(() => {
    if (missionInView) setMissionRevealKey(prev => prev + 1);
  }, [missionInView]);

  useEffect(() => {
    if (visionInView) setVisionRevealKey(prev => prev + 1);
  }, [visionInView]);

  useEffect(() => {
    AOS.init({
      duration: 1400,
      mirror: false,
      offset: 100
    });
  }, []);

  const coreValues = [
    { icon: faLightbulb, title: 'Innovation', description: 'Pushing boundaries and creating new solutions' },
    { icon: faUsers, title: 'Teamwork', description: 'Collaborating to achieve common goals' },
    { icon: faTrophy, title: 'Excellence', description: 'Striving for the highest standards' },
    { icon: faSeedling, title: 'Growth Mindset', description: 'Continuous learning and development' },
    { icon: faGlobeAmericas, title: 'Community Impact', description: 'Making a positive difference together' },
    { icon: faRocket, title: 'Leadership', description: 'Inspiring and guiding others to success' }
  ];

  // Gallery Section Data
  const gallerySlides = [
    {
      image: require('../assets/gallary/IMG_0358.jpg'),
      title: 'Annual Hackathon',
      description: 'Students collaborating and innovating in our biggest event of the year'
    },
    {
      image: require('../assets/gallary/IMG_4972.jpg'),
      title: 'Tech Workshops',
      description: 'Hands-on learning sessions with industry experts'
    },
    {
      image: require('../assets/gallary/IMG_0333.jpg'),
      title: 'Tech Workshops',
      description: 'Hands-on learning sessions with industry experts'
    },
    {
      image: require('../assets/gallary/IMG_0338.jpg'),
      title: 'Tech Workshops',
      description: 'Hands-on learning sessions with industry experts'
    },
    {
      image: require('../assets/gallary/IMG_5760.jpeg'),
      title: 'Team Projects',
      description: 'Collaborative projects bringing ideas to life'
    },
    {
      image: require('../assets/gallary/IMG_0338.jpg'),
      title: 'Community Events',
      description: 'Building connections and sharing knowledge'
    },
    {
      image: require('../assets/gallary/IMG_0317.jpg'),
      title: 'Innovation Lab',
      description: 'Where ideas transform into reality'
    }
  ];

  return (
    <>
      {/* Highlights Section */}
      <HighlightsSection id="highlights" theme={theme} isDarkTheme={isDarkTheme} ref={highlightsSectionRef}>
        <Title
          theme={theme}
          isDarkTheme={isDarkTheme}
          style={{ textAlign: 'center', display: 'block' }}
        >
          <TypingText key={typingKey} text={highlightsTitle} speed={80} cursor={true} />
        </Title>
        <Cards>
          <ScrollContainer
            className="scroll-container"
            style={{ animationPlayState: paused ? 'paused' : 'running' }}
            fadein={fadeIn}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {Array(6).fill(null).flatMap(() => highlightsData).map((item, index) => (
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
      </HighlightsSection>

      {/* Decorative radial gradient divider */}
      <GradientDivider />

      {/* Mission Section */}
      <MissionSection id="mission" isDarkTheme={isDarkTheme}>
        <MissionContainer>
          <MissionContent>
            {/* Mission Section - Our Mission Box */}
            <MissionSectionBox
              ref={missionRef}
              isDarkTheme={isDarkTheme}
              inview={1}
              fade="none"
            >
              <CardTitle isDarkTheme={isDarkTheme}>
                <FontAwesomeIcon icon={faBullseye} />
                <InfiniteTypingText text="Our Mission" speed={80} fontSize="inherit" />
              </CardTitle>
              <CardText isDarkTheme={isDarkTheme} className={missionInView ? 'reveal' : ''} key={missionRevealKey}>
                {"At Optimus, we're dedicated to creating a dynamic space where innovation thrives. Our mission is to empower students through hands-on learning, collaborative projects, and real-world challenges. We believe in nurturing talent and providing the tools needed to turn ideas into impactful solutions."}
              </CardText>
            </MissionSectionBox>

            {/* Mission Section - Our Vision Box */}
            <MissionSectionBox
              ref={visionRef}
              isDarkTheme={isDarkTheme}
              inview={1}
              fade="none"
            >
              <CardTitle isDarkTheme={isDarkTheme}>
                <FontAwesomeIcon icon={faEye} />
                <InfiniteTypingText text="Our Vision" speed={80} fontSize="inherit" />
              </CardTitle>
              <CardText isDarkTheme={isDarkTheme} className={visionInView ? 'reveal' : ''} key={visionRevealKey}>
                {"We envision a future where every student has the opportunity to develop their technical skills and leadership abilities. Our goal is to build a community that not only learns together but also creates lasting impact through technology and innovation."}
              </CardText>
            </MissionSectionBox>
          </MissionContent>

          {/* Mission Section - Core Values Header */}
          <MissionHeader className="values">
            <HeaderTitle isDarkTheme={isDarkTheme} ref={coreRef}>
              <InfiniteTypingText text="Core Values" speed={80} fontSize="inherit" />
            </HeaderTitle>
          </MissionHeader>

          {/* Mission Section - Core Values Grid */}
          <CoreValues>
            {coreValues.map((value, index) => (
              <ValueItem
                key={index}
                isDarkTheme={isDarkTheme}
              >
                <FontAwesomeIcon icon={value.icon} />
                <ValueTitle isDarkTheme={isDarkTheme}>{value.title}</ValueTitle>
                <ValueText isDarkTheme={isDarkTheme}>{value.description}</ValueText>
              </ValueItem>
            ))}
          </CoreValues>
        </MissionContainer>
      </MissionSection>

      {/* Gallery Section */}
      <GallerySection isDarkTheme={isDarkTheme}>
        <GalleryHeader isDarkTheme={isDarkTheme}>
          <h2 data-aos="fade-up">
            <InfiniteTypingText text="Gallery" speed={80} fontSize="inherit" />
          </h2>
        </GalleryHeader>
        <StyledSwiper
          modules={[EffectCoverflow, Pagination, Autoplay]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={"auto"}
          spaceBetween={10}
          initialSlide={1} coverflowEffect={{
            rotate: 35,
            stretch: 0,
            depth: 200,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          loop={true}
          isDarkTheme={isDarkTheme}
        >
          {gallerySlides.map((slide, index) => (
            <SwiperSlide key={index}>            <img
              src={slide.image}
              alt={slide.title}
              loading="lazy"
            />
            </SwiperSlide>
          ))}
        </StyledSwiper>
      </GallerySection>
    </>
  );
}

export default HighlightsAndMission; 