import styled from 'styled-components';

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
