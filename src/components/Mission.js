
import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import TypingText from './TypingText';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  faBullseye,
  faEye,
  faLightbulb,
  faUsers,
  faTrophy,
  faSeedling,
  faGlobeAmericas,
  faRocket
} from '@fortawesome/free-solid-svg-icons';

// Helper component to trigger TypingText only when visible
function MissionTypingTrigger({ text, speed, fontSize }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  return (
    <span ref={ref}>
      {inView ? <TypingText text={text} speed={speed} fontSize={fontSize} /> : null}
    </span>
  );
}

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

// Animated underline keyframes
const underlinePulse = keyframes`
  0% { width: 80px; }
  50% { width: 160px; }
  100% { width: 80px; }
`;


const MissionSection = styled.section`
  padding: 0 10% 0 10%;
  text-align: center;
  position: relative;
  overflow: hidden;
background: radial-gradient(
  circle at top right,
    rgba(255, 255, 255, 0.3) 120px,
  rgba(255, 255, 255, 0.1) 250px,
  rgba(12, 12, 29, 0.8) 450px,
  rgba(12, 12, 29, 1) 500px,
  transparent 100%
),

radial-gradient(
  circle at bottom left,
  rgba(255, 255, 255, 0.3) 50px,
  rgba(255, 255, 255, 0.1) 200px,
  rgba(12, 12, 29, 0.8) 400px,
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
  font-size: 3rem;
  color: rgba(255, 255, 255, 1.6); /* Adjusted color to be lighter */
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
  animation: ${props => props.rotate ? rotateZ : 'none'} 3s infinite;

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background-color: rgba(255, 255, 255, 1.6); /* Adjusted color to be lighter */

    border-radius: 2px;
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
  min-height: 340px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${props => props.isDarkTheme ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'};
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
  background-size: 100% 100%;
  border-radius: 18px;
  padding: 48px 36px;
  margin: 0;
  transition: border-color 0.3s;
  box-sizing: border-box;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  width: 100%;
  border: 2.5px solid ${props => props.isDarkTheme ? 'rgba(0,255,255,0.25)' : 'rgba(0,139,139,0.25)'};
  opacity: ${props => props.inview ? 1 : 0};
  animation: ${props => props.inview === undefined ? 'none' : props.fade === 'left' ? fadeLeft : fadeRight} 1.2s cubic-bezier(0.4,0,0.2,1) forwards;

  @media (max-width: 1024px) {
    min-width: 0;
    max-width: 100%;
    width: 100%;
    padding: 28px 12px;
  }
`;

const CardTitle = styled.h2`
  font-size: 2rem;
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
`;

const CardText = styled.p`
  font-size: 0.95rem;
  color: ${props => props.isDarkTheme
    ? 'rgba(255, 255, 255, 0.9)'
    : 'rgba(0, 0, 0, 0.9)'};
  line-height: 1.6;
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
  font-size: 1.3rem;
  margin-bottom: 10px;
`;

const ValueText = styled.p`
  font-size: 0.9rem;
  color: ${props => props.isDarkTheme
    ? 'rgba(255, 255, 255, 0.8)'
    : 'rgba(0, 0, 0, 0.8)'};
  margin: 0;
`;


function Mission() {
  const { isDarkTheme } = useTheme();

  const [isHoveredMission, setIsHoveredMission] = useState(false);
  const [isHoveredVision, setIsHoveredVision] = useState(false);

  // Intersection observers for the two boxes
  const { ref: missionRef, inView: missionInView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const { ref: visionRef, inView: visionInView } = useInView({ triggerOnce: true, threshold: 0.2 });

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

  return (
    <MissionSection id="mission" isDarkTheme={isDarkTheme}>
      <MissionContainer>
        <MissionContent>
          {/* Mission Section with Intersection Observer */}

          {/* Mission Section with fade left when visible */}
          <MissionSectionBox
            ref={missionRef}
            isDarkTheme={isDarkTheme}
            inview={missionInView ? 1 : 0}
            fade="left"
          >
            <CardTitle isDarkTheme={isDarkTheme}>
              <FontAwesomeIcon icon={faBullseye} />
              Our Mission
            </CardTitle>
            <CardText isDarkTheme={isDarkTheme}>
              <MissionTypingTrigger
                text={"At Optimus, we're dedicated to creating a dynamic space where innovation thrives. Our mission is to empower students through hands-on learning, collaborative projects, and real-world challenges. We believe in nurturing talent and providing the tools needed to turn ideas into impactful solutions."}
                speed={20}
                fontSize="1.1em"
              />
            </CardText>
          </MissionSectionBox>

          {/* Vision Section with fade right when visible */}
          <MissionSectionBox
            ref={visionRef}
            isDarkTheme={isDarkTheme}
            inview={visionInView ? 1 : 0}
            fade="right"
          >
            <CardTitle isDarkTheme={isDarkTheme}>
              <FontAwesomeIcon icon={faEye} />
              Our Vision
            </CardTitle>
            <CardText isDarkTheme={isDarkTheme}>
              <MissionTypingTrigger
                text={"We envision a future where every student has the opportunity to develop their technical skills and leadership abilities. Our goal is to build a community that not only learns together but also creates lasting impact through technology and innovation."}
                speed={20}
                fontSize="1.1em"
              />
            </CardText>
          </MissionSectionBox>

        </MissionContent>

        <MissionHeader className="values">
          <HeaderTitle isDarkTheme={isDarkTheme} data-aos="fade-up" data-aos-duration="1000">
            Core Values
          </HeaderTitle>
        </MissionHeader>

        <CoreValues>
          {coreValues.map((value, index) => (
            <ValueItem
              key={index}
              isDarkTheme={isDarkTheme}
              data-aos="zoom-in"
              data-aos-delay={100 * (index + 1)}
            >
              <FontAwesomeIcon icon={value.icon} />
              <ValueTitle isDarkTheme={isDarkTheme}>{value.title}</ValueTitle>
              <ValueText isDarkTheme={isDarkTheme}>{value.description}</ValueText>
            </ValueItem>
          ))}
        </CoreValues>
      </MissionContainer>
    </MissionSection>
  );
}

export default Mission;
