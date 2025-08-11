/**
 * @file src/pages/Team.js
 * @description Team page component displaying a list of team members with their roles and social links.
 * It integrates global theming, infinite typing text for the heading, and AOS for scroll animations.
 */

// --- React Imports ---
import React, { useEffect } from 'react';


// --- Component Imports ---
import InfiniteTypingText from '../components/InfiniteTypingText';
import { PageWrapper, ContentContainer, Section, Header } from '../components/common/PageWrapper';
// Footer is imported but not used directly in the return JSX of Team component. Consider removing if truly unused.
import Footer from '../components/Footer';

// --- Style Imports ---
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext';
import { pulseGradient } from '../styles/GlobalStyles'; // Import pulseGradient from GlobalStyles

// --- External Library Imports ---
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

/**
 * `TeamContainer` styled component.
 * Styles the main container for the Team page, including background gradients and animations.
 * Uses `pulseGradient` for an animated background effect.
 * @param {object} props - Styled component props.
 * @param {object} props.theme - The theme object from ThemeContext.
 */
const TeamContainer = styled.div`
  min-height: 100%;
  padding-top: 0px;
  position: relative;
  background: radial-gradient(
    circle at top left,
    rgba(255, 255, 255, 0.3) 10%,
    rgba(255, 255, 255, 0.1) 20%,
    rgba(12, 12, 29, 0.8) 30%,
    rgba(12, 12, 29, 1) 60%,
    transparent 90%
  );
  background-color: rgba(12,12,29,255);
  background-position: left top;
  background-size: 100% 100%;
  animation: ${pulseGradient} 5s ease-in-out infinite; /* Using imported pulseGradient */
  align-items: stretch;
  transition: background-color 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    background-color: rgba(15, 3, 38, 0.15);
  }

  @media (max-width: 900px) {
    min-height: 100vh;
  }
  @media (max-width: 768px) {
    padding: 60px 5%;
  }
`;

/**
 * `TeamSection` styled component.
 * Defines padding and positioning for the team members section.
 */
const TeamSection = styled.section`
  padding: 100px 5%;
  position: relative;
  z-index: 1;
  @media (max-width: 600px) {
    padding: 36px 4% 0 4%;
  }
`;

/**
 * `TeamGrid` styled component.
 * Arranges team member cards in a responsive grid layout.
 */
const TeamGrid = styled.div`
  display: grid;
  text-align: center;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 36px 24px;
  padding: 10px 0 30px 0;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px 40px;
    padding: 0 0;;
    margin: 0 0;
  }
`;

/**
 * `TeamMemberImg` styled component.
 * Styles the image of a team member with a circular shape and responsive sizing.
 */
const TeamMemberImg = styled.img`
    width: 170px;
    height: 170px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 15px;
    transition: width 0.2s, height 0.2s;

    @media (max-width: 768px) {
    width: 120px;
    height: 120px;
    margin-bottom: 8px;
  }
  `;

/**
 * `TeamMemberContent` styled component.
 * Styles the text content area for a team member, including name and position.
 */
const TeamMemberContent = styled.div`
  text-align: center;
  padding: 0 8px;
`;

/**
 * `SocialLinks` styled component.
 * Styles the container for social media icons, including theming for link colors and hover effects.
 * @param {object} props - Styled component props.
 * @param {object} props.theme - The theme object from ThemeContext, used for link and hover colors.
 */
const SocialLinks = styled.div`
  display: flex;
  gap: 12px;
  text-align: center;
  margin-top: 2px;
  justify-content: center;

  a {
    color: ${props => props.theme.primary};
    font-size: 1.15rem;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
    padding: 6px;
    border-radius: 50%;

    &:hover {
      transform: translateY(-2px);
      color: ${props => props.theme.hoverColor};
      background-color: rgba(255, 255, 255, 0.1);
      box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.2);
    }

    &.disabled {
      pointer-events: none;
      opacity: 0.4;
    }

    span {
      font-size: 0.9rem;
    }
  }
`;

/**
 * `Team` functional component.
 * Displays a grid of team members with their details and links to social media profiles.
 * @returns {JSX.Element} The Team page.
 */
