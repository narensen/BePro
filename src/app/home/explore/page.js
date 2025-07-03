'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase_client'
import { useRouter } from 'next/navigation'
import SideBar from '../../components/SideBar'

export default function Jobs() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [jobs, setJobs] = useState([])
  const [scraping, setScraping] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data?.session) {
        router.push('/')
        return
      }
      setUser(data.session.user)
      setUsername(data.session.user.user_metadata?.username || 'User')
      setLoading(false)
    }

    checkUser()
  }, [router])

  const handleSignOut = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Sign out error:', error)
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-black mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent animate-pulse">
            BePro
          </div>
          <div className="w-10 h-10 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400">
      <div className="fixed left-0 top-0 h-full z-30">
        <SideBar user={user} username={username} onSignOut={handleSignOut} />
      </div>
    </div>
  )
}
