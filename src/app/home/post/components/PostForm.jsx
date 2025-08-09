'use client'

import { Type, AtSign, Image as ImageIcon } from 'lucide-react'
import { useState, useRef } from 'react'
import ImageUpload from './ImageUpload'
import MentionAutocomplete from './MentionAutocomplete'

export default function PostForm({ 
  content, 
  handleContentChange, 
  charCount, 
  maxChars,
  images,
  onImagesChange
}) {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const textareaRef = useRef(null);

  return (
    <div className="mb-6 lg:mb-8">
      <div className="flex items-center gap-2 mb-3 lg:mb-4">
        <Type className="w-4 h-4 lg:w-5 lg:h-5 text-gray-800" />
        <span className="text-gray-900 font-bold text-base lg:text-lg">What's on your mind?</span>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          rows={6}
          placeholder="Share your insights, ask questions, or start a discussion... Use @username to mention someone!"
          className="w-full p-4 lg:p-6 border-2 border-gray-300 rounded-xl lg:rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-gray-900 resize-none font-medium text-sm lg:text-base"
        />
        
        <MentionAutocomplete
          textareaRef={textareaRef}
          content={content}
          onContentChange={handleContentChange}
        />
        
        <div className="absolute bottom-3 lg:bottom-4 right-3 lg:right-4 text-xs lg:text-sm">
          <span className={`font-semibold ${charCount > maxChars * 0.8 ? 'text-orange-600' : 'text-gray-600'}`}>
            {charCount}
          </span>
          <span className="text-gray-500">/{maxChars}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 mt-4">
        <button
          type="button"
          onClick={() => setShowImageUpload(!showImageUpload)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            showImageUpload || images?.length > 0
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ImageIcon size={16} />
          <span>
            {images?.length > 0 ? `${images.length} image${images.length > 1 ? 's' : ''}` : 'Add images'}
          </span>
        </button>
        
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <AtSign size={16} />
          <span>Use @username to mention</span>
        </div>
      </div>

      {/* Image Upload Section */}
      {showImageUpload && (
        <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
          <ImageUpload
            images={images || []}
            onImagesChange={onImagesChange}
            maxImages={4}
          />
        </div>
      )}
    </div>
  )
}