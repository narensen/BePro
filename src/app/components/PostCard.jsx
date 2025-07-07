'use client'

import {
  Heart,
  ThumbsDown,
  Repeat,
  Bookmark,
  ChevronDown,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase_client'

export default function PostCard({ post, user }) {
  const [showComments, setShowComments] = useState(false)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [comments, setComments] = useState([])

  useEffect(() => {
    const checkInteractions = async () => {
      const user_id = user.id
      const post_id = post.id

      const { data: likes } = await supabase
        .from('likes_dislikes')
        .select('type')
        .eq('post_id', post_id)
        .eq('user_id', user_id)
        .single()

      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('post_id', post_id)
        .eq('user_id', user_id)
        .maybeSingle()

      if (likes?.type === 'like') setLiked(true)
      if (likes?.type === 'dislike') setDisliked(true)
      if (bookmarks) setBookmarked(true)
    }

    checkInteractions()
  }, [post.id, user.id])

  const toggleLike = async () => {
    const { error } = await supabase.from('likes_dislikes').upsert({
      post_id: post.id,
      user_id: user.id,
      type: liked ? null : 'like',
    })
    if (!error) {
      setLiked(!liked)
      if (disliked) setDisliked(false)
    }
  }

  const toggleDislike = async () => {
    const { error } = await supabase.from('likes_dislikes').upsert({
      post_id: post.id,
      user_id: user.id,
      type: disliked ? null : 'dislike',
    })
    if (!error) {
      setDisliked(!disliked)
      if (liked) setLiked(false)
    }
  }

  const toggleBookmark = async () => {
    if (!bookmarked) {
      await supabase.from('bookmarks').insert({
        post_id: post.id,
        user_id: user.id,
      })
    } else {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user.id)
    }
    setBookmarked(!bookmarked)
  }

  const handleRepost = async () => {
    const { data, error } = await supabase
      .from('reposts')
      .insert({ post_id: post.id, user_id: user.id })

    if (error && error.code !== '23505') {
      console.error('Repost failed:', error.message)
    }
  }

  const toggleComments = async () => {
    if (!showComments) {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })

      if (!error) {
        setComments(data)
      }
    }
    setShowComments(!showComments)
  }

  return (
    <div className="bg-white/90 p-5 rounded-xl shadow-md">
      <div className="text-gray-700 text-sm mb-1 font-semibold">@{post.username}</div>
      <p className="text-gray-900 font-medium whitespace-pre-line">{post.content}</p>

      <div className="mt-4 flex items-center justify-between text-gray-600 text-sm">
        <div className="flex gap-4">
          <button
            className={`flex items-center gap-1 hover:text-red-600 transition ${liked ? 'text-red-600' : ''}`}
            onClick={toggleLike}
          >
            <Heart size={16} /> Like
          </button>
          <button
            className={`flex items-center gap-1 hover:text-blue-600 transition ${disliked ? 'text-blue-600' : ''}`}
            onClick={toggleDislike}
          >
            <ThumbsDown size={16} /> Dislike
          </button>
          <button
            className="flex items-center gap-1 hover:text-green-600 transition"
            onClick={handleRepost}
          >
            <Repeat size={16} /> Repost
          </button>
          <button
            className={`flex items-center gap-1 hover:text-yellow-600 transition ${bookmarked ? 'text-yellow-600' : ''}`}
            onClick={toggleBookmark}
          >
            <Bookmark size={16} /> Save
          </button>
        </div>
        <button onClick={toggleComments} className="hover:text-gray-800 transition">
          <ChevronDown size={18} />
        </button>
      </div>

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
