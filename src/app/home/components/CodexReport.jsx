'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Calendar, Target, Flame } from 'lucide-react'
import { supabase } from '../../lib/supabase_client'
import useLoadingStore from '@/app/store/useLoadingStore'

export default function CodexReport({ username }) {
  const [studyStatus, setStudyStatus] = useState(null)
  const [loadingPage, setLoadingPage] = useState(true) // renamed to avoid clash with store
  const [hasRoadmap, setHasRoadmap] = useState(false)
  const [weeklyActivity, setWeeklyActivity] = useState([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [totalMissions, setTotalMissions] = useState(0)
  const [completedMissions, setCompletedMissions] = useState(0)

  const { loading } = useLoadingStore() // Zustand store state

  useEffect(() => {
    const checkStudyStatus = async () => {
      if (!username) return

      try {
        const { data: codexData, error } = await supabase
          .from('codex')
          .select('session, roadmap, active_status')
          .eq('username', username)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching Codex data:', error)
          setStudyStatus('no_roadmap')
          setHasRoadmap(false)
          setLoadingPage(false)
          return
        }

        if (!codexData) {
          setStudyStatus('no_roadmap')
          setHasRoadmap(false)
          setLoadingPage(false)
          return
        }

        setHasRoadmap(true)
        const roadmap = codexData.roadmap || {}
        const activeStatus = codexData.active_status || 0
        const totalMissionsCount = Object.keys(roadmap).length

        setTotalMissions(totalMissionsCount)
        setCompletedMissions(activeStatus)

        const session = codexData.session || {}
        const today = new Date()
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          return {
            date: date.toDateString(),
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNumber: date.getDate(),
            studied: false
          }
        }).reverse()

        let studiedToday = false
        let streak = 0

        last7Days.forEach(day => {
          Object.values(session).forEach(missionMessages => {
            if (Array.isArray(missionMessages)) {
              missionMessages.forEach(message => {
                if (message.timestamp) {
                  const messageDate = new Date(message.timestamp)
                  if (messageDate.toDateString() === day.date) {
                    day.studied = true
                    if (day.date === today.toDateString()) {
                      studiedToday = true
                    }
                  }
                }
              })
            }
          })
        })

        const reversedDays = [...last7Days].reverse()
        for (const day of reversedDays) {
          if (day.studied) streak++
          else break
        }

        setWeeklyActivity(last7Days)
        setCurrentStreak(streak)
        setStudyStatus(studiedToday ? 'studied' : 'not_studied')
      } catch (error) {
        console.error('Error checking study status:', error)
        setStudyStatus('error')
        setHasRoadmap(false)
      } finally {
        setLoadingPage(false)
      }
    }

    checkStudyStatus()
  }, [username])

  const getStatusConfig = () => {
    switch (studyStatus) {
      case 'studied':
        return {
          icon: CheckCircle,
          title: 'Great Work!',
          message: 'You\'ve engaged with your Codex today',
          bgColor: 'from-green-500/20 to-emerald-500/20',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-300',
          iconColor: 'text-green-400'
        }
      case 'not_studied':
        return {
          icon: Clock,
          title: 'Time to Study',
          message: 'Your Codex is waiting for you',
          bgColor: 'from-yellow-500/20 to-orange-500/20',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-300',
          iconColor: 'text-yellow-400'
        }
      case 'no_roadmap':
        return {
          icon: Target,
          title: 'Create Your Roadmap',
          message: 'Start your journey with the Codex',
          bgColor: 'from-yellow-400 via-amber-400 to-orange-400 focus:ring-0',
          borderColor: 'bg-black focus-none',
          textColor: '',
          iconColor: ''
        }
      default:
        return {
          icon: XCircle,
          title: 'Unable to Load',
          message: 'Please try refreshing the page',
          bgColor: 'from-yellow-400 via-amber-400 to-orange-400',
          borderColor: '',
          textColor: '',
          iconColor: ''
        }
    }
  }

  if (loadingPage) {
    return (
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 lg:p-8 shadow-xl border border-gray-700 mb-6 lg:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-500/20 rounded-xl"></div>
          <h3 className="text-xl lg:text-2xl font-black text-amber-300">Codex Report</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  const config = getStatusConfig()
  const StatusIcon = config.icon || XCircle

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 lg:p-8 shadow-xl border border-gray-700 mb-6 lg:mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-500/20 rounded-xl"></div>
        <h3 className="text-xl lg:text-2xl font-black text-amber-300">Codex Report</h3>
      </div>

      {hasRoadmap ? (
        /* ... existing hasRoadmap rendering ... */
        <div> {/* keep your original hasRoadmap content unchanged */} </div>
      ) : (
        <div>
          <div className={`bg-gradient-to-r ${config.bgColor} rounded-xl p-4 lg:p-6 border ${config.borderColor} mb-6`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-black/20 rounded-xl">
                <StatusIcon className={`w-8 h-8 ${config.iconColor}`} />
              </div>
              <div>
                <h4 className={`text-lg lg:text-xl font-black ${config.textColor}`}>
                  {config.title}
                </h4>
                <p className={`text-sm lg:text-base ${config.textColor}/80`}>
                  {config.message}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/codex'}
            disabled={loading}
            className={`w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 py-3 lg:py-4 rounded-xl font-black text-base lg:text-lg transition-all duration-300 shadow-lg 
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-gray-900"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Creating…
              </div>
            ) : (
              'Create Your Roadmap'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
