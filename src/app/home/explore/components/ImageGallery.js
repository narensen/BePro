import React, { useState } from 'react';
import { X } from 'lucide-react';

const ImageGallery = ({ images, className = '' }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) return null;

  const openLightbox = (image, index) => {
    setSelectedImage({ image, index });
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const getGridClass = (count) => {
    switch (count) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-2';
      case 4:
        return 'grid-cols-2';
      default:
        return 'grid-cols-2';
    }
  };

  const getImageClass = (count, index) => {
    if (count === 1) return 'col-span-1 aspect-video';
    if (count === 2) return 'col-span-1 aspect-square';
    if (count === 3) {
      if (index === 0) return 'col-span-2 aspect-video';
      return 'col-span-1 aspect-square';
    }
    if (count === 4) return 'col-span-1 aspect-square';
    return 'col-span-1 aspect-square';
  };

  return (
    <>
      <div className={`grid gap-2 rounded-lg overflow-hidden ${getGridClass(images.length)} ${className}`}>
        {images.slice(0, 4).map((imageUrl, index) => (
          <div
            key={index}
            className={`relative cursor-pointer group ${getImageClass(images.length, index)}`}
            onClick={() => openLightbox(imageUrl, index)}
          >
            <img
              src={imageUrl}
              alt={`Post image ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Overlay for additional images */}
            {index === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg">
                +{images.length - 4}
              </div>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors z-10"
            >
              <X size={20} />
            </button>
            
            <img
              src={selectedImage.image}
              alt={`Post image ${selectedImage.index + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Navigation dots if multiple images */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage({ image: images[index], index });
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === selectedImage.index ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;