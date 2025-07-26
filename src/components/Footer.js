import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faLinkedinIn, faGithub } from '@fortawesome/free-brands-svg-icons';

const FooterWrapper = styled.footer`
  color: ${props => props.theme.text};
  padding: 60px 0 0 20px;
  transition: all 0.3s ease;
  

  background: radial-gradient(
  circle at bottom right,
  rgba(12,12,29,0.1) 8%,
  rgba(12, 12, 29, 0.8) 20%,
  rgba(12, 12, 29, 1) 60%,
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
    background-color: rgba(15, 3, 38, 0.1);
  }

  @media (max-width: 768px) {
    padding: 60px 5%;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
`;

const FooterSection = styled.div`
  h3 {
    color: ${props => props.theme.primary};
    margin-bottom: 20px;
    font-size: 1.2rem;
    position: relative;
    display: inline-block;

    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 50px;
      height: 2px;
      background: ${props => props.theme.primary};
      transition: all 0.3s ease;
    }
  }

  p, a {
    color: ${props => props.theme.text};
    line-height: 1.6;
    transition: all 0.3s ease;
  }
  a {
    display: block;
    margin-bottom: 10px;
    text-decoration: none;
    position: relative;
    transition: all 0.3s ease;

    &:hover {
      color: ${props => props.theme.primary};
      transform: translateY(-2px);
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;

  a {
    color: ${props => props.theme.primary};
    font-size: 1.5rem;
    transition: all 0.3s ease;
    padding: 10px;
    border-radius: 50%;

    &:hover {
      color: #00FFFF;
      transform: translateY(-3px);
      filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.5));
    }
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid ${props => props.theme.cardBorder};
  color: ${props => props.theme.text};
  font-size: 0.9rem;
  opacity: 0.8;
  transition: all 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

const Footer = () => {
  const { theme } = useTheme();

  return (
    <FooterWrapper theme={theme}>
      <FooterContent>
        <FooterSection theme={theme}>
          <h3>About Us</h3>
          <p>OPTIMUS is a dynamic technical club dedicated to fostering innovation and technical excellence.</p>
        </FooterSection>

        <FooterSection theme={theme}>
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/team">Team</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/events">Events</Link>
        </FooterSection>

        <FooterSection theme={theme}>
          <h3>Contact Us</h3>
          <p>optimus.orgz@gmail.com</p>
          <SocialLinks theme={theme}>
            <a href="https://www.instagram.com/optimus.orgz/" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://www.linkedin.com/company/optimus16/" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faLinkedinIn} />
            </a>
          </SocialLinks>
        </FooterSection>
      </FooterContent>
      
      <Copyright theme={theme}>
        <p>&copy; {new Date().getFullYear()} OPTIMUS. All rights reserved.</p>
      </Copyright>
    </FooterWrapper>
  );
};

export default Footer;
