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
  { id: 'MOBILE_DEV', name: 'Mobile Development', category: 'Technology' },
  { id: 'CLOUD', name: 'Cloud Computing', category: 'Technology' },
  { id: 'CYBER', name: 'Cybersecurity', category: 'Technology' },
  { id: 'UI_UX', name: 'UI/UX Design', category: 'Technology' },
  { id: 'SOFTWARE_ENG', name: 'Software Engineering', category: 'Technology' },
  { id: 'MECH_ENG', name: 'Mechanical Engineering', category: 'Engineering' },
  { id: 'ELEC_ENG', name: 'Electrical Engineering', category: 'Engineering' },
  { id: 'CIVIL_ENG', name: 'Civil Engineering', category: 'Engineering' },
  { id: 'INDUSTRIAL_ENG', name: 'Industrial Engineering', category: 'Engineering' },
  { id: 'AERO_ENG', name: 'Aerospace Engineering', category: 'Engineering' },
  { id: 'BIOTECHNOLOGY', name: 'Biotechnology', category: 'Life Sciences' },
  { id: 'GENETICS', name: 'Genetics', category: 'Life Sciences' },
  { id: 'MEDICINE', name: 'Medicine', category: 'Life Sciences' },
  { id: 'BIOINFORMATICS', name: 'Bioinformatics', category: 'Life Sciences' },
  { id: 'NEUROSCIENCE', name: 'Neuroscience', category: 'Life Sciences' },
  { id: 'PUBLIC_HEALTH', name: 'Public Health', category: 'Life Sciences' },
  { id: 'HEALTHCARE_IT', name: 'Healthcare IT', category: 'Life Sciences' },
  { id: 'FINANCE', name: 'Finance', category: 'Business' },
  { id: 'BUSINESS_ANALYTICS', name: 'Business Analytics', category: 'Business' },
  { id: 'MANAGEMENT', name: 'Management', category: 'Business' },
  { id: 'MARKETING', name: 'Marketing', category: 'Business' },
  { id: 'OPERATIONS', name: 'Operations Management', category: 'Business' },
  { id: 'STATISTICS', name: 'Statistics', category: 'Mathematics' },
  { id: 'SUSTAINABILITY', name: 'Sustainability', category: 'Energy' },
  { id: 'RENEWABLE_ENERGY', name: 'Renewable Energy', category: 'Energy' },
  { id: 'CLIMATE_SCIENCE', name: 'Climate Science', category: 'Energy' },
  { id: 'SPACE_TECH', name: 'Space Technology', category: 'Emerging Tech' },
  { id: 'AUTONOMOUS_VEHICLES', name: 'Autonomous Vehicles', category: 'Emerging Tech' },
  { id: 'SMART_CITIES', name: 'Smart Cities', category: 'Emerging Tech' },
  { id: 'PRODUCT_DEV', name: 'Product Development', category: 'Research' },
  { id: 'INNOVATION', name: 'Innovation Management', category: 'Research' },
  { id: 'BLOCKCHAIN', name: 'Blockchain Technology', category: 'Technology' }
];

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
  const [isCollapsed, setIsCollapsed] = useState(false)

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
      {/* Mobile-First Sidebar */}
      <SideBar onCollapseChange={setIsCollapsed} />

      {/* Main Content - Mobile Optimized */}
      <div className={`transition-all duration-300 min-h-screen ${isCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200/50 p-3 lg:p-6 mt-16 lg:mt-0">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 lg:gap-3 mb-2 lg:mb-4">
              <div className="p-2 lg:p-3 bg-black/90 rounded-xl lg:rounded-2xl">
                <Sparkles className="w-6 h-6 lg:w-8 lg:h-8 text-amber-300" />
              </div>
              <h1 className="text-2xl lg:text-4xl font-black text-gray-900">Create Post</h1>
            </div>
            <p className="text-gray-800 text-sm lg:text-lg font-medium">Share your thoughts with the community</p>
          </div>
        </div>

        {/* Content Container */}
        <div className="px-3 lg:px-6 py-4 lg:py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-2xl p-4 lg:p-8">
              {error && (
                <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 font-medium text-center text-sm lg:text-base">{error}</p>
                </div>
              )}

              {/* Content Input */}
              <div className="mb-6 lg:mb-8">
                <div className="flex items-center gap-2 mb-3 lg:mb-4">
                  <Type className="w-4 h-4 lg:w-5 lg:h-5 text-gray-800" />
                  <span className="text-gray-900 font-bold text-base lg:text-lg">{"What's on your mind?"}</span>
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
                    <span className={`font-semibold ${charCount > MAX_CHARS * 0.8 ? 'text-orange-600' : 'text-gray-600'}`}>{charCount}</span>
                    <span className="text-gray-500">/{MAX_CHARS}</span>
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              <div className="mb-6 lg:mb-8">
                <div className="flex items-center gap-2 mb-3 lg:mb-4">
                  <Hash className="w-4 h-4 lg:w-5 lg:h-5 text-gray-800" />
                  <span className="text-gray-900 font-bold text-base lg:text-lg">Tags</span>
                  <span className="text-gray-600 text-sm font-semibold">({tags.length}/6)</span>
                </div>

                {/* Selected Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag) => (
                      <div key={tag} className="flex items-center gap-1 px-3 lg:px-4 py-2 bg-black text-amber-300 rounded-full text-xs lg:text-sm font-bold shadow-lg">
                        <span>{tag}</span>
                        <button onClick={() => removeTag(tag)} className="ml-1 hover:bg-white/20 rounded-full p-1 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tag Categories */}
                <div className="space-y-3 lg:space-y-4">
                  {Object.entries(groupedTags).map(([category, tagsInCategory]) => (
                    <div key={category}>
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex justify-between items-center px-3 lg:px-4 py-2 lg:py-3 bg-black text-amber-300 rounded-xl font-bold text-left shadow-md text-sm lg:text-base"
                      >
                        <span>{category}</span>
                        {expandedCategories.includes(category) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedCategories.includes(category) && (
                        <div className="mt-2 lg:mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
                          {tagsInCategory.map((tag) => (
                            <button
                              key={tag.id}
                              onClick={() => toggleTag(tag.name)}
                              className={`px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
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

              {/* Submit Button */}
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
                  <Loader2 className="animate-spin w-5 h-5 lg:w-6 lg:h-6" />
                ) : (
                  <>
                    <Send className="w-4 h-4 lg:w-5 lg:h-5" />
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