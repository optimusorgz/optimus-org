/**
 * @file src/components/Card.js
 * @description Reusable styled component for a card layout with theme-based styling and hover effects.
 */

import styled from 'styled-components';

/**
 * `Card` styled component.
 * Provides a consistent card style with background, border, border-radius, padding, and hover animations.
 * It uses theme properties for colors and shadows.
 * @param {object} props - Styled component props.
 * @param {object} props.theme - The theme object from ThemeContext.
 * @param {string} props.theme.cardBackground - Background color for the card.
 * @param {string} props.theme.cardBorder - Border color for the card.
 * @param {string} props.theme.shadow - Box shadow for the card on hover.
 */
export const Card = styled.div`
  background: ${props => props.theme.cardBackground};
  border: 1px solid ${props => props.theme.cardBorder};
  border-radius: 15px;
  padding: 20px;
  transition: all 0.3s ease;
  


  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadow};
  }
`;
