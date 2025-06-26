import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext.js';
import { PageWrapper, Header } from '../components/common/PageWrapper.js';

import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

const TeamContainer = styled.div`
  min-height: 100%;
  padding-top: 20px;
  transition: background-color 0.3s ease;
  
  background-color: rgba(12,12,29,255); /* Adjusted background color */
  background-position: center;
 
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

  @media (max-width: 768px) {
    padding: 60px 5%;
  }
`;


const TeamSection = styled.section`
  padding: 100px 10%;
`;

const TeamGrid = styled.div`
  display: grid;
  text-align: center;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
  padding: 20px;
`;

const TeamMemberContent = styled.div`
  text-align: center;
  padding: 0 20px;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 20px;
  text-align: center;

  margin-top: 5px;
  justify-content: center;

  a {
    color: ${props => props.theme.primary};
    font-size: 1.5rem;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;

    &:hover {
      transform: translateY(-3px);
      color: ${props => props.theme.hoverColor};
    }

    span {
      font-size: 1rem;
    }
  }
`;

const Team = () => {
  const { theme } = useTheme();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  const teamMembers = [
    {
      name: "Charchit",
      position: "CEO & Founder",
      image: require("../assets/team/charchit1.jpeg"),
      instagram: "https://www.instagram.com/charchit.singh_16/",
      linkedin: "#"
    },
    {
      name: "Ayush Samant",
      position: "COO",
      image: require("../assets/team/ayush_samant.jpg"),
      instagram: "#",
      linkedin: "#"
    },
    {
      name: "Neelansh",
      position: "COO",
      image: require("../assets/team/neelansh.jpeg"),
      instagram: "https://www.instagram.com/neelansh_pratap_singh?igsh=bmRzZW5sb2w0dmRi",
      linkedin: "https://www.linkedin.com/in/neelansh-singh-894852218?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
    },
    {
      name: "Mayank",
      position: "Marketing Head",
      image: require("../assets/team/mayank.jpeg"),
      instagram: "https://www.instagram.com/m01ayank0?igsh=cDZvd2JncTBmam5s",
      linkedin: "https://www.linkedin.com/in/mayank-dhusia-807b3335a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
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
      instagram: "https://www.instagram.com/ayusx_h",
      linkedin: "https://www.linkedin.com/me?trk=p_mwlite_feed-secondary_nav"
    },
    {
      name: "Bhanu",
      position: "Media Head",
      image: require("../assets/team/bhanu_picture.jpg"),
      instagram: "https://optimusorgz.github.io/Optimusorgz/team.html#",
      linkedin: "https://optimusorgz.github.io/Optimusorgz/team.html#"
    },
    // Add more team members here
  ];

  return (
    <PageWrapper theme={theme}>
      <TeamContainer theme={theme}>
        <TeamSection>
          <Header theme={theme}>
            <h2 style={{
              fontSize: '2.5rem'
            }} data-aos="fade-up">Our Team</h2>
          </Header>
          <TeamGrid>
            {teamMembers.map((member, index) => (
              <div 
                key={index} 
                data-aos="fade-up"
                data-aos-delay={100 * (index % 4)}
              >
                <img 
                  src={member.image} 
                  alt={member.name}
                  style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: '15px'
                  }}
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
                      href={member.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      title={`${member.name}'s Instagram`}
                    >
                      <FontAwesomeIcon icon={faInstagram} />
                      {/* <span>Instagram</span> */}
                    </a>
                    <a 
                      href={member.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      title={`${member.name}'s LinkedIn`}
                    >
                      <FontAwesomeIcon icon={faLinkedinIn} />
                      {/* <span>LinkedIn</span> */}
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
