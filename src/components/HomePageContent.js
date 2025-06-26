import React from 'react';
import Hero from './Hero';
import { Highlights } from './Highlights';
import Mission from './Mission';
import GalleryComponent from './Gallery';
import Footer from './Footer';

function HomePageContent() {
  return (
    <>
      <Hero />
      <Highlights />
      <Mission />
      <GalleryComponent />
      <Footer />
    </>
  );
}

export default HomePageContent;