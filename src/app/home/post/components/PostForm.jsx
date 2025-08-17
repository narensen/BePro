'use client'

import { Type } from 'lucide-react'

export default function PostForm({ content, handleContentChange, charCount, maxChars }) {
  return (
    <div className="mb-6 lg:mb-8">
      <div className="flex items-center gap-2 mb-3 lg:mb-4">
        <Type className="w-4 h-4 lg:w-5 lg:h-5 text-gray-800" />
        <span className="text-gray-900 font-bold text-base lg:text-lg">What's on your mind?</span>
      </div>

      <div className="relative">
        <textarea
          value={content}
          onChange={handleContentChange}
          rows={6}
          placeholder="Share your insights, ask questions, or start a discussion..."
          className="w-full p-4 lg:p-6 border-2 border-gray-300 rounded-xl lg:rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-gray-900 resize-none font-medium text-sm lg:text-base"
        />
        <div className="absolute bottom-3 lg:bottom-4 right-3 lg:right-4 text-xs lg:text-sm">
          <span className={`font-semibold ${charCount > maxChars * 0.8 ? 'text-gray-600' : 'text-gray-600'}`}>
            {charCount}
          </span>
          <span className="text-gray-500">/{maxChars}</span>
        </div>
      </div>
    </div>
  )
}