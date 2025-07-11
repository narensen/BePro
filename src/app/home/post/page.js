'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase_client'
import SideBar from '../../components/SideBar'
import { Loader2, Hash, Type, Send, Sparkles, X, ChevronDown, ChevronUp } from 'lucide-react'
import useUserStore from '../../store/useUserStore'

const availableTags = [
  { id: 'AI', name: 'Artificial Intelligence', category: 'Technology' },
  { id: 'ML', name: 'Machine Learning', category: 'Technology' },
  { id: 'DS', name: 'Data Science', category: 'Technology' },
  { id: 'WEB_DEV', name: 'Web Development', category: 'Technology' },
  { id: 'FINANCE', name: 'Finance', category: 'Business' },
  { id: 'MARKETING', name: 'Marketing', category: 'Business' },
  { id: 'STATISTICS', name: 'Statistics', category: 'Mathematics' },
  { id: 'CLIMATE_SCIENCE', name: 'Climate Science', category: 'Energy' },
  { id: 'SPACE_TECH', name: 'Space Technology', category: 'Emerging Tech' },
  { id: 'PRODUCT_DEV', name: 'Product Development', category: 'Research' },
]

const groupedTags = availableTags.reduce((acc, tag) => {
  if (!acc[tag.category]) acc[tag.category] = []
  acc[tag.category].push(tag)
  return acc
}, {})

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
    <div className="flex">
      <div className="w-72 bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono fixed top-0 left-0 h-full z-30">
        <SideBar onSignOut={() => supabase.auth.signOut()} />
      </div>

      <div className="flex-1 ml-72 min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-black/90 rounded-2xl">
                <Sparkles className="w-8 h-8 text-amber-300" />
              </div>
              <h1 className="text-4xl font-black text-gray-900">Create Post</h1>
            </div>
            <p className="text-gray-800 text-lg font-medium">Share your thoughts with the community</p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 font-medium text-center">{error}</p>
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-5 h-5 text-gray-800" />
                <span className="text-gray-900 font-bold text-lg">What's on your mind?</span>
              </div>

              <div className="relative">
                <textarea
                  value={content}
                  onChange={handleContentChange}
                  rows={8}
                  placeholder="Share your insights, ask questions, or start a discussion..."
                  className="w-full p-6 border-2 border-gray-300 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-gray-900 resize-none font-medium"
                />
                <div className="absolute bottom-4 right-4 text-sm">
                  <span className={`font-semibold ${charCount > MAX_CHARS * 0.8 ? 'text-orange-600' : 'text-gray-600'}`}>{charCount}</span>
                  <span className="text-gray-500">/{MAX_CHARS}</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-5 h-5 text-gray-800" />
                <span className="text-gray-900 font-bold text-lg">Tags</span>
                <span className="text-gray-600 text-sm font-semibold">({tags.length}/6)</span>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag) => (
                    <div key={tag} className="flex items-center gap-1 px-4 py-2 bg-black text-amber-300 rounded-full text-sm font-bold shadow-lg">
                      <span>{tag}</span>
                      <button onClick={() => removeTag(tag)} className="ml-1 hover:bg-white/20 rounded-full p-1 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                {Object.entries(groupedTags).map(([category, tagsInCategory]) => (
                  <div key={category}>
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex justify-between items-center px-4 py-3 bg-black text-amber-300 rounded-xl font-bold text-left shadow-md"
                    >
                      <span>{category}</span>
                      {expandedCategories.includes(category) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {expandedCategories.includes(category) && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {tagsInCategory.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.name)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
                              tags.includes(tag.name)
                                ? 'bg-gray-900 text-amber-300 shadow-lg'
                                : tags.length >= 6
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-white text-gray-800 border-2 border-gray-300 hover:border-gray-900 shadow-sm'
                            }`}
                            disabled={!tags.includes(tag.name) && tags.length >= 6}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={submitPost}
              disabled={submitting || !content.trim() || tags.length === 0}
              className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                submitting || !content.trim() || tags.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-amber-300 hover:scale-105 shadow-lg'
              }`}
            >
              {submitting ? <Loader2 className="animate-spin w-6 h-6" /> : <><Send className="w-5 h-5" /><span>Share Post</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
