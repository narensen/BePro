'use client'

import { useEffect, useState } from 'react'
import useUserStore from '../store/useUserStore'
import { supabase } from '../lib/supabase_client'
import SideBar from '../components/SideBar'
import DashboardHeader from './components/DashboardHeader'
import CodexReport from './components/CodexReport'
import RecentNotifications from './components/RecentNotifications'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const { user, username, setUsername } = useUserStore();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono relative">
        <SideBar />
        <div className="lg:ml-72 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-2xl lg:text-4xl font-black mb-4 lg:mb-6 animate-pulse">
              BePro Dashboard
            </div>
            <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-800 mt-4">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pl-72 bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono relative overflow-x-hidden flex">
      {/* Sidebar */}
      <SideBar />

      {/* Main content */}
      <div className={"transition-all duration-300 ease-in-out pb-20 lg:pb-0 flex-1 lg:mr-0"}>
        <main className="p-4 sm:p-6 pt-16 lg:pt-4">
          <div className="max-w-6xl mx-auto">
            <DashboardHeader username={username || 'User'} />

            {/* CodexReport + Notifications stacked */}
            <div className="max-w-3xl mx-auto space-y-10">
              <CodexReport username={username} />
              <RecentNotifications username={username} userProfile={userProfile} />
            </div>
          </div>
        </main>
      </div>

      {/* Profile Bar (slides in/out) */}
  
    </div>
  )
}
