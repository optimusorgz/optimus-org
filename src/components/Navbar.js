import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

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
  padding: 1rem 1%;
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

const DropdownMenu = styled.ul`
  display: ${props => (props.isOpen ? 'flex' : 'none')};
flex-direction: column;
position: absolute;
background-color: rgba(12, 12, 43, 0.9);
margin-top: 15px;
top: 60px;
right: 0;
width: 100%;
min-width: 150px;
z-index: 9;
padding: 1rem;

list-style: none;
text-align: center; /* Center the text */

/* ✅ Required for backdrop blur */
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);  /* Safari support */

li {
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
}

a {
  color: ${props => props.theme.text};
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: ${props => props.theme.primary};
  }
}

@media (min-width: 769px) {
  display: none;
}

`;

const Navbar = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <Nav theme={theme}>
      <Container>
        <img src={require('../assets/symbol.png')} alt="logo" height="40" />
        <NavLinks theme={theme}>
          <li><NavLink to="/" theme={theme} className={location.pathname === '/' ? 'active' : ''}>HOME</NavLink></li>
          <li><NavLink to="/team" theme={theme} className={location.pathname === '/team' ? 'active' : ''}>TEAM</NavLink></li>
          <li><NavLink to="/gallery" theme={theme} className={location.pathname === '/gallery' ? 'active' : ''}>GALLERY</NavLink></li>
          <li><NavLink to="/events" theme={theme} className={location.pathname === '/events' ? 'active' : ''}>EVENTS</NavLink></li>
        </NavLinks>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <JoinButton 
            href="https://script.google.com/macros/s/AKfycbyHN7l4C1x1Fosv0GRgbsDnOYiYXYL7vOhCvV7G76fN25FIuzBwJYEFPN9srKhxLeDY/exec" 
            target="_blank" 
            rel="noopener noreferrer"
            theme={theme}
          >
            Join us
          </JoinButton>
          <HamburgerIcon onClick={toggleMenu} theme={theme}>
            <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
          </HamburgerIcon>
        </div>
      </Container>
      <DropdownMenu
        isOpen={isOpen}
        theme={theme}
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
        <li><NavLink to="/" theme={theme} className={location.pathname === '/' ? 'active' : ''} onClick={toggleMenu}>HOME</NavLink></li>
        <li><NavLink to="/team" theme={theme} className={location.pathname === '/team' ? 'active' : ''} onClick={toggleMenu}>TEAM</NavLink></li>
        <li><NavLink to="/gallery" theme={theme} className={location.pathname === '/gallery' ? 'active' : ''} onClick={toggleMenu}>GALLERY</NavLink></li>
        <li><NavLink to="/events" theme={theme} className={location.pathname === '/events' ? 'active' : ''} onClick={toggleMenu}>EVENTS</NavLink></li>
        <li><a href="https://script.google.com/macros/s/AKfycbyHN7l4C1x1Fosv0GRgbsDnOYiYXYL7vOhCvV7G76fN25FIuzBwJYEFPN9srKhxLeDY/exec" target="_blank" rel="noopener noreferrer" theme={theme} onClick={toggleMenu}>JOIN US</a></li>
      </DropdownMenu>
    </Nav>
  );
};

export default Navbar;
