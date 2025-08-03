/**
 * @file src/pages/Gallery.js
 * @description Gallery page component displaying a collection of images in a responsive grid
 * and providing a modal view for individual images with navigation.
 */

// --- React Imports ---
import React, { useEffect, useState } from 'react';

// --- Component Imports ---
// import Masonry from 'react-masonry-css'; // Masonry component is commented out, consider removal if not used.
import { PageWrapper, Header } from '../components/common/PageWrapper';
import TypingText from '../components/TypingText';
// Footer is imported but not used directly in the return JSX of Gallery component. Consider removing if truly unused.
import Footer from '../components/Footer';

// --- Style Imports ---
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext';
import { pulseGradient } from '../styles/GlobalStyles'; // Import pulseGradient from GlobalStyles

// --- External Library Imports ---
import AOS from 'aos';
import 'aos/dist/aos.css';

/**
 * Array of image paths for the gallery.
 * @type {string[]}
 */
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

/**
 * `GalleryContainer` styled component.
 * Styles the main container for the Gallery page, including background gradients and animations.
 * Uses `pulseGradient` for an animated background effect.
 * @param {object} props - Styled component props.
 * @param {object} props.theme - The theme object from ThemeContext.
 */
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
  @media (max-width: 768px) {
    padding: 40px 1.5% 0 1.5%;
  }
  @media (max-width: 600px) {
    padding: 24px 0.9% 0 0.9%;
  }
`;

/**
 * `GallerySection` styled component.
 * Defines padding and positioning for the gallery content section.
 */
const GallerySection = styled.section`
  padding: 100px 0%;
  position: relative;
  z-index: 1;
  @media (max-width: 600px) {
    padding: 36px 2% 0 2%;
  }
`;

/**
 * `GalleryGrid` styled component.
 * Arranges gallery images in a multi-column layout with responsive adjustments.
 */
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

/**
 * `GalleryCard` styled component.
 * Styles individual gallery image containers.
 */
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

/**
 * `GalleryImage` styled component.
 * Styles individual images within the gallery, including hover effects.
 */
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

/**
 * `ModalOverlay` styled component.
 * Full-screen overlay for displaying the modal image.
 */
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

/**
 * `ModalImage` styled component.
 * Styles the image displayed within the modal, ensuring it fits the screen.
 */
const ModalImage = styled.img`
  max-width: 100vw;
  max-height: 100vh;
  width: 100vw;
  height: 100vh;
  object-fit: contain;
  background: #111;
  display: block;
`;

/**
 * `ArrowButton` styled component.
 * Styles navigation arrows within the modal for previous/next image.
 */
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

/**
 * `CloseButton` styled component.
 * Styles the close button for the modal.
 */
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

/**
 * `GalleryHeading` styled component.
 * Styles the heading text for the gallery.
 */
const GalleryHeading = styled.h2`
  font-size: 1.1rem;
  margin-top: 0;
  margin-bottom: 1.2em;
  @media (max-width: 600px) {
    font-size: 0.8rem;
    margin-bottom: 0.7em;
  }
`;

/**
 * `GalleryPage` functional component.
 * Displays a responsive image gallery with a modal for full-screen viewing and navigation.
 * Integrates AOS for scroll animations and TypingText for the heading.
 * @returns {JSX.Element} The Gallery page.
 */
function GalleryPage() {
  const { theme } = useTheme();
  // State for controlling the visibility of the image modal
  const [modalOpen, setModalOpen] = useState(false);
  // State for tracking the index of the currently displayed image in the modal
  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize AOS (Animate On Scroll) library once on component mount.
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  /**
   * Opens the modal with the clicked image.
   * @param {number} idx - The index of the image to display in the modal.
   */
  const openModal = idx => {
    setCurrentIndex(idx);
    setModalOpen(true);
  };
  /**
   * Closes the image modal.
   */
  const closeModal = () => setModalOpen(false);
  /**
   * Navigates to the previous image in the modal.
   * @param {React.MouseEvent} e - The click event to stop propagation.
   */
  const showPrev = e => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  /**
   * Navigates to the next image in the modal.
   * @param {React.MouseEvent} e - The click event to stop propagation.
   */
  const showNext = e => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Masonry breakpoints (currently commented out in imports, but defined here if needed later)
  const breakpointColumnsObj = {
    default: 4,
    1400: 3,
    1024: 2,
    700: 1
  };

  // State for forcing `TypingText` re-render on scroll for the heading.
  const [headingKey, setHeadingKey] = useState(0);
  /**
   * Effect to trigger `TypingText` animation when the gallery heading enters the viewport.
   * Adds and removes a scroll event listener.
   */
  useEffect(() => {
    const handleScroll = () => {
      const header = document.getElementById('gallery-heading');
      if (!header) return;
      const rect = header.getBoundingClientRect();
      // Check if the header is in the viewport
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setHeadingKey(prev => prev + 1); // Increment key to restart typing animation
      }
    };
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    // Cleanup function: remove event listener on component unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  return (
    <PageWrapper theme={theme}>
      <GalleryContainer theme={theme}>
        <GallerySection>
          <Header theme={theme}>
            {/* Gallery heading with typing effect */}
            <GalleryHeading id="gallery-heading" data-aos="fade-up">
              <TypingText key={headingKey} text="Gallery" speed={80} cursor={true} loop={true} />
            </GalleryHeading>
          </Header>
          <GalleryGrid>
            {/* Map through images to render individual gallery cards */}
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
        {/* Modal for full-screen image view, conditionally rendered */}
        {modalOpen && (
          <ModalOverlay onClick={closeModal}>
            {/* Close button */}
            <CloseButton onClick={closeModal} title="Close">×</CloseButton>
            {/* Previous image button */}
            <ArrowButton style={{ left: 0 }} onClick={showPrev} title="Previous">&#60;</ArrowButton>
            {/* Current image in modal */}
            <ModalImage src={images[currentIndex]} alt={`Gallery ${currentIndex + 1}`} onClick={e => e.stopPropagation()} />
            {/* Next image button */}
            <ArrowButton style={{ right: 0 }} onClick={showNext} title="Next">&#62;</ArrowButton>
          </ModalOverlay>
        )}
      </GalleryContainer>
    </PageWrapper>
  );
}

export default GalleryPage;
