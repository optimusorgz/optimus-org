import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext.js';
import { PageWrapper, Header } from '../components/common/PageWrapper.js';
import AOS from 'aos';
import 'aos/dist/aos.css';

const EventsContainer = styled.div`
  height: 100%;
  background-color: rgba(12,12,29,255); /* Adjusted background color */
  padding-top: 20px;
  transition: background-color 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
`;



const RoadmapSection = styled.section`
  padding: 100px 0;
  width: 100%;
  max-width: 1200px;
  margin: 0 0;
  position: relative;
`;

const RoadmapContainer = styled.div`
  display: grid;
  width: 100%;
  
  grid-template-columns: 1fr 1fr; /* Two equal columns */
  gap: 0; /* Remove gap as timeline will be overlaid */
  position: relative; /* For timeline positioning */

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Stack columns on small screens */
    gap: 0;
  }
`;

const Timeline = styled.div`
  width: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  height: 100%;
  z-index: 2;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: rgb(218, 218, 218); /* Adjusted color to be lighter */
    left: 50%;
    transform: translateX(-50%);
  }

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 40px;
    grid-column: 1; /* Stack in the single column */

    
  }
`;

const TimelineItem = styled.div`
  position: sticky;
  box-shadow: 0 0 10px rgba(255,255,255,1);
  bottom: 10px;  /* added units */
  margin-top: 60px;
  margin-bottom: 250px; /* Adjust this value for alignment */
  width: 60px;
  height: 60px;
  background-color: rgb(218, 218, 218); /* Adjusted color to be lighter */


  display: flex;
  justify-content: center;
  align-items: center;
  color: black; /* Adjusted color to be lighter */
  font-weight: bold;
  font-size: 1.5rem;
  z-index: 10;  /* higher z-index for safety */

  transform: translateY(-50%); /* Vertically center the item */

  clip-path: polygon(
    30% 0%, 70% 0%, 
    100% 30%, 100% 70%, 
    70% 100%, 30% 100%, 
    0% 70%, 0% 30%
  );
  box-shadow: 
    5px 5px 20px rgb(0, 255, 242);  /* softer shadow for depth */

  @media (max-width: 768px) {
    margin: 0 20px;
    top: auto; /* Reset top for mobile */
    transform: none; /* Reset transform for mobile */
  }
`;



const PhaseCard = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 255, 255, 0.1);
  border-radius: 15px;
  padding: 0;
  margin-top: ${props => props.align === 'right' ? '370px' : '10px'};
  margin-bottom: 0px;
  display: flex;
  flex-direction: row-reverse;
  overflow: hidden;
  transition: all 0.3s ease;
  grid-column: ${props => props.align === 'left' ? 1 : 2}; /* Place in left or right column */
  justify-self: center; /* Align card to the edge of its column */
  width: calc(100% - 40px); /* Ensure card takes full width minus margin */
  max-width: 500px; /* Adjusted max width for better spacing */
  max-height: 350px;
  margin-left: ${props => props.align === 'left' ? '55px' : '40px'};
  margin-right: ${props => props.align === 'left' ? '40px' : '0'};
  text-align: center;

  /* Removed conditional margins */

  @media (max-width: 768px) {
    grid-column: 1; /* Stack in the single column */
    justify-self: center; /* Center card on small screens */
    margin-bottom: 40px; /* Adjust margin for stacked layout */
    padding: 20px; /* Adjust padding for small screens */
  }

  h3 {
    color: rgba(255, 255, 255, 1.6); /* Adjusted color to be lighter */
    margin-bottom: 15px;
    font-size: 1.8rem;
  }

  ul {
    list-style: none;
    padding-left: 0px;
  

    li {
      color: rgba(255, 255, 255, 1.6); /* Adjusted color to be lighter */
      margin-bottom: 10px;
      line-height: 1.6;
    }
  }
`;




const Events = () => {
  const { theme } = useTheme();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);
  const events = [
    {
      phase: "Phase 1",
      title: "LAUNCH & MINT",
      image: require('../assets/event1.jpeg'),
      description: [
        "Release of 5,000 unique fatninja collectibles",
        "Website, smart contracts, and minting live",
        "Community channels (Discord, Twitter) activated"
      ]
    },
    {
      phase: "Phase 2",
      title: "SHADOW TOKEN",
      image: require('../assets/event1.jpeg'),
      description: [
        "Staking system goes live for ninja holders",
        "Launch of $shadow utility token",
        "Begin reward distributions and utility integration"
      ]
    },
    {
      phase: "Phase 2",
      title: "SHADOW TOKEN",
      image: require('../assets/event1.jpeg'),
      description: [
        "Staking system goes live for ninja holders",
        "Launch of $shadow utility token",
        "Begin reward distributions and utility integration"
      ]
    },
    {
      phase: "Phase 2",
      title: "SHADOW TOKEN",
      image: require('../assets/event1.jpeg'),
      description: [
        "Staking system goes live for ninja holders",
        "Launch of $shadow utility token",
        "Begin reward distributions and utility integration"
      ]
    },
    {
      phase: "Phase 3",
      title: "GAME MECHANICS",
      image: require('../assets/event1.jpeg'),
      description: [
        "Alpha release of the ninja battle arena",
        "Skill upgrades and rarity-based abilities",
        "Leader boards, loot, and seasonal events"
      ]
    }
  ];

  return (
    <PageWrapper theme={theme}>
      <EventsContainer theme={theme}>
        <RoadmapSection>
          <Header theme={theme}>
            <h2 data-aos="fade-up" style={{
              fontSize: '2.5rem',
              color: 'rgba(255, 255, 255, 1.6)'

               /* Adjusted color to be lighter */

            }}>Our Events</h2>
          </Header>
          <RoadmapContainer>
            <Timeline theme={theme}>
              {events.map((_, index) => (
                <TimelineItem key={index} theme={theme}>
                  {index + 1}
                </TimelineItem>
              ))}
            </Timeline>
              {events.map((event, index) => (                
                <PhaseCard 
                  key={index} 
                  theme={theme}
                  data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                  data-aos-delay={500 * index}
                  data-aos-duration="1000"
                  align={index % 2 === 0 ? 'left' : 'right'}
                >                  <div style={{ 
                    flex: '1 1 60%', 
                    padding: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <h3>{event.phase}: {event.title}</h3>
                    <ul>
                      {event.description.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <span style={{ color: '#00FFFF', marginRight: '10px' }}>•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ 
                    flex: '1 1 40%', 
                    position: 'relative',
                    minHeight: '300px'
                  }}>
                    <img 
                      src={event.image} 
                      alt={event.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: 0,
                        right: 0
                      }}
                    />
                  </div>
                </PhaseCard>
              ))}
          </RoadmapContainer>
        </RoadmapSection>
      </EventsContainer>
    </PageWrapper>
  );
};

export default Events;