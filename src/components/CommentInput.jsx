'use client'

import { useState } from 'react'
import { MessageSquarePlus, Image as ImageIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import ImageUpload from './ImageUpload'

const CommentInput = ({ 
  commentText, 
  setCommentText, 
  onSubmit, 
  placeholder = "Share your thoughts...",
  buttonText = "Post Comment"
}) => {
  const [images, setImages] = useState([])

  const handleSubmit = () => {
    if (!commentText.trim() && images.length === 0) return
    onSubmit(commentText, images)
    setCommentText('')
    setImages([])
  }

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200/50 hover:border-amber-300/50 transition-all duration-300 shadow-sm hover:shadow-md"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquarePlus size={18} className="text-amber-500" />
          <span className="font-semibold text-gray-700">Join the conversation</span>
        </div>

        <textarea
          className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm resize-none transition-all duration-300 hover:shadow-sm focus:shadow-md bg-white/90 backdrop-blur-sm"
          rows={3}
          placeholder={placeholder}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />

        {/* Image Upload */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700 font-medium text-sm">Add Images (optional)</span>
          </div>
          <ImageUpload
            currentImages={images}
            onImagesChange={setImages}
            maxImages={2}
            placeholder="Add images to your comment"
          />
        </div>

        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-xl font-bold hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-2 border-transparent hover:border-amber-300"
            disabled={!commentText.trim() && images.length === 0}
          >
            {buttonText}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default CommentInput