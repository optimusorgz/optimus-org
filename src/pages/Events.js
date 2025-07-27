import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext';
import { PageWrapper, ContentContainer, Section, Header } from '../components/common/PageWrapper';
import Footer from '../components/Footer';
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


const EventGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  justify-items: center;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px 40px 24px;
  box-sizing: border-box;
`;

const EventCard = styled.div`
  background: ${props => props.theme.cardBackground};

border: 1px solid ${props => props.theme.cardBorder};
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;

  img {
    width: 100%;
    height: 400px;
    object-fit: contain;
  }

  .event-content {
    padding: 20px;
  }

  .event-status {
    position: absolute;
    top: 15px;
    right: 15px;
    padding: 5px 10px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .status-ended {
    background-color: #ff4757;
    color: white;
  }

  .status-running {
    background-color: #2ed573;
    color: white;
  }

  .status-upcoming {
    background-color: #1e90ff;
    color: white;
  }

  .event-detail {
    display: flex;
    align-items: center;
    margin: 10px 0;

    svg {
      margin-right: 10px;
      color: ${props => props.theme.textColor};
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

  // Sample event data
  const events = [
    {
      id: 1,
      title: 'Optimus Arena',
      image: require('../assets/event1.jpeg'),
      location: 'Lovely Professional University',
      venue: 'Basement Uni Mall',
      date: '28 Mar 2025',
      time: '5:00 PM',
      status: 'ended'
    }

  ];

  return (
    <EventsContainer theme={theme}>
      <PageWrapper>
        <ContentContainer>
          <Section>
            <Header theme={theme}>
              <h2 style={{ fontSize: '2.5rem' }} data-aos="fade-up">Our Events</h2>
            </Header>
            <EventGrid>
              {events.map(event => (
                <EventCard key={event.id} data-aos="fade-up">
                  <img src={event.image} alt={event.title} />
                  <div className={`event-status status-${event.status}`}>
                    {event.status}
                  </div>
                  <div className="event-content">
                    <h3>{event.title}</h3>
                    <div className="event-detail">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{event.location}</span>
                    </div>
                    <div className="event-detail">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                        <path d="M2 10h20M7 6v4m10-4v4"></path>
                      </svg>
                      <span>{event.venue}</span>
                    </div>
                    <div className="event-detail">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>{event.date} at {event.time}</span>
                    </div>
                  </div>
                </EventCard>
              ))}
            </EventGrid>
          </Section>
        </ContentContainer>
      </PageWrapper>
    </EventsContainer>
  );
};

export default Events;