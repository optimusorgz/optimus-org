/**
 * @file src/components/common/PageWrapper.js
 * @description Provides common styled components for page layout, including a main page wrapper,
 * content container, section, and header with thematic styling.
 */

import styled from 'styled-components';

/**
 * @typedef {object} ThemeProps
 * @property {object} theme - The theme object from ThemeContext.
 * @property {string} theme.background - The background color from the theme.
 * @property {string} theme.text - The text color from the theme.
 * @property {string} theme.primary - The primary color from the theme.
 */

/**
 * `PageWrapper` styled component.
 * A main container for pages, ensuring a minimum height and applying theme-based background and text colors.
 * @param {ThemeProps} props - Styled component props, including the theme object.
 */
export const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  transition: all 0.3s ease;
`;

/**
 * `ContentContainer` styled component.
 * Provides padding at the top and applies theme-based background color, suitable for wrapping main content.
 * @param {ThemeProps} props - Styled component props, including the theme object.
 */
export const ContentContainer = styled.div`
  padding-top: 80px;
  background: ${props => props.theme.background};
  transition: all 0.3s ease;
`;

/**
 * `Section` styled component.
 * A generic section container with horizontal padding, designed for consistent content spacing.
 */
export const Section = styled.section`
  padding: 100px 10%;
`;

/**
 * `Header` styled component.
 * A centered header component with bottom margin, and a dynamically styled `h2` element
 * that includes an animated underline based on the theme's primary color.
 * @param {ThemeProps} props - Styled component props, including the theme object.
 */
export const Header = styled.div`
  text-align: center;
  margin-bottom: 60px;

  h2 {
    color: ${props => props.theme.primary};
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
      background: ${props => props.theme.primary};
      transition: all 0.3s ease;
    }
  }
`;