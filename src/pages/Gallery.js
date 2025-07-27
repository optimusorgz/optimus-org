import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../context/ThemeContext';
import { PageWrapper, Header } from '../components/common/PageWrapper';
import Footer from '../components/Footer';
import AOS from 'aos';
import 'aos/dist/aos.css';

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
  require('../assets/gallary/IMG_0317.jpg'),
  require('../assets/gallary/IMG_0322.jpg'),
  require('../assets/gallary/IMG_0323.jpg'),
  require('../assets/gallary/IMG_0325.jpg'),
  require('../assets/gallary/IMG_0326.jpg'),
  require('../assets/gallary/IMG_0331.jpg'),
  require('../assets/gallary/IMG_0333.jpg'),
  require('../assets/gallary/IMG_0338.jpg'),
  require('../assets/gallary/IMG_0341.jpg'),
  require('../assets/gallary/IMG_0352.jpg'),
  require('../assets/gallary/IMG_0358.jpg'),
  require('../assets/gallary/IMG_4972.jpg'),
  require('../assets/gallary/IMG_5760.jpeg'),
  require('../assets/gallary/IMG_5766.JPG'),
  require('../assets/gallary/IMG_5773.JPG'),
  require('../assets/gallary/IMG_5780.JPG'),
];

const GalleryContainer = styled.div`
  min-height: 100%;
  padding-top: 20px;
  position: relative;
  background-color: rgba(12,12,29,255);
  background-position: center;
  transition: background-color 0.3s ease;
  background: radial-gradient(
    circle at top left,
    rgba(255, 255, 255, 0.3) 100px,
    rgba(255, 255, 255, 0.1) 200px,
    rgba(12, 12, 29, 0.8) 400px,
    rgba(12, 12, 29, 1) 500px,
    transparent 100%
  );
  background-size: 100% 100%;
  animation: ${pulseGradient} 5s ease-in-out infinite;
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

const GallerySection = styled.section`
  padding: 100px 10%;
  position: relative;
  z-index: 1;
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 25px;
  padding: 20px;
`;

const GalleryImage = styled.img`
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  cursor: pointer;
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.04);
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
  width: 70px;
  height: 70px;
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.5);
  border: none;
  color: #fff;
  font-size: 3rem;
  padding: 0 22px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1101;
  &:hover {
    background: #00FFFF;
    color: #111;
  }
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

  return (
    <PageWrapper theme={theme}>
      <GalleryContainer theme={theme}>
        <GallerySection>
          <Header theme={theme}>
            <h2 style={{ fontSize: '2.5rem' }} data-aos="fade-up">Gallery</h2>
          </Header>
          <GalleryGrid>
            {images.map((img, idx) => (
              <div key={idx} data-aos="fade-up" data-aos-delay={100 * (idx % 4)}>
                <GalleryImage src={img} alt={`Gallery ${idx + 1}`} onClick={() => openModal(idx)} />
              </div>
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
