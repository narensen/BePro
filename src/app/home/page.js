'use client'

import { useEffect, useState } from 'react'
import useUserStore from '../store/useUserStore'
import { supabase } from '../lib/supabase_client'
import SideBar from '../components/SideBar'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const {
    user,
    username,
    setUserSession,
    setUsername,
    clearUserSession,
  } = useUserStore();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Sign out error:', error)
    else location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono overflow-x-hidden relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full z-40 w-72">
        <SideBar user={user} username={username} onSignOut={handleSignOut} />
      </div>

      {/* Mobile Sidebar */}
      <SideBar user={user} username={username} onSignOut={handleSignOut} />

      <div className="transition-all duration-300 ease-in-out pb-20 lg:pb-0 lg:ml-72">
        <header className="sticky top-0 z-30 border-gray-200/50 p-4 lg:pt-4 mt-16 lg:mt-0">
          <div className="flex justify-end max-w-6xl">
            <div className="flex items-end">
              {user && (
                <div className="relative top-4 left-4 sm:left-12 bg-gray-900 text-amber-300 px-3 sm:px-4 py-2 rounded-xl font-bold shadow-lg text-sm sm:text-base">
                  Pro Member
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 min-h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="text-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-12 shadow-xl border border-gray-200 max-w-md mx-auto mb-20">

              {user ? (
                <>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-4">
                    Welcome to Your Dashboard
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-6">
                    Your personalized experience is being prepared. Stay tuned for exciting features coming soon!
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-4">
                    Welcome to BePro
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-6">
                    Please log in to access your dashboard.
                  </p>
                </>
              )}

              <div className="flex items-center justify-center gap-2 text-amber-500 mt-6">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
