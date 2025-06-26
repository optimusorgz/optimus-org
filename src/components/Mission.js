import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext'; // Make sure the path is correct
import styled from 'styled-components';
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


const MissionSection = styled.section`
  padding: 100px 10% 100px 10%;
  text-align: center;
  position: relative;
  overflow: hidden;
background: radial-gradient(
  circle at top right,
   rgba(255, 255, 255, 0.3) 50px,
  rgba(255, 255, 255, 0.1) 200px,
  rgba(12, 12, 29, 0.8) 400px,
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

const HeaderTitle = styled.h2`
  font-size: 3rem;
  color: rgba(255, 255, 255, 1.6); /* Adjusted color to be lighter */
  margin-bottom: 20px;
  position: relative;
  display: inline-block;

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
  display: grid;
  grid-template-columns: 500px 500px;
  gap: 0px;
  align-items: center;
  padding: 20px 10%;
  

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MissionCard = styled.div`
  background: ${props => props.isDarkTheme 
    ? 'rgba(255, 255, 255, 0.03)' 
    : 'rgba(0, 0, 0, 0.03)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.isDarkTheme 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 20px;
  padding: 40px;
  margin: 0 auto;  width: 80%;
  height: 400px;
  opacity: 0.95;
  transform: rotate(45deg);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }  &:hover {
    transform: rotateX(20deg);
    box-shadow: ${props => props.isDarkTheme
      ? '0 20px 40px rgba(0, 255, 255, 0.2)'
      : '0 20px 40px rgba(0, 139, 139, 0.2)'};
    border-color: ${props => props.isDarkTheme
      ? 'rgba(0, 255, 255, 0.3)'
      : 'rgba(0, 139, 139, 0.3)'};
    opacity: 1;
  }

  &:hover::before {
    transform: translateX(100%);
  }
`;

const CardTitle = styled.h3`
  font-size: 2rem;
  color: ${props => props.isDarkTheme ? '#00FFFF' : '#008B8B'};
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;

  svg {
    font-size: 2.5rem;
    filter: drop-shadow(0 0 10px ${props => props.isDarkTheme 
      ? 'rgba(0, 255, 255, 0.3)'
      : 'rgba(0, 139, 139, 0.3)'});
  }
`;

const CardText = styled.p`
  font-size: 1.1rem;
  color: ${props => props.isDarkTheme 
    ? 'rgba(255, 255, 255, 0.9)' 
    : 'rgba(0, 0, 0, 0.9)'};
  line-height: 1.8;
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
    grid-template-columns: 1fr;
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

const Mission = () => {
  const { isDarkTheme } = useTheme();

  const [isHoveredMission, setIsHoveredMission] = useState(false);
  const [isHoveredVision, setIsHoveredVision] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
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
        <MissionHeader>
          <HeaderTitle isDarkTheme={isDarkTheme} data-aos="fade-up" data-aos-duration="1000">
            Our Mission & Vision
          </HeaderTitle>
        </MissionHeader>

        <MissionContent>          <MissionCard            isDarkTheme={isDarkTheme}
            data-aos="fade-right"
            data-aos-duration="800"
            data-aos-delay="500"
            data-aos-anchor-placement="center-bottom"
            onMouseEnter={() => setIsHoveredMission(true)}
            onMouseLeave={() => setIsHoveredMission(false)}
            style={{
              transform: isHoveredMission ? 'rotate(0deg)' : 'rotate(10deg)',
              transition: 'transform 0.3s ease',
            }}>
            <CardTitle isDarkTheme={isDarkTheme}>
              <FontAwesomeIcon icon={faBullseye} />
              Our Mission
            </CardTitle>
            <CardText isDarkTheme={isDarkTheme}>
              At <strong>Optimus</strong>, we're dedicated to creating a dynamic space where innovation thrives. Our
              mission is to empower students through hands-on learning, collaborative projects, and real-world challenges.
              We believe in nurturing talent and providing the tools needed to turn ideas into impactful solutions.
            </CardText>
          </MissionCard>          <MissionCard            isDarkTheme={isDarkTheme}
            data-aos="fade-left"
            data-aos-duration="800"
            data-aos-delay="1000"
            data-aos-anchor-placement="center-bottom"
            onMouseEnter={() => setIsHoveredVision(true)}
            onMouseLeave={() => setIsHoveredVision(false)}
            style={{
              transform: isHoveredVision ? 'rotate(0deg)' : 'rotate(-7deg)',
              transition: 'transform 0.3s ease',
            }}>
            <CardTitle isDarkTheme={isDarkTheme}>
              <FontAwesomeIcon icon={faEye} />
              Our Vision
            </CardTitle>
            <CardText isDarkTheme={isDarkTheme}>
              We envision a future where every student has the opportunity to develop their technical skills and
              leadership abilities. Our goal is to build a community that not only learns together but also creates
              lasting impact through technology and innovation.
            </CardText>
          </MissionCard>
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
};

export default Mission;
