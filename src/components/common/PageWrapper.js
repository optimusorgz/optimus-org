import styled from 'styled-components';

export const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  transition: all 0.3s ease;
`;

export const ContentContainer = styled.div`
  padding-top: 80px;
  background: ${props => props.theme.background};
  transition: all 0.3s ease;
`;

export const Section = styled.section`
  padding: 100px 10%;
`;

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