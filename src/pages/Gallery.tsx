import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  // Gallery items - only images and videos
  const galleryItems = [
    {
      id: 1,
      type: "image",
      src: "/api/placeholder/400/300",
      alt: "Tech Event 2023",
    },
    {
      id: 2,
      type: "image", 
      src: "/api/placeholder/400/300",
      alt: "Workshop Session",
    },
    {
      id: 3,
      type: "image",
      src: "/api/placeholder/400/300", 
      alt: "Team Meeting",
    },
    {
      id: 4,
      type: "image",
      src: "/api/placeholder/400/300",
      alt: "Conference Hall",
    },
    {
      id: 5,
      type: "image",
      src: "/api/placeholder/400/300",
      alt: "Networking Event",
    },
    {
      id: 6,
      type: "image",
      src: "/api/placeholder/400/300",
      alt: "Awards Ceremony",
    },
    {
      id: 7,
      type: "image", 
      src: "/api/placeholder/400/300",
      alt: "Innovation Showcase",
    },
    {
      id: 8,
      type: "image",
      src: "/api/placeholder/400/300",
      alt: "Community Gathering",
    },
    {
      id: 9,
      type: "image",
      src: "/api/placeholder/400/300",
      alt: "Learning Session",
    }
  ];

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const goToPrevious = () => {
    if (selectedImage === null) return;
    setSelectedImage(selectedImage === 0 ? galleryItems.length - 1 : selectedImage - 1);
  };

  const goToNext = () => {
    if (selectedImage === null) return;
    setSelectedImage(selectedImage === galleryItems.length - 1 ? 0 : selectedImage + 1);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage === null) return;
      
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") closeLightbox();
    };

    if (selectedImage !== null) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedImage]);

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-glow mb-4">Gallery</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Explore moments from our events and activities
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {galleryItems.map((item, index) => (
            <div
              key={item.id}
              className="group cursor-pointer overflow-hidden rounded-lg bg-gray-100 hover:shadow-lg transition-all duration-300 hover-scale"
              onClick={() => openLightbox(index)}
            >
              <div className="aspect-video relative">
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage !== null && (
          <Dialog open={true} onOpenChange={closeLightbox}>
            <DialogContent className="max-w-6xl w-full h-[90vh] p-0 bg-black/95 border-0">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                  onClick={closeLightbox}
                >
                  <X className="h-6 w-6" />
                </Button>

                {/* Previous Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-10 text-white hover:bg-white/20"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>

                {/* Main Image */}
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={galleryItems[selectedImage].src}
                    alt={galleryItems[selectedImage].alt}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {/* Next Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 z-10 text-white hover:bg-white/20"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                    {selectedImage + 1} of {galleryItems.length}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Gallery;