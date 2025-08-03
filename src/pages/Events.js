/**
 * @file src/pages/Events.js
 * @description Events page component displaying a list of events with details and animated elements.
 * It integrates global theming and AOS for scroll animations.
 */

// --- React Imports ---
import React, { useEffect } from 'react';

// --- Component Imports ---
import InfiniteTypingText from '../components/InfiniteTypingText';
import { PageWrapper, ContentContainer, Section, Header } from '../components/common/PageWrapper';
// Footer is imported but not used directly in the return JSX of Events component. Consider removing if truly unused.
import Footer from '../components/Footer';

// --- Style Imports ---
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext';
import { pulseGradient } from '../styles/GlobalStyles'; // Import pulseGradient from GlobalStyles

// --- External Library Imports ---
import AOS from 'aos';
import 'aos/dist/aos.css';

/**
 * `EventsContainer` styled component.
 * Styles the main container for the Events page, including background gradients and animations.
 * Uses `pulseGradient` for an animated background effect.
 * @param {object} props - Styled component props.
 * @param {object} props.theme - The theme object from ThemeContext.
 */
const EventsContainer = styled.div`
  min-height: 100vh;
  padding-top: 0;
  position: relative;
  background: radial-gradient(
    circle at top left,
    rgba(255, 255, 255, 0.3) 10%,
    rgba(255, 255, 255, 0.1) 20%,
    rgba(12, 12, 29, 0.8) 30%,
    rgba(12, 12, 29, 1) 60%,
    transparent 90%
  );
  background-color: rgba(12,12,29,255);
  background-position: left top;
  background-size: 100% 100%;
  animation: ${pulseGradient} 5s ease-in-out infinite; /* Using imported pulseGradient */
  transition: background-color 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

/**
 * `EventGrid` styled component.
 * Arranges event cards in a flexible row layout with spacing and a maximum width.
 */
const EventGrid = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 30px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 24px;
  box-sizing: border-box;
  overflow: visible;
  perspective: 1200px;
`;

/**
 * `EventCard` styled component.
 * Styles individual event display cards, including background, borders, hover effects, and responsive images.
 * It also defines styles for event status badges and detail rows.
 * @param {object} props - Styled component props.
 * @param {object} props.theme - The theme object from ThemeContext, used for card borders and text color.
 */
const EventCard = styled.div`
  background: rgba(28, 28, 48, 0.5);
  padding: 20px;
  border: 1px solid ${props => props.theme.cardBorder};
  border-radius: 15px;
  overflow: visible;
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  will-change: transform;
  transform-origin: center;
  position: relative;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 36px rgba(30, 144, 255, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 3;
  }

  img {
    width: 100%;
    height: 300px;
    object-fit: contain;
    transition: all 0.4s ease;
  }

  .event-content {
    padding: 0 10px;
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
      color: ${props => props.theme.text}; /* Using theme.text for consistent text color */
    }
  }
`;

/**
 * `Events` functional component.
 * Displays a list of events, utilizing `InfiniteTypingText` for the heading and AOS for scroll animations.
 * @returns {JSX.Element} The Events page.
 */
const Events = () => {
  const { theme } = useTheme();

  // Initialize AOS (Animate On Scroll) library once on component mount.
  useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration in milliseconds
      once: true // Whether animation should happen only once - while scrolling down
    });
  }, []);

  // Sample event data - replace with actual data fetching in a real application.
  const events = [
    {
      id: 1,
      title: 'Optimus Arena',
      image: require('../assets/event1.jpeg'),
      location: 'Lovely Professional University',
      venue: 'Basement Uni Mall',
      date: '28 Mar 2025',
      time: '5:00 PM',
      status: 'ended' // Possible values: 'ended', 'running', 'upcoming'
    }
  ];

  return (
    <EventsContainer theme={theme}>
      <PageWrapper>
        <ContentContainer>
          <Section style={{ marginTop: 0, paddingTop: 0 }}>
            <Header theme={theme} style={{ marginTop: 0, paddingTop: 0 }}>
              {/* Dynamic typing text for the heading */}
              <h2 style={{ fontSize: '2.5rem', marginTop: 0, paddingTop: 0 }} data-aos="fade-up">
                <InfiniteTypingText text="Our Events" speed={80} fontSize="inherit" loop={true} />
              </h2>
            </Header>
            <EventGrid>
              {/* Map through events data to render individual EventCard components */}
              {events.map(event => (
                <EventCard key={event.id} data-aos="fade-up">
                  <img src={event.image} alt={event.title} />
                  {/* Event status badge */}
                  <div className={`event-status status-${event.status}`}>
                    {event.status}
                  </div>
                  <div className="event-content">
                    <h3>{event.title}</h3>
                    {/* Event location detail with SVG icon */}
                    <div className="event-detail">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{event.location}</span>
                    </div>
                    {/* Event venue detail with SVG icon */}
                    <div className="event-detail">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                        <path d="M2 10h20M7 6v4m10-4v4"></path>
                      </svg>
                      <span>{event.venue}</span>
                    </div>
                    {/* Event date and time detail with SVG icon */}
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