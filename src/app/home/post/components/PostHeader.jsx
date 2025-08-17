'use client'

import { Sparkles } from 'lucide-react'

export default function PostHeader() {
  return (
    <div className="lg:hidden mb-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="p-2 bg-black/90 rounded-xl">
          <Sparkles className="w-6 h-6 text-gray-300" />
        </div>
        <h1 className="text-3xl font-black text-gray-900">Create Post</h1>
      </div>
      <p className="text-gray-600">Share your thoughts with the community</p>
    </div>
  )
}