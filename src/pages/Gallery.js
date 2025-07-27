import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Footer from '../components/Footer';

const images = [
  { src: '/assets/gallery/IMG_0317.jpg', alt: 'Team Building Activity' },
  { src: '/assets/gallery/IMG_0325.jpg', alt: 'Workshop Session' },
  { src: '/assets/gallery/IMG_0331.jpg', alt: 'Group Discussion' },
  { src: '/assets/gallery/IMG_0341.jpg', alt: 'Team Presentation' },
  { src: '/assets/gallery/IMG_0358.jpg', alt: 'Project Review' },
  { src: '/assets/gallery/IMG_5760.jpeg', alt: 'Team Meeting' },
  { src: '/assets/gallery/IMG_5766.JPG', alt: 'Brainstorming Session' },
  { src: '/assets/gallery/IMG_5773.JPG', alt: 'Tech Talk' },
  { src: '/assets/gallery/IMG_5780.JPG', alt: 'Team Collaboration' },
  { src: '/assets/gallery/IMG_0314.jpg', alt: 'Innovation Workshop' },
  { src: '/assets/gallery/IMG_0322.jpg', alt: 'Team Event' },
  { src: '/assets/gallery/IMG_0333.jpg', alt: 'Project Planning' },
  { src: '/assets/gallery/IMG_0338.jpg', alt: 'Team Discussion' },
  { src: '/assets/gallery/IMG_0352.jpg', alt: 'Development Session' }
];

const GalleryContainer = styled.div`
  padding: 2rem;
  text-align: center;
`;

const GalleryHeading = styled.h2`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const GalleryDescription = styled.p`
  font-size: 1rem;
  margin-bottom: 2rem;
  color: #555;
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
`;

const GalleryCardWrapper = styled.div`
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
  overflow: hidden;

  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    display: block;
  }

  &:hover {
    transform: scale(1.05);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalImage = styled.img`
  max-width: 90%;
  max-height: 80%;
  border-radius: 10px;
`;

const Close = styled.span`
  position: absolute;
  top: 10%;
  right: 5%;
  font-size: 2.5rem;
  color: white;
  cursor: pointer;
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  font-size: 2rem;
  color: white;
  background: transparent;
  border: none;
  cursor: pointer;
  user-select: none;
  transform: translateY(-50%);

  &:hover {
    color: #ccc;
  }

  &.prev {
    left: 5%;
  }

  &.next {
    right: 5%;
  }
`;

function GalleryCard({ image, index, onClick }) {
  return (
    <GalleryCardWrapper data-aos="fade-up" onClick={() => onClick(index)}>
      <img src={image.src} alt={image.alt} loading="lazy" />
    </GalleryCardWrapper>
  );
}

function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const handleImageClick = (index) => {
    setSelectedImage(index);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handlePrevImage = () => {
    setSelectedImage((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : images.length - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImage((prevIndex) =>
      prevIndex < images.length - 1 ? prevIndex + 1 : 0
    );
  };

  return (
    <>
      <GalleryContainer>
        <GalleryHeading>Gallery</GalleryHeading>
        <GalleryDescription>
          Explore our moments of collaboration, innovation, and celebration.
        </GalleryDescription>
        <GalleryGrid>
          {images.map((image, index) => (
            <GalleryCard
              key={index}
              image={image}
              index={index}
              onClick={handleImageClick}
            />
          ))}
        </GalleryGrid>
      </GalleryContainer>

      {selectedImage !== null && (
        <Modal onClick={handleCloseModal}>
          <Close onClick={handleCloseModal}>&times;</Close>
          <NavButton className="prev" onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}>
            &#10094;
          </NavButton>
          <ModalImage
            src={images[selectedImage].src}
            alt={images[selectedImage].alt}
          />
          <NavButton className="next" onClick={(e) => { e.stopPropagation(); handleNextImage(); }}>
            &#10095;
          </NavButton>
        </Modal>
      )}

      <Footer />
    </>
  );
}

export default GalleryPage;
