'use client'

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageGallery = ({ images = [], className = "" }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [loading, setLoading] = useState({});

  if (!images || images.length === 0) return null;

  const handleImageLoad = (index) => {
    setLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleImageLoadStart = (index) => {
    setLoading(prev => ({ ...prev, [index]: true }));
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = 'unset';
  };

  const navigateLightbox = (direction) => {
    if (lightboxIndex === null) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = lightboxIndex > 0 ? lightboxIndex - 1 : images.length - 1;
    } else {
      newIndex = lightboxIndex < images.length - 1 ? lightboxIndex + 1 : 0;
    }
    
    setLightboxIndex(newIndex);
  };

  const downloadImage = (imageUrl, imageName) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageName || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getGridLayoutClass = () => {
    switch (images.length) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2";
      case 4:
        return "grid-cols-2";
      default:
        return "grid-cols-2";
    }
  };

  const getImageClass = (index, total) => {
    if (total === 1) return "col-span-1 aspect-video";
    if (total === 2) return "col-span-1 aspect-square";
    if (total === 3) {
      if (index === 0) return "col-span-2 aspect-video";
      return "col-span-1 aspect-square";
    }
    if (total === 4) return "col-span-1 aspect-square";
    return "col-span-1 aspect-square";
  };

  const handleKeyDown = (e) => {
    if (lightboxIndex === null) return;
    
    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        navigateLightbox('prev');
        break;
      case 'ArrowRight':
        navigateLightbox('next');
        break;
    }
  };

  // Add keyboard listener
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  return (
    <>
      {/* Image Grid */}
      <div className={`grid ${getGridLayoutClass()} gap-1 rounded-lg overflow-hidden ${className}`}>
        {images.slice(0, 4).map((image, index) => {
          const imageUrl = typeof image === 'string' ? image : image.url || image.previewUrl;
          const imageName = typeof image === 'string' ? `image-${index + 1}` : image.name || `image-${index + 1}`;
          
          return (
            <div
              key={index}
              className={`relative group cursor-pointer bg-gray-100 ${getImageClass(index, Math.min(images.length, 4))}`}
              onClick={() => openLightbox(index)}
            >
              {loading[index] && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              )}
              
              <img
                src={imageUrl}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onLoadStart={() => handleImageLoadStart(index)}
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageLoad(index)}
              />
              
              {/* Overlay for extra images count */}
              {images.length > 4 && index === 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-xl font-semibold">
                    +{images.length - 4}
                  </span>
                </div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateLightbox('prev');
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-200"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateLightbox('next');
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-200"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image counter and actions */}
              <div className="absolute top-4 left-4 z-10 flex items-center space-x-4">
                {images.length > 1 && (
                  <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {lightboxIndex + 1} / {images.length}
                  </span>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentImage = images[lightboxIndex];
                    const imageUrl = typeof currentImage === 'string' ? currentImage : currentImage.url || currentImage.previewUrl;
                    const imageName = typeof currentImage === 'string' ? `image-${lightboxIndex + 1}` : currentImage.name || `image-${lightboxIndex + 1}`;
                    downloadImage(imageUrl, imageName);
                  }}
                  className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-200"
                  title="Download image"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>

              {/* Main image */}
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                src={typeof images[lightboxIndex] === 'string' ? images[lightboxIndex] : images[lightboxIndex].url || images[lightboxIndex].previewUrl}
                alt={`Image ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageGallery;