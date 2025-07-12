'use client'

import React, { useState } from 'react'
import {
  Heart,
  ThumbsDown,
  Repeat,
  Bookmark,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Eye,
} from 'lucide-react'
import {
  toggleLike,
  toggleDislike,
  toggleBookmark,
  submitComment,
  handleViewPost,
} from '../utils/postActions'

export default function PlainPost({
  post,
  userInteractions,
  onInteraction,
  onComment,
  onViewPost,
  userProfile,
  searchQuery,
  showRecommendationScore,
}) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])

  // Highlight for search
  function highlight(text, query) {
    if (!query) return text
    return text.split(new RegExp(`(${query})`, 'gi')).map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <span key={i} className="bg-yellow-200 text-orange-700">{part}</span>
        : part
    )
  }

  // Show comments
  const handleToggleComments = async () => {
    if (!showComments) {
      const fetched = await submitComment(post.id, userProfile?.id, null, true) // fetch only
      if (Array.isArray(fetched)) setComments(fetched)
    }
    setShowComments(!showComments)
  }

  return (
    <div className="bg-white/90 rounded-xl border border-white/30 p-5 mb-4 shadow hover:scale-105 transition-all">
      {/* User/Avatar */}
      <div className="flex items-center mb-2">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white/30 border border-orange-200 mr-2" />
        <div>
          <span className="font-bold text-orange-700">{post.username || 'user'}</span>
          <span className="ml-1 text-xs text-white/70">@{post.username || 'user'}</span>
        </div>
      </div>
      {/* Content */}
      <div className="text-lg text-orange-950 mb-2" style={{ wordBreak: 'break-word' }}>
        {highlight(post.content, searchQuery)}
      </div>
      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {post.tags.map(tag => (
            <span key={tag} className="bg-orange-200/60 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold">{tag}</span>
          ))}
        </div>
      )}
      {/* Actions */}
      <div className="flex items-center justify-between mt-4 text-xs text-white/90">
        <div className="flex gap-2">
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded-full hover:bg-orange-100 hover:text-orange-700 transition ${userInteractions?.[post.id]?.like ? 'bg-orange-200 text-orange-700 font-bold' : 'bg-white/10 text-white'}`}
            onClick={() => onInteraction('like', post.id, !!userInteractions?.[post.id]?.like)}
            aria-label="Like"
          >
            <Heart size={16} /> {post.like_count || 0}
          </button>
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded-full hover:bg-red-100 hover:text-red-600 transition ${userInteractions?.[post.id]?.dislike ? 'bg-red-200 text-red-700 font-bold' : 'bg-white/10 text-white'}`}
            onClick={() => onInteraction('dislike', post.id, !!userInteractions?.[post.id]?.dislike)}
            aria-label="Dislike"
          >
            <ThumbsDown size={16} /> {post.dislike_count || 0}
          </button>
          <button
            className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-green-100 hover:text-green-700 transition"
            onClick={() => onViewPost(post.id)}
            aria-label="View"
          >
            <Eye size={16} /> {post.view_count || 0}
          </button>
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded-full hover:bg-blue-100 hover:text-blue-700 transition ${userInteractions?.[post.id]?.bookmark ? 'bg-blue-200 text-blue-700 font-bold' : 'bg-white/10 text-white'}`}
            onClick={() => onInteraction('bookmark', post.id, !!userInteractions?.[post.id]?.bookmark)}
            aria-label="Bookmark"
          >
            <Bookmark size={16} />
          </button>
        </div>
        {/* Comments toggle */}
        <button onClick={handleToggleComments} className={`flex items-center gap-1 hover:text-orange-700 transition`}>
          <MessageCircle size={16} />
          <span>{post.comment_count || comments.length || 0}</span>
          {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
      {/* Recommendation score */}
      {showRecommendationScore && typeof post._recommendationScore === 'number' && (
        <div className="mt-2 text-xs text-orange-700 font-bold">Score: {post._recommendationScore.toFixed(2)}</div>
      )}
      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="text-sm text-gray-800 bg-gray-100 rounded-lg p-2">
                {comment.content}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}