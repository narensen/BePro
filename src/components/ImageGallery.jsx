'use client'

import { useState } from 'react'
import { X, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react'

const ImageGallery = ({ images = [], className = '' }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) return null

  // Handle both string URLs and image objects
  const normalizeImages = (imageArray) => {
    return imageArray.map(img => {
      if (typeof img === 'string') {
        return img; // Already a URL string
      }
      return img.url || img; // Extract URL from object or fallback
    });
  };

  const normalizedImages = normalizeImages(images);

  const openLightbox = (index) => {
    setCurrentIndex(index)
    setSelectedImage(normalizedImages[index])
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % normalizedImages.length
    setCurrentIndex(nextIndex)
    setSelectedImage(normalizedImages[nextIndex])
  }

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + normalizedImages.length) % normalizedImages.length
    setCurrentIndex(prevIndex)
    setSelectedImage(normalizedImages[prevIndex])
  }

  const getGridClass = () => {
    switch (normalizedImages.length) {
      case 1:
        return 'grid-cols-1'
      case 2:
        return 'grid-cols-2'
      case 3:
        return 'grid-cols-2'
      default:
        return 'grid-cols-2'
    }
  }

  return (
    <>
      <div className={`grid ${getGridClass()} gap-2 ${className}`}>
        {normalizedImages.slice(0, 4).map((image, index) => (
          <div
            key={index}
            className={`relative group cursor-pointer rounded-lg overflow-hidden ${
              normalizedImages.length === 3 && index === 0 ? 'row-span-2' : ''
            }`}
          >
            <img
              src={image}
              alt={`Image ${index + 1}`}
              className="w-full h-40 object-cover transition-transform duration-200 group-hover:scale-105"
              onClick={() => openLightbox(index)}
            />
            
            {/* Overlay for more images */}
            {index === 3 && normalizedImages.length > 4 && (
              <div
                className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xl"
                onClick={() => openLightbox(index)}
              >
                +{normalizedImages.length - 4}
              </div>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Maximize2 className="text-white w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Previous button */}
          {normalizedImages.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-4 text-white hover:text-gray-300 z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Image */}
          <img
            src={selectedImage}
            alt={`Image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={closeLightbox}
          />

          {/* Next button */}
          {normalizedImages.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 text-white hover:text-gray-300 z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Image counter */}
          {normalizedImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {normalizedImages.length}
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default ImageGallery