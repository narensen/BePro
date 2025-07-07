'use client'

import SideBar from "@/app/components/SideBar"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/app/lib/supabase_client"
import useUserStore from "@/app/store/useUserStore"

export default function Community() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const {
    user,
    username,
    setUserSession,
    setUsername,
    clearUserSession
  } = useUserStore()

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data?.session) {
        clearUserSession()
        router.push('/')
        return
      }

      const session = data.session
      setUserSession(session.user)
      setUsername(session.user.user_metadata?.username || 'User')
      setLoading(false)
    }

    checkUser()
  }, [router, setUserSession, setUsername, clearUserSession])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    clearUserSession()
    router.push('/')
  }

  if (loading) return null

  return (
     <div className="flex-1 ml-72 min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400">
        <div className="max-w-2xl mx-auto px-6 py-8">
          
          <div className="mb-8 transform transition-all duration-700 opacity-0 translate-y-4" style={{ animation: 'fadeInUp 0.6s ease-out 0.1s both' }}>
            <h1 className="text-3xl font-bold text-white mb-2">Explore</h1>
            <p className="text-white/80">Discover posts from the community</p>
          </div>
          </div>

      <div className="fixed left-0 top-0 h-full z-30 w-72">
        <SideBar user={user} username={username} onSignOut={handleSignOut} />
      </div>
    </div>
  )
}
