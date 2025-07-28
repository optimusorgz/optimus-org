import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faLinkedinIn, faGithub } from '@fortawesome/free-brands-svg-icons';

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
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
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
  gap: 12px;
  margin-top: 4px;

  a {
    color: #fff;
    font-size: clamp(1.05rem, 2.8vw, 1.4rem);
    transition: all 0.3s ease;
    padding: 7px;
    border-radius: 50%;

    &:hover {
      color: #1e90ff;
      transform: translateY(-3px);
      filter: drop-shadow(0 0 10px #1e90ff);
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

const FooterBottom = styled.div`
  margin-top: 40px;
  padding-top: 20px;
  color: ${props => props.theme.text};
  font-size: 0.9rem;
  opacity: 0.8;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  position: relative;

  &::before {
    content: '';
    display: block;
    width: calc(100% - 32px);
    height: 2px;
    background: ${props => props.theme.cardBorder};
    position: absolute;
    top: 0;
    left: 16px;
  }

  .dev-by {
    font-size: 1rem;
    margin-bottom: 10px;
    opacity: 0.9;
    letter-spacing: 0.5px;
    font-weight: bold;
  }

  .footer-dev-line {
    width: calc(100% - 32px);
    height: 2px;
    background: ${props => props.theme.cardBorder};
    margin-bottom: 2px;
    margin-left: 16px;
    margin-right: 16px;
  }

  .footer-bottom-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    gap: 10px;
  }

  .footer-bottom-left {
    text-align: left;
    flex: 1;
  }

  .footer-bottom-right {
    text-align: right;
    flex: 1;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

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
          <h3>Quick Access</h3>
          <Link to="/">Home</Link>
          <Link to="/team">Team</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/events">Events</Link>
        </FooterSection>

        <FooterSection theme={theme}>
          <h3>Reach Us</h3>
          <p>
            Optimus LPU,<br />
            Block 13, Division of student welfare,<br />
            Lovely Professional University,<br />
            Kapurthala, Pin 144402, Punjab
          </p>
        </FooterSection>

        <FooterSection theme={theme}>
          <h3>Contact Us</h3>
          <p>
            optimus.orgz@gmail.com<br />
          </p>
        </FooterSection>
      </FooterContent>

      <FooterBottom theme={theme}>
        <div className="dev-by"><span style={{ fontWeight: 'bold' }}>Developed by:</span> Optimus Technical Team</div>
        <div className="footer-dev-line"></div>
        <div className="footer-bottom-row">
          <div className="footer-bottom-left">
            &copy; {new Date().getFullYear()} OPTIMUS. All rights reserved.
          </div>
          <div className="footer-bottom-right">
            <SocialLinks theme={theme}>
              <a href="https://www.instagram.com/optimus.orgz/" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="https://www.linkedin.com/company/optimus16/" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faLinkedinIn} />
              </a>
            </SocialLinks>
          </div>
        </div>
      </FooterBottom>
    </FooterWrapper>
  );
};

export default Footer;
