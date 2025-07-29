import React from 'react';
import { useInView } from 'react-intersection-observer';
import clubLogo from '../assets/clublogo.png';
import TypingText from './TypingText';
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
  background: none;
  background-color: rgba(12,12,29,255);
  position: relative;
  z-index: 0;
  &::before, &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    animation: ${pulseGradient} 5s ease-in-out infinite;
  }
  &::before {
    top: 0;
    left: 0;
    background: radial-gradient(
      circle at bottom right,
       rgba(255, 255, 255, 0.3) 5%,
    rgba(255, 255, 255, 0.1) 20%,
    rgba(12, 12, 29, 0.8) 30%,
    rgba(12, 12, 29, 1) 60%,
      transparent 100%
    );
    background-color: rgba(15, 3, 38, 0.1);
  }
  &::after {
    top: 0;
    left: 0;
    background: radial-gradient(
      circle at bottom right,
      rgba(0,255,255,0.10) 0%,
      rgba(0,255,255,0.08) 20%,
      rgba(12,12,29,0.0) 60%,
      transparent 100%
    );
    opacity: 0.7;
    mix-blend-mode: lighten;
  }
  @media (max-width: 768px) {
    padding: 60px 0 0 0;
  }
`;

const FooterTopBar = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 30px auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: relative;
  z-index: 1;
  .footer-cta-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    @media (max-width: 600px) {
      flex-direction: column;
      align-items: center;
      width: 100%;
      gap: 8px;
    }
  }
  .footer-typing-text {
    font-size: 1.5rem;
    font-weight: 600;
    @media (max-width: 600px) {
      font-size: 0.8rem;
      text-align: center;
      width: 100%;
    }
  }
  .footer-cta-btn-wrap {
    @media (max-width: 600px) {
      width: 100%;
      display: flex;
      justify-content: center;
    }
  }
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 16px;
    padding: 0 10px;
    margin-bottom: 18px;
    align-items: center;
  }
`;


const FooterLogo = styled.img`
  height: auto;
  width: 12%;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
  background: transparent;
  padding: 0;
  @media (max-width: 600px) {
    display: none;
  }
`;


const JoinUsButton = styled.a`
  display: inline-block;
  background: ${props => props.theme.primary || '#00ffff76'};
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 10px 28px;
  border-radius: 5px;
  text-decoration: none;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
  transition: background 0.2s, color 0.2s, transform 0.18s;
  margin-left: 10px;
  &:hover {
    background: #00FFFF;
    border: 2px solid ${props => props.theme.primary || '#00FFFF'};
    color: ${props => props.theme.primary || '#000000ff'};
    transform: translateY(-2px) scale(1.04);
  }
  @media (max-width: 600px) {
    width: 100%;
    text-align: center;
    margin-left: 0;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  position: relative;
  z-index: 1;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 35% 65%;
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
      color: #00FFFF;
      transform: translateY(-3px);
      filter: drop-shadow(0 0 10px #00FFFF);
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
  z-index: 1;

  .dev-by {
    font-size: 1rem;
    margin-bottom: 10px;
    opacity: 0.9;
    letter-spacing: 0.5px;
    font-weight: bold;
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

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  return (
    <FooterWrapper theme={theme} ref={ref}>
      <FooterTopBar>
        <FooterLogo src={clubLogo} alt="Optimus Club Logo" />
        <div className="footer-cta-bar">
          {inView ? (
            <span className="footer-typing-text">
              <TypingText text="Join the revolution!" speed={80} />
            </span>
          ) : null}
          <div className="footer-cta-btn-wrap">
            <JoinUsButton
              href="https://script.google.com/macros/s/AKfycbyNXloPFC_uqhAFbFkTDSDiwWE3zQeTYfAEULkfOj216o-NhCI64NMpOM8QJo1YIJyg/exec"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Now
            </JoinUsButton>
          </div>
        </div>
      </FooterTopBar>

      <FooterContent>
        <FooterSection theme={theme}>
          <h3>About Us</h3>
          <p>OPTIMUS is a dynamic technical club dedicated to fostering innovation and technical excellence.</p>
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

      <FooterBottom theme={theme}>
        <div className="dev-by" style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>Developed by:</span> Optimus Technical Team</div>
        <div style={{ width: 'calc(100% - 40px)', height: '2px', background: theme.cardBorder, margin: '0 20px 10px 20px' }}></div>
        <div style={{ marginTop: '10px', marginBottom: '24px', fontSize: '0.95rem', opacity: 0.8, textAlign: 'center' }}>
          &copy; 2025 OPTIMUS. All rights reserved.
        </div>
      </FooterBottom>
    </FooterWrapper>
  );
};

export default Footer;
