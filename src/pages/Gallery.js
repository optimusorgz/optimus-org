import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext';
import { PageWrapper, ContentContainer, Section, Header } from '../components/common/PageWrapper';
import Footer from '../components/Footer';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faTimes } from '@fortawesome/free-solid-svg-icons';

const GalleryContainer = styled.div`
  min-height: 100vh;
  
  padding-top: 20px;
  transition: background-color 0.3s ease;

  background: radial-gradient(
  circle at top left,
  rgba(255, 255, 255, 0.3) 100px,
  rgba(255, 255, 255, 0.1) 200px,
  rgba(12, 12, 29, 0.8) 400px,
  rgba(12, 12, 29, 1) 500px,
  transparent 100%
);
  background-color: rgba(12,12,29,255);
  
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  padding: 20px;
`;

const GalleryCard = styled.div`
  background: ${props => props.theme.cardBackground};
  border: 1px solid ${props => props.theme.cardBorder};
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;

  img {
    width: 100%;
    height: 300px;
    object-fit: cover;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 255, 255, 0.2);
  }
`;

const ImageModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 90%;
  max-height: 90vh;
  img {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
  }
`;

const NavButton = styled.button`
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  color: white;
  padding: 20px;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1001;

  &:hover {
    color: #00FFFF;
  }

  &.prev {
    left: 40px;
  }

  &.next {
    right: 40px;
  }
`;

const CloseButton = styled.button`
  position: fixed;
  top: 40px;
  right: 40px;
  border: none;
  color: white;
  padding: 15px;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1001;

  &:hover {
    color: #00FFFF;
  }
`;

const Gallery = () => {
  const { theme } = useTheme();
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  const handleImageClick = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedImage) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          handleClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage]);

  const images = [
    { src: 'IMG_0317.jpg', alt: 'Team Building Activity' },
    { src: 'IMG_0325.jpg', alt: 'Workshop Session' },
    { src: 'IMG_0331.jpg', alt: 'Group Discussion' },
    { src: 'IMG_0341.jpg', alt: 'Team Presentation' },
    { src: 'IMG_0358.jpg', alt: 'Project Review' },
    { src: 'IMG_5760.jpeg', alt: 'Team Meeting' },
    { src: 'IMG_5766.JPG', alt: 'Brainstorming Session' },
    { src: 'IMG_5773.JPG', alt: 'Tech Talk' },
    { src: 'IMG_5780.JPG', alt: 'Team Collaboration' },
    { src: 'IMG_0314.jpg', alt: 'Innovation Workshop' },
    { src: 'IMG_0322.jpg', alt: 'Team Event' },
    { src: 'IMG_0333.jpg', alt: 'Project Planning' },
    { src: 'IMG_0338.jpg', alt: 'Team Discussion' },
    { src: 'IMG_0352.jpg', alt: 'Development Session' }
  ];

  return (
    <PageWrapper theme={theme}>
      <GalleryContainer theme={theme}>
        <Section>
          <Header theme={theme}>
            <h2 data-aos="fade-up" style={{
              fontSize: '2.5rem'
            }}>Our Gallery</h2>
          </Header>
          <GalleryGrid>
            {images.map((image, index) => (              
              <GalleryCard 
                key={index} 
                theme={theme}
                data-aos="fade-up"
                data-aos-delay={100 * (index % 4)}
                onClick={() => handleImageClick(image, index)}
              >
                <img 
                  src={require(`../assets/${image.src}`)} 
                  alt={image.alt}
                  loading="lazy"
                />
              </GalleryCard>
            ))}          </GalleryGrid>
        </Section>
        
        
        {selectedImage && (
          <ImageModal onClick={handleClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <img 
                src={require(`../assets/${images[currentIndex].src}`)} 
                alt={images[currentIndex].alt}
              />
              <NavButton className="prev" onClick={handlePrevious}>
                <FontAwesomeIcon icon={faChevronLeft} size="2x" />
              </NavButton>
              <NavButton className="next" onClick={handleNext}>
                <FontAwesomeIcon icon={faChevronRight} size="2x" />
              </NavButton>
              <CloseButton onClick={handleClose}>
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </CloseButton>
            </ModalContent>
          </ImageModal>
        )}
      </GalleryContainer>
    </PageWrapper>
  );
};

export default Gallery;