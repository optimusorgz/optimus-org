import { keyframes } from 'styled-components';

export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const AnimatedElement = styled.div`
  animation: ${fadeIn} 0.6s ease forwards;
  color: ${props => props.theme.animationColor};
`;