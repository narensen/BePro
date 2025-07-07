'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase_client'
import SideBar from '../../components/SideBar'
import { Loader2 } from 'lucide-react'
import useUserStore from '../../store/useUserStore'

const availableTags = [
  "Artificial Intelligence",
  "Machine Learning",
  "Data Science",
  "Web Development",
  "Cloud Computing",
  "DevOps & Infrastructure",
  "Cybersecurity",
  "Software Engineering",
  "UI/UX Design",
  "Product Development",
  "Entrepreneurship",
  "Operations Management",
  "Blockchain Technology",
  "Finance",
  "Healthcare IT"
]

export default function CreatePost() {
  const [content, setContent] = useState('')
  const [tags, setTags] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [username, setUsername] = useState('User')

  const router = useRouter()
  const { user, setUserSession } = useUserStore()

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
        .select('username')
        .eq('email', sessionUser.email)
        .single()

      if (profileError || !profile?.username) {
        console.error('Username not found in profile:', profileError)
        router.push('/profile/build')
        return
      }

      setUsername(profile.username)
    }

    getSessionAndUsername()
  }, [router, setUserSession])

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag))
    } else if (tags.length < 6) {
      setTags([...tags, tag])
    }
  }

  const submitPost = async () => {
    if (!content.trim() || tags.length === 0) {
      setError('Post content and at least one tag are required.')
      return
    }

    setSubmitting(true)
    setError('')

    const { error: postError } = await supabase.from('posts').insert([
      {
        username,
        content: content.trim(),
        tags,
        created_at: new Date().toISOString()
      }
    ])

    setSubmitting(false)

    if (postError) {
      console.error('Insert error:', postError)
      setError(`Post failed: ${postError.message}`)
    } else {
      router.push('/home/explore')
    }
  }

  return (
    <div className="flex">
      <div className="w-72 fixed top-0 left-0 h-full z-30">
        <SideBar onSignOut={() => supabase.auth.signOut()} />
      </div>

      <div className="flex-1 ml-72 min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 p-6">
        <div className="max-w-2xl mx-auto bg-white/90 rounded-xl shadow-xl p-6">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Create Post</h2>

          {error && <p className="text-red-600 font-medium mb-4">{error}</p>}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="Write your post content here..."
            className="w-full p-4 border-2 border-gray-300 rounded-xl mb-4 text-gray-800 focus:outline-none focus:border-gray-900"
          />

          <div className="mb-4">
            <p className="text-gray-700 font-semibold mb-2">Select Tags ({tags.length}/6):</p>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full border text-sm transition-all duration-200 font-medium ${
                    tags.includes(tag)
                      ? 'bg-gray-900 text-amber-300 border-gray-900'
                      : tags.length >= 6
                      ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                      : 'bg-white text-gray-800 border-gray-300 hover:border-gray-900'
                  }`}
                  disabled={!tags.includes(tag) && tags.length >= 6}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={submitPost}
            disabled={submitting}
            className={`w-full py-3 mt-2 rounded-xl font-bold text-lg flex items-center justify-center transition-all duration-300 ${
              submitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-900 text-amber-300 hover:scale-105 shadow-md hover:shadow-lg'
            }`}
          >
            {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Post'}
          </button>
        </div>
      </div>
    </div>
  )
}