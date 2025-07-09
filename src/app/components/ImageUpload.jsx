'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { validateImageFile, compressImage } from '../utils/imageUtils'

export default function ImageUpload({ 
  onImageSelect, 
  currentImage = null, 
  isLoading = false, 
  type = 'profile',
  className = '',
  multiple = false 
}) {
  const [dragActive, setDragActive] = useState(false)
  const [previewImages, setPreviewImages] = useState(currentImage ? [currentImage] : [])
  const fileInputRef = useRef(null)

  const handleFiles = async (files) => {
    try {
      const fileArray = Array.from(files)
      
      if (!multiple && fileArray.length > 1) {
        throw new Error('Only one file allowed')
      }
      
      if (multiple && fileArray.length > 5) {
        throw new Error('Maximum 5 files allowed')
      }

      const validatedFiles = []
      const newPreviews = []

      for (const file of fileArray) {
        validateImageFile(file)
        
        const compressedFile = await compressImage(file)
        validatedFiles.push(compressedFile)
        
        const previewUrl = URL.createObjectURL(compressedFile)
        newPreviews.push(previewUrl)
      }

      if (multiple) {
        setPreviewImages(prev => [...prev, ...newPreviews])
      } else {
        setPreviewImages(newPreviews)
      }

      onImageSelect(multiple ? validatedFiles : validatedFiles[0])
    } catch (error) {
      alert(error.message)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const removeImage = (index) => {
    const newPreviews = previewImages.filter((_, i) => i !== index)
    setPreviewImages(newPreviews)
    
    if (newPreviews.length === 0) {
      onImageSelect(null)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  if (type === 'profile' && previewImages.length > 0) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-32 h-32 rounded-full overflow-hidden">
          <img 
            src={previewImages[0]} 
            alt="Profile preview" 
            className="w-full h-full object-cover"
          />
        </div>
        <button
          onClick={openFileDialog}
          disabled={isLoading}
          className="absolute bottom-0 right-0 bg-gray-900 text-amber-300 p-2 rounded-full hover:scale-110 transition-all duration-300 shadow-lg disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className={className}>
      {previewImages.length > 0 && (
        <div className={`mb-4 ${multiple ? 'grid grid-cols-2 md:grid-cols-3 gap-4' : ''}`}>
          {previewImages.map((preview, index) => (
            <div key={index} className="relative">
              <img 
                src={preview} 
                alt={`Preview ${index + 1}`} 
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
          ${dragActive 
            ? 'border-amber-400 bg-amber-50' 
            : 'border-gray-300 hover:border-amber-400 hover:bg-gray-50'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center gap-4">
          {isLoading ? (
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
          
          <div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isLoading ? 'Uploading...' : 'Upload Images'}
            </p>
            <p className="text-sm text-gray-600">
              Drag and drop or click to select {multiple ? 'images' : 'an image'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPEG, PNG, WebP up to 5MB {multiple ? '(max 5 files)' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}