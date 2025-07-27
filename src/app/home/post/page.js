'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase_client'
import SideBar from '../../components/SideBar'
import useUserStore from '../../store/useUserStore'

// Components
import PostHeader from './components/PostHeader'
import PostForm from './components/PostForm'
import TagSelector from './components/TagSelector'

export default function CreatePost() {
  const [content, setContent] = useState('')
  const [tags, setTags] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [username, setUsername] = useState('User')
  const [profileId, setProfileId] = useState(null)
  const [charCount, setCharCount] = useState(0)
  const [expandedCategories, setExpandedCategories] = useState([])

  const router = useRouter()
  const { user, setUserSession } = useUserStore()

  const MAX_CHARS = 1000

  useEffect(() => {
    const getSessionAndUsername = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data?.session) {
        router.push('/')
        return
      }
      const sessionUser = data.session.user
      setUserSession(sessionUser)

      const { data: profile, error: profileError } = await supabase
        .from('profile')
        .select('id, username')
        .eq('email', sessionUser.email)
        .single()

      if (profileError || !profile?.username) {
        router.push('/profile/build')
        return
      }

      setUsername(profile.username)
      setProfileId(profile.id)
    }

    getSessionAndUsername()
  }, [router, setUserSession])

  const handleContentChange = (e) => {
    const newContent = e.target.value
    if (newContent.length <= MAX_CHARS) {
      setContent(newContent)
      setCharCount(newContent.length)
    }
  }

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag))
    } else if (tags.length < 6) {
      setTags([...tags, tag])
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const toggleCategory = (category) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category))
    } else {
      setExpandedCategories([...expandedCategories, category])
    }
  }

  const submitPost = async () => {
    if (!content.trim() || tags.length === 0) {
      setError('Post content and at least one tag are required.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const postData = {
        content: content.trim(),
        tags,
        profile_id: profileId,
        username: username
      }

      const { data, error: postError } = await supabase
        .from('posts')
        .insert([postData])
        .select()

      if (postError) {
        setError(`Post failed: ${postError.message}`)
      } else {
        setContent('')
        setTags([])
        setCharCount(0)
        router.push('/home/explore')
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono relative">
      <SideBar />

      <div className="transition-all duration-300 ease-in-out min-h-screen pb-20 pt-16 lg:pt-0 lg:pb-0 lg:ml-72">
        <div className="px-3 lg:px-6 py-4 lg:py-8">
          <div className="max-w-3xl mx-auto">
            <PostHeader />
            
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-2xl p-4 lg:p-8">
              {error && (
                <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 font-medium text-center text-sm lg:text-base">{error}</p>
                </div>
              )}

              <PostForm
                content={content}
                handleContentChange={handleContentChange}
                charCount={charCount}
                maxChars={MAX_CHARS}
              />

              <TagSelector
                tags={tags}
                removeTag={removeTag}
                expandedCategories={expandedCategories}
                toggleCategory={toggleCategory}
                toggleTag={toggleTag}
              />

              <button
                onClick={submitPost}
                disabled={submitting || !content.trim() || tags.length === 0}
                className={`w-full py-3 lg:py-4 rounded-xl lg:rounded-2xl font-black text-base lg:text-lg flex items-center justify-center gap-2 lg:gap-3 transition-all ${
                  submitting || !content.trim() || tags.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-amber-300 hover:scale-105 shadow-lg'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 lg:w-6 lg:h-6 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin"></div>
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Share Post</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}