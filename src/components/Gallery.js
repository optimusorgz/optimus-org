import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import { useTheme } from '../context/ThemeContext';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

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

const Section = styled.section`
  padding: 0px 70px 100px 70px;
  padding-top: 0 !important;
  position: relative;
  overflow: hidden;
  background: radial-gradient(
  circle at top left,
  rgba(255, 255, 255, 0.3) 50px,
  rgba(255, 255, 255, 0.1) 200px,
  rgba(12, 12, 29, 0.8) 400px,
  rgba(12, 12, 29, 1) 500px,
  transparent 90%
);
  background-size: 100% 100%;
  animation: ${pulseGradient} 5s ease-in-out infinite;

  transition: background 0.3s ease;
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
    }
    
  @media (max-width: 768px) {
    padding: 60px 5%;
  }
  
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(15, 3, 38, 0.15);
    
    
    z-index: 0;
    transition: opacity 0.3s ease;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 60px;
  position: relative;
  z-index: 1;

  h2 {
    font-size: 3rem;
    color: transparent;
    
    margin-bottom: 20px;
    position: relative;
    display: inline-block;
    transition: all 0.3s ease;

    &::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 150px;
      height: 3px;
      
      transition: background 0.3s ease;
    }
  }
`;



const StyledSwiper = styled(Swiper)`
  width: 100%;
  padding: 50px 0;  .swiper-slide {
    position: relative;
    width: 400px;
    height: 400px;
    overflow: hidden;
    border-radius: 15px;
    transform: scale(0.7) translateY(50px);
    transition: all 0.5s ease;
    opacity: 0.6;
    box-shadow: ${props => props.isDarkTheme
    ? '0 10px 30px rgba(0, 255, 255, 0.1)'
    : '0 10px 30px rgba(0, 139, 139, 0.1)'};
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }    &:hover {
      img {
        transform: scale(1.1);
      }
    }
  }  .swiper-slide-active {
    transform: scale(1) translateY(0);
    opacity: 1;
    z-index: 2;
  }
  
  .swiper-slide-prev {
    transform: scale(0.7) translateY(50px) translateX(25%) rotate(-5deg);
    opacity: 0.7;
  }
  
  .swiper-slide-next {
    transform: scale(0.7) translateY(50px) translateX(-25%) rotate(5deg);
    opacity: 0.7;
  }

  .swiper-pagination-bullet {
    background: ${props => props.isDarkTheme ? '#00FFFF' : '#008B8B'};
    opacity: 0.5;
    transition: all 0.3s ease;
  }

  .swiper-pagination-bullet-active {
    opacity: 1;
    background: ${props => props.isDarkTheme
    ? 'linear-gradient(to right, #00FFFF, #00BFFF)'
    : 'linear-gradient(to right, #008B8B, #006666)'};
  }
`;

const Gallery = () => {
  const { isDarkTheme } = useTheme(); // Removed unused theme variable

  const slides = [
    {
      image: require('../assets/gallary/IMG_0358.jpg'),
      title: 'Annual Hackathon',
      description: 'Students collaborating and innovating in our biggest event of the year'
    },
    {
      image: require('../assets/gallary/IMG_4972.jpg'),
      title: 'Tech Workshops',
      description: 'Hands-on learning sessions with industry experts'
    },
    {
      image: require('../assets/gallary/IMG_0333.jpg'),
      title: 'Tech Workshops',
      description: 'Hands-on learning sessions with industry experts'
    },
    {
      image: require('../assets/gallary/IMG_0338.jpg'),
      title: 'Tech Workshops',
      description: 'Hands-on learning sessions with industry experts'
    },
    {
      image: require('../assets/gallary/IMG_5760.jpeg'),
      title: 'Team Projects',
      description: 'Collaborative projects bringing ideas to life'
    },

    {
      image: require('../assets/gallary/IMG_0338.jpg'),
      title: 'Community Events',
      description: 'Building connections and sharing knowledge'
    },
    {
      image: require('../assets/gallary/IMG_0317.jpg'),
      title: 'Innovation Lab',
      description: 'Where ideas transform into reality'
    }
  ];

  return (
    <Section isDarkTheme={isDarkTheme}>
      <Header isDarkTheme={isDarkTheme}>
        <h2 data-aos="fade-up">Gallery</h2>
      </Header>      <StyledSwiper
        modules={[EffectCoverflow, Pagination, Autoplay]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={"auto"}
        spaceBetween={10}
        initialSlide={1} coverflowEffect={{
          rotate: 35,
          stretch: 0,
          depth: 200,
          modifier: 1,
          slideShadows: true,
        }}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        loop={true}
        isDarkTheme={isDarkTheme}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>            <img
            src={slide.image}
            alt={slide.title}
            loading="lazy"
          />
          </SwiperSlide>
        ))}
      </StyledSwiper>
    </Section>
  );
};

export default Gallery;
