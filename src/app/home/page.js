'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase_client'
import { useRouter } from 'next/navigation'
import SideBar from '../components/SideBar'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error fetching session:', error)
        setUser(null)
        setLoading(false)
        return
      }
      const session = data?.session
      if (!session) {
        router.push('/')
        return
      } else {
        setUser(session.user)
        setUsername(session.user.user_metadata?.username || 'User')
      }
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
      <div className="min-h-screen w-full bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 flex items-center justify-center">
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

    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono">
      <div className="fixed left-0 top-0 h-full z-30 w-72">
        <SideBar user={user} username={username} onSignOut={handleSignOut} />
      </div>
      <div className="ml-72">
        <header className="sticky top-0 z-20 border-gray-200/50 p-4">
        
          <div className="flex justify-end max-w-6xl">
            <div className="flex items-end gap-4">
              <div className="relative top-2 bg-gray-900 text-amber-300 px-4 py-2 rounded-xl font-bold shadow-lg">
  Pro Member
</div>

            </div>
          </div>
        </header>

        <main className="p-6 min-h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="text-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-gray-200 max-w-md mx-auto">
              <div className="text-6xl mb-6">👋</div>
              <h2 className="text-2xl font-black text-gray-900 mb-4">
                Welcome to Your Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                Your personalized experience is being prepared. Stay tuned for exciting features coming soon!
              </p>
              <div className="flex items-center justify-center gap-2 text-amber-500">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}