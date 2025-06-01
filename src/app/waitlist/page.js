'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase_client'

export default function WaitlistPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/signin')
      } else {
        setUser(session.user)
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/signin') // Redirect to signin after logout
  }

  if (loading) return <p className="text-center">Loading...</p>

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-100 p-10 text-center">
      <h1 className="font-bold font-mono text-3xl mb-4">
        Thank you for signing up for <span className="text-yellow-500">BePro</span>!
      </h1>
      <p className="mb-6 text-lg">The application will go live on <strong>August 1, 2025</strong>.</p>

      <button
        onClick={handleSignOut}
        className="bg-black text-yellow-300 px-4 py-2 rounded hover:bg-gray-900 transition-all"
      >
        Sign Out
      </button>
    </div>
  )
}
