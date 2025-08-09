'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { supabase } from '../app/lib/supabase_client'

const ImageUpload = ({ 
  onImagesChange, 
  maxImages = 4, 
  currentImages = [],
  bucketName = 'post-images',
  placeholder = 'Drag & drop images here or click to upload'
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const handleFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return
    
    const remainingSlots = maxImages - currentImages.length
    if (remainingSlots <= 0) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    const validFiles = Array.from(files)
      .slice(0, remainingSlots)
      .filter(file => {
        if (!file.type.startsWith('image/')) {
          setError('Only image files are allowed')
          return false
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          setError('File size must be less than 10MB')
          return false
        }
        return true
      })

    if (validFiles.length === 0) return

    setUploading(true)
    setError('')

    try {
      const uploadedImages = []
      
      for (const file of validFiles) {
        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        
        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          setError(`Failed to upload ${file.name}`)
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path)

        uploadedImages.push({
          id: data.path,
          url: publicUrl,
          name: file.name,
          size: file.size
        })
      }

      if (uploadedImages.length > 0) {
        onImagesChange([...currentImages, ...uploadedImages])
      }
    } catch (err) {
      console.error('Error uploading images:', err)
      setError('Failed to upload images. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [currentImages, maxImages, bucketName, onImagesChange])

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleInputChange = useCallback((e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const removeImage = useCallback((imageId) => {
    const updatedImages = currentImages.filter(img => img.id !== imageId)
    onImagesChange(updatedImages)
    
    // Optionally delete from Supabase Storage
    // supabase.storage.from(bucketName).remove([imageId])
  }, [currentImages, onImagesChange])

  const openFileDialog = () => {
    inputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 cursor-pointer ${
          dragActive 
            ? 'border-amber-500 bg-amber-50/50' 
            : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50/30'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
        
        <div className="text-center">
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-amber-300/30 border-t-amber-500 rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Uploading images...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">{placeholder}</p>
                <p className="text-gray-500 text-sm mt-1">
                  PNG, JPG, GIF up to 10MB • {currentImages.length}/{maxImages} images
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Image Previews */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentImages.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(image.id)
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="truncate">{image.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageUpload