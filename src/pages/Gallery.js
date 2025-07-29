import React, { useEffect, useState } from 'react';
// import Masonry from 'react-masonry-css';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../context/ThemeContext';
import { PageWrapper, Header } from '../components/common/PageWrapper';
import Footer from '../components/Footer';
import AOS from 'aos';
import 'aos/dist/aos.css';
import TypingText from '../components/TypingText';

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

const images = [
  require('../assets/gallary/IMG_0314.jpg'),
  require('../assets/gallary/IMG_0325.jpg'),
  require('../assets/gallary/IMG_0331.jpg'),
  require('../assets/gallary/IMG_0333.jpg'),
  require('../assets/gallary/IMG_0323.jpg'),
  require('../assets/gallary/IMG_0338.jpg'),
  require('../assets/gallary/IMG_0341.jpg'),
  require('../assets/gallary/IMG_0352.jpg'),
  require('../assets/gallary/IMG_0322.jpg'),
  require('../assets/gallary/IMG_0358.jpg'),
  require('../assets/gallary/IMG_4972.jpg'),
  require('../assets/gallary/IMG_0317.jpg'),
  require('../assets/gallary/IMG_5760.jpeg'),
  require('../assets/gallary/IMG_5766.JPG'),
  require('../assets/gallary/IMG_5773.JPG'),
  require('../assets/gallary/IMG_0326.jpg'),
  require('../assets/gallary/IMG_5780.JPG'),
];

const GalleryContainer = styled.div`
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
  animation: ${pulseGradient} 5s ease-in-out infinite;
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
  @media (max-width: 768px) {
    padding: 40px 1.5% 0 1.5%;
  }
  @media (max-width: 600px) {
    padding: 24px 0.9% 0 0.9%;
  }
`;

const GallerySection = styled.section`
  padding: 100px 0%;
  position: relative;
  z-index: 1;
  @media (max-width: 600px) {
    padding: 36px 2% 0 2%;
  }
`;

const GalleryGrid = styled.div`
  column-count: 4;
  column-gap: 5px;
  padding:  0 5%;
  background: transparent;
  border-radius: 10px;
  @media (max-width: 1400px) {
    column-count: 3;
    }
    @media (max-width: 1024px) {
    padding:  0 4%;
    column-count: 3;
    column-gap: 0px;
    }
    @media (max-width: 700px) {
    padding:  0 2%;
    column-count: 2;
    column-gap: 0px;
  }
`;

const GalleryCard = styled.div`
  background: transparent;
  border-radius: 0px;
  margin: 10px 5px;
  box-shadow: 0 6px 32px rgba(0,0,0,0.18);
  padding: 0;
  break-inside: avoid;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const GalleryImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 2%;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s;
  display: block;
  background: #181a2a;
  object-fit: cover;
  max-width: 100%;
  &:hover {
    box-shadow: 0 8px 24px rgba(0,255,255,0.15);
  }
`;


const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.95);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalImage = styled.img`
  max-width: 100vw;
  max-height: 100vh;
  width: 100vw;
  height: 100vh;
  object-fit: contain;
  background: #111;
  display: block;
`;

const ArrowButton = styled.button`
  width: 10%;
  height: 10%;
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.5);
  border: none;
  color: #fff;
  font-size: 2rem;
  padding: 0 auto;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
    @media (max-width: 600px) {
    width: 7%;
    height: 7%;
    top: 90%;
    padding: 0 auto;
`;

const CloseButton = styled.button`
  position: fixed;
  top: 24px;
  right: 32px;
  background: rgba(0,0,0,0.7);
  border: none;
  color: #fff;
  font-size: 2.5rem;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1102;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #00FFFF;
    color: #111;
  }
`;

const GalleryHeading = styled.h2`
  font-size: 1.1rem;
  margin-top: 0;
  margin-bottom: 1.2em;
  @media (max-width: 600px) {
    font-size: 0.8rem;
    margin-bottom: 0.7em;
  }
`;

function GalleryPage() {
  const { theme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const openModal = idx => {
    setCurrentIndex(idx);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);
  const showPrev = e => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const showNext = e => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Masonry breakpoints
  const breakpointColumnsObj = {
    default: 4,
    1400: 3,
    1024: 2,
    700: 1
  };

  // Typing effect for heading
  const [headingKey, setHeadingKey] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const header = document.getElementById('gallery-heading');
      if (!header) return;
      const rect = header.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setHeadingKey(prev => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <PageWrapper theme={theme}>
      <GalleryContainer theme={theme}>
        <GallerySection>
          <Header theme={theme}>
            <GalleryHeading id="gallery-heading" data-aos="fade-up">
              <TypingText key={headingKey} text="Gallery" speed={80} cursor={true} loop={true} />
            </GalleryHeading>
          </Header>
          <GalleryGrid>
            {images.map((img, idx) => (
              <GalleryCard key={idx}>
                <GalleryImage
                  src={img}
                  alt={`Gallery ${idx + 1}`}
                  onClick={() => openModal(idx)}
                />
              </GalleryCard>
            ))}
          </GalleryGrid>
        </GallerySection>
        {modalOpen && (
          <ModalOverlay onClick={closeModal}>
            <CloseButton onClick={closeModal} title="Close">×</CloseButton>
            <ArrowButton style={{ left: 0 }} onClick={showPrev} title="Previous">&#60;</ArrowButton>
            <ModalImage src={images[currentIndex]} alt={`Gallery ${currentIndex + 1}`} onClick={e => e.stopPropagation()} />
            <ArrowButton style={{ right: 0 }} onClick={showNext} title="Next">&#62;</ArrowButton>
          </ModalOverlay>
        )}
      </GalleryContainer>
    </PageWrapper>
  );
}


export default GalleryPage;
