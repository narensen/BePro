'use client'

import { useEffect, useState } from 'react'
import useUserStore from '../store/useUserStore'
import { supabase } from '../lib/supabase_client'
import SideBar from '../components/SideBar'
import DashboardHeader from './components/DashboardHeader'
import CodexReport from './components/CodexReport'
import RecentNotifications from './components/RecentNotifications'
import QuickActions from './components/QuickActions'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const {
    user,
    username,
    setUserSession,
    setUsername,
    clearUserSession,
  } = useUserStore();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.email) {
        setLoading(false)
        return
      }

      try {
        const { data: profile, error } = await supabase
          .from('profile')
          .select('*')
          .eq('email', user.email)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
        } else {
          setUserProfile(profile)
          if (profile.username && !username) {
            setUsername(profile.username)
          }
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [user, username, setUsername])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Sign out error:', error)
    else location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono relative">
        <SideBar />
        <div className="desktop:ml-72 flex items-center justify-center min-h-screen container-mobile">
          <div className="text-center p-6">
            <div className="mobile:text-2xl text-2xl lg:text-4xl font-black mb-4 lg:mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent animate-pulse mt-16 lg:mt-0">
              BePro Dashboard
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-800 mt-4 mobile:text-sm text-sm lg:text-lg">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono overflow-x-hidden relative">
      <SideBar />

      <div className="transition-all duration-300 ease-in-out pb-20 lg:pb-0 desktop:ml-72">
        <main className="container-mobile p-4 sm:p-6 pt-16 lg:pt-4">
          <div className="max-w-6xl mx-auto">
            <DashboardHeader username={username || 'User'} />
            
            <CodexReport username={username} />
            
            {/* Enhanced mobile-responsive grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 mobile:gap-4 gap-6 lg:gap-8">
              <div className="lg:col-span-2 mobile:order-2 lg:order-1">
                <RecentNotifications username={username} userProfile={userProfile} />
              </div>
              <div className="space-y-6 lg:space-y-8 mobile:order-1 lg:order-2">
                <QuickActions />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
