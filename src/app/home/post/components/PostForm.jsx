'use client'

import { Type } from 'lucide-react'
import ImageUpload from '../../explore/components/ImageUpload'
import MentionAutocomplete from '../../explore/components/MentionAutocomplete'

export default function PostForm({ 
  content, 
  handleContentChange, 
  charCount, 
  maxChars,
  images = [],
  onImagesChange,
  onMentionSelect
}) {
  return (
    <div className="mb-6 lg:mb-8">
      <div className="flex items-center gap-2 mb-3 lg:mb-4">
        <Type className="w-4 h-4 lg:w-5 lg:h-5 text-gray-800" />
        <span className="text-gray-900 font-bold text-base lg:text-lg">What's on your mind?</span>
      </div>

      <div className="space-y-4">
        {/* Enhanced text input with mention support */}
        <div className="relative">
          <MentionAutocomplete
            value={content}
            onChange={(e) => handleContentChange(e)}
            onMentionSelect={onMentionSelect}
            placeholder="Share your insights, ask questions, or start a discussion... Use @username to mention someone!"
            rows={6}
            className="pr-20"
          />
          <div className="absolute bottom-3 lg:bottom-4 right-3 lg:right-4 text-xs lg:text-sm">
            <span className={`font-semibold ${charCount > maxChars * 0.8 ? 'text-orange-600' : 'text-gray-600'}`}>
              {charCount}
            </span>
            <span className="text-gray-500">/{maxChars}</span>
          </div>
        </div>

        {/* Image upload component */}
        <ImageUpload
          onImagesChange={onImagesChange}
          maxImages={4}
        />
      </div>
    </div>
  )
}