const Team = () => {
  const { theme } = useTheme();

  // Initialize AOS (Animate On Scroll) library once on component mount.
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  // Sample team members data - replace with actual data fetching in a real application.
  const teamMembers = [
    {
      name: "Charchit",
      position: "CEO & Founder",
      image: require("../assets/team/charchit1.jpeg"),
      instagram: "https://www.instagram.com/charchit.singh_16/",
      linkedin: "https://www.linkedin.com/in/charchit16/"
    },
    {
      name: "Ayush Samant",
      position: "COO",
      image: require("../assets/team/ayush_samant.jpg"),
      instagram: "https://www.instagram.com/yadorawa?igsh=MTBibndiZ3pqdmRpNA==",
      linkedin: "https://www.linkedin.com/in/ayushsamant/"
    },
    {
      name: "Neelansh",
      position: "COO",
      image: require("../assets/team/neelansh.jpeg"),
      instagram: "https://www.instagram.com/neelansh_pratap_singh?igsh=bmRzZW5sb2w0dmRi",
      linkedin: "https://www.linkedin.com/in/neelansh-singh-894852218/"
    },
    {
      name: "Mayank",
      position: "Marketing Head",
      image: require("../assets/team/mayank.jpeg"),
      instagram: "https://www.instagram.com/m01ayank0?igsh=cDZvd2JncTBmam5s",
      linkedin: "https://www.linkedin.com/in/mayank-dhusia-807b3335a"
    },
    {
      name: "Piyush Saini",
      position: "Technical Lead",
      image: require("../assets/team/piyush.jpg"),
      instagram: "http://instagram.com/piyush_saini_40",
      linkedin: "https://www.linkedin.com/in/piyushsaini2004/"
    },
    {
      name: "Ayush Yadav",
      position: "Social Media Head",
      image: require("../assets/team/ayush yadav.JPEG"),
      instagram: "https://www.instagram.com/a_yo_shhhh?igsh=cDN0NTk0aGgwMDR1",
      linkedin: "https://www.linkedin.com/in/ayush-kumar-5228a2298?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
    },
    {
      name: "Bhanu Pratap Singh",
      position: "Media Head",
      image: require("../assets/team/bhanu_picture.jpg"),
      instagram: "wwww.instagram.com/anxxshhh._",
      linkedin: "https://www.linkedin.com/in/bhanupratap3008?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
    },
    {
      name: "Shailaja Singh",
      position: "Student Relation Coordinator",
      image: require("../assets/team/shailaja.jpeg"),
      instagram: "https://www.instagram.com/yadorawa?igsh=MTBibndiZ3pqdmRpNA==",
      linkedin: "https://www.linkedin.com/in/shailaja-singh2004?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
    },
    {
      name: "Ankit Kumar",
      position: "Graphics Team Head",
      image: require("../assets/team/ankit1.jpeg"),
      instagram: "https://www.instagram.com/ankit258akofficial",
      linkedin: "https://www.linkedin.com/in/ankitofficial25"
    },
    {
      name: "Ayush Chauhan",
      position: "Event Management Head",
      image: require("../assets/avtar.jpeg"),
      instagram: "https://www.instagram.com/a_yo_shhhh?igsh=cDN0NTk0aGgwMDR1",
      linkedin: "#"
    },
    {
      name: "Basu Slathia",
      position: "Core Team Member",
      image: require("../assets/team/basu.jpeg"),
      instagram: "https://www.instagram.com/basu_9534?igsh=NDQ2MWtvazlvYnFn&utm_source=qr",
      linkedin: "#"
    },
    // Add more members as needed
  ];

  return (
    <PageWrapper theme={theme}>
      <TeamContainer theme={theme}>
        <TeamSection>
          <Header theme={theme}>
            {/* Dynamic typing text for the heading */}
            <h2
              style={{
                fontSize: '2.5rem',
                marginTop: 0,
                marginBottom: '1.2em',
                ...(window.innerWidth <= 600 ? { fontSize: '1.5rem', marginBottom: '0.7em' } : {})
              }}
              data-aos="fade-up"
            >
              <InfiniteTypingText text="Our Team" speed={80} fontSize="inherit" loop={true} />
            </h2>
          </Header>
          <TeamGrid>
            {/* Map through teamMembers data to render individual team member cards */}
            {teamMembers.map((member, index) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={100 * (index % 4)}
              >
                <TeamMemberImg
                  src={member.image}
                  alt={member.name}
                />

                <TeamMemberContent>
                  <h3 style={{
                    color: theme.primary,
                    margin: '0 0 0px 0',
                    fontSize: '1.5rem'
                  }}>
                    {member.name}
                  </h3>
                  <p style={{
                    color: theme.text,
                    margin: '0 0 0px 0',
                    fontSize: '1.1rem'
                  }}>
                    {member.position}
                  </p>
                  <SocialLinks theme={theme}>
                    <a
                      href={member.instagram && member.instagram !== "#" ? member.instagram : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`${member.name}'s Instagram`}
                      className={!member.instagram || member.instagram === "#" ? "disabled" : ""}
                    >
                      <FontAwesomeIcon icon={faInstagram} />
                    </a>
                    <a
                      href={member.linkedin && member.linkedin !== "#" ? member.linkedin : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`${member.name}'s LinkedIn`}
                      className={!member.linkedin || member.linkedin === "#" ? "disabled" : ""}
                    >
                      <FontAwesomeIcon icon={faLinkedinIn} />
                    </a>
                  </SocialLinks>
                </TeamMemberContent>
              </div>
            ))}
          </TeamGrid>
        </TeamSection>
      </TeamContainer>
    </PageWrapper>
  );
};

export default Team;
