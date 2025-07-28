import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faHome, faUsers, faImages, faCalendarAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';

const Nav = styled.nav`
  position: fixed;
  width: 100%;
  z-index: 10;
  top: 0;
  left: 0;
  backdrop-filter: blur(20px);
  
`;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1% 0 1%;
`;

const Logo = styled(Link)`
  font-family: 'Orbitron', sans-serif;
  font-size: 1.5rem;
  color: ${props => props.theme.primary};
  text-decoration: none;
`;

const NavLinks = styled.ul`
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: ${props => props.theme.text};
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;

  &.active {
    color: ${props => props.theme.activeNavLink};
    &::after {
      width: 100%;
    }
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background-color: ${props => props.theme.primary};
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }
`;

const JoinButton = styled.a`
  color: ${props => props.theme.primary};
  text-decoration: none;
  padding: 8px 20px;
  border: 2px solid ${props => props.theme.primary};
  border-radius: 25px;
  transition: all 0.3s ease;
  margin-left: 2rem;

  &:hover {
    background: ${props => props.theme.primary};
    color: ${props => props.theme.background};
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const HamburgerIcon = styled.div`
  display: none;
  font-size: 1.8rem;
  color: ${props => props.theme.text};
  cursor: pointer;
  z-index: 11;

  @media (max-width: 768px) {
    display: block;
  }
`;

const DrawerBackdrop = styled.div`
  display: ${props => (props.isOpen ? 'block' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.4);
  z-index: 99;
  transition: opacity 0.3s ease;
  @media (min-width: 769px) {
    display: none;
  }
`;

const Drawer = styled.nav`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: fit-content;
  min-width: 160px;
  max-width: 90vw;
  background: rgba(12, 12, 43, 0.85);
  box-shadow: -4px 0 24px 4px rgba(0,0,0,0.25), -2px 0 8px rgba(0,0,0,0.15);
  z-index: 100;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  transform: translateX(${props => (props.isOpen ? '0' : '100%')});
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  @media (min-width: 769px) {
    display: none !important;
  }
`;

const DrawerClose = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.text};
  font-size: 2rem;
  align-self: flex-end;
  cursor: pointer;
  margin-bottom: 1.5rem;
`;

const DrawerLinks = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
`;


const focusableSelectors = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Navbar = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef(null);

  // Trap focus inside drawer when open
  useEffect(() => {
    if (!isOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const focusableEls = drawer.querySelectorAll(focusableSelectors);
    if (focusableEls.length) focusableEls[0].focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    drawer.addEventListener('keydown', handleKeyDown);
    return () => drawer.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close drawer on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);
  const handleLinkClick = () => setIsOpen(false);

  return (
    <Nav theme={theme}>
      <Container>
        <img src={require('../assets/symbol.png')} alt="logo" height="40" />
        {/* Desktop NavLinks */}
        <NavLinks theme={theme}>
          <li><NavLink to="/" theme={theme} className={location.pathname === '/' ? 'active' : ''}>HOME</NavLink></li>
          <li><NavLink to="/team" theme={theme} className={location.pathname === '/team' ? 'active' : ''}>TEAM</NavLink></li>
          <li><NavLink to="/gallery" theme={theme} className={location.pathname === '/gallery' ? 'active' : ''}>GALLERY</NavLink></li>
          <li><NavLink to="/events" theme={theme} className={location.pathname === '/events' ? 'active' : ''}>EVENTS</NavLink></li>
        </NavLinks>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <JoinButton 
            href="https://script.google.com/macros/s/AKfycbyNXloPFC_uqhAFbFkTDSDiwWE3zQeTYfAEULkfOj216o-NhCI64NMpOM8QJo1YIJyg/exec" 
            target="_blank" 
            rel="noopener noreferrer"
            theme={theme}
          >
            Join us
          </JoinButton>
          {/* Hamburger only on mobile */}
          <HamburgerIcon onClick={openDrawer} theme={theme} aria-label="Open navigation menu">
            <FontAwesomeIcon icon={faBars} />
          </HamburgerIcon>
        </div>
      </Container>
      {/* Drawer and Backdrop for mobile */}
      <DrawerBackdrop isOpen={isOpen} onClick={closeDrawer} aria-hidden={!isOpen} />
      <Drawer
        isOpen={isOpen}
        theme={theme}
        ref={drawerRef}
        tabIndex={isOpen ? 0 : -1}
        aria-modal="true"
        role="dialog"
        aria-label="Mobile navigation menu"
        style={{ outline: 'none' }}
      >
        <DrawerLinks>
          <li><FontAwesomeIcon icon={faHome} style={{marginRight:'0.7em'}} /><NavLink to="/" theme={theme} className={location.pathname === '/' ? 'active' : ''} onClick={handleLinkClick}>HOME</NavLink></li>
          <li><FontAwesomeIcon icon={faUsers} style={{marginRight:'0.7em'}} /><NavLink to="/team" theme={theme} className={location.pathname === '/team' ? 'active' : ''} onClick={handleLinkClick}>TEAM</NavLink></li>
          <li><FontAwesomeIcon icon={faImages} style={{marginRight:'0.7em'}} /><NavLink to="/gallery" theme={theme} className={location.pathname === '/gallery' ? 'active' : ''} onClick={handleLinkClick}>GALLERY</NavLink></li>
          <li><FontAwesomeIcon icon={faCalendarAlt} style={{marginRight:'0.7em'}} /><NavLink to="/events" theme={theme} className={location.pathname === '/events' ? 'active' : ''} onClick={handleLinkClick}>EVENTS</NavLink></li>
          <li><FontAwesomeIcon icon={faUserPlus} style={{marginRight:'0.7em'}} /><a href="https://script.google.com/macros/s/AKfycbyNXloPFC_uqhAFbFkTDSDiwWE3zQeTYfAEULkfOj216o-NhCI64NMpOM8QJo1YIJyg/exec" target="_blank" rel="noopener noreferrer" theme={theme} onClick={handleLinkClick}>JOIN US</a></li>
        </DrawerLinks>
      </Drawer>
    </Nav>
  );
};

export default Navbar;
