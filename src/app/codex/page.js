'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase_client'
import SideBar from '../components/SideBar'
import useUserStore from '../store/useUserStore'

export default function BeProAI() {
  const router = useRouter()
  const { user, username, clearUserSession } = useUserStore()

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data?.session) {
        clearUserSession()
        router.push('/')
      }
    }

    checkSession()
  }, [router, clearUserSession])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    clearUserSession()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono">
      <div className="fixed left-0 top-0 h-full z-30 w-72">
        <SideBar user={user} username={username} onSignOut={handleSignOut} />
      </div>

      <div className="min-h-screen pl-72 flex justify-center">
  <div className="sticky top-0 p-4 z-10">
    <h1 className="text-3xl font-black text-gray-900">
      Codex
    </h1>
  </div>
</div>


    </div>
  )
}
