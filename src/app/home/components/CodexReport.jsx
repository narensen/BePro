'use client'

import { useState, useEffect } from 'react'
import {CheckCircle, XCircle, Clock, TrendingUp, Calendar, Target, Flame } from 'lucide-react'
import { supabase } from '../../lib/supabase_client'

export default function CodexReport({ username }) {
  const [studyStatus, setStudyStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasRoadmap, setHasRoadmap] = useState(false)
  const [weeklyActivity, setWeeklyActivity] = useState([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [totalMissions, setTotalMissions] = useState(0)
  const [completedMissions, setCompletedMissions] = useState(0)

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
          setLoading(false)
          return
        }

        if (!codexData) {
          setStudyStatus('no_roadmap')
          setHasRoadmap(false)
          setLoading(false)
          return
        }

        setHasRoadmap(true)
        const roadmap = codexData.roadmap || {}
        const activeStatus = codexData.active_status || 0
        const totalMissionsCount = Object.keys(roadmap).length
        
        setTotalMissions(totalMissionsCount)
        setCompletedMissions(activeStatus)

        // Check study activity from session messages
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

        // Check each day for study activity
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

        // Calculate current streak (from today backwards)
        const reversedDays = [...last7Days].reverse()
        for (const day of reversedDays) {
          if (day.studied) {
            streak++
          } else {
            break
          }
        }

        setWeeklyActivity(last7Days)
        setCurrentStreak(streak)
        setStudyStatus(studiedToday ? 'studied' : 'not_studied')

      } catch (error) {
        console.error('Error checking study status:', error)
        setStudyStatus('error')
        setHasRoadmap(false)
      } finally {
        setLoading(false)
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
          title: 'Create Your Roadmap',
          message: 'Start your journey with the Codex',
          bgColor: 'from-blue-500/20 to-purple-500/20',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-300',
          iconColor: 'text-blue-400'
        }
      default:
        return {
          icon: XCircle,
          title: 'Unable to Load',
          message: 'Please try refreshing the page',
          bgColor: 'from-red-500/20 to-pink-500/20',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-300',
          iconColor: 'text-red-400'
        }
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 lg:p-8 shadow-xl border border-gray-700 mb-6 lg:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-500/20 rounded-xl">
          </div>
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
  const StatusIcon = config.icon

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 lg:p-8 shadow-xl border border-gray-700 mb-6 lg:mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-500/20 rounded-xl">
        </div>
        <h3 className="text-xl lg:text-2xl font-black text-amber-300">Codex Report</h3>
      </div>

      {hasRoadmap ? (
        <div className="space-y-6">
          {/* Progress Overview */}
          <div className={`bg-gradient-to-r ${config.bgColor} rounded-xl p-4 lg:p-6 border ${config.borderColor}`}>
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

            {/* Mission Progress Bar */}
            <div className="bg-black/20 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-300 font-bold text-sm">Mission Progress</span>
                <span className="text-amber-300 font-bold text-sm">
                  {completedMissions}/{totalMissions}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Weekly Calendar View */}
          <div className="bg-black/20 rounded-xl p-4 lg:p-6 border border-amber-400/30">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-amber-400" />
              <h4 className="text-lg font-black text-amber-300">This Week's Activity</h4>
              {currentStreak > 0 && (
                <div className="ml-auto flex items-center gap-2 bg-orange-500/20 px-3 py-1 rounded-full border border-orange-400/30">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-300 font-bold text-sm">{currentStreak} day streak</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {weeklyActivity.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-amber-200 mb-2 font-medium">
                    {day.dayName}
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    day.studied 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg transform scale-110' 
                      : 'bg-gray-700/50 text-gray-400 border border-gray-600'
                  }`}>
                    {day.studied ? '✓' : day.dayNumber}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-amber-200/80 text-sm">
                {weeklyActivity.filter(day => day.studied).length}/7 days active this week
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => window.location.href = '/codex'}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 py-3 lg:py-4 rounded-xl font-black text-base lg:text-lg hover:scale-105 transition-all duration-300 shadow-lg"
          >
            {studyStatus === 'studied' ? 'Continue Learning' : 'Start Today\'s Session'}
          </button>
        </div>
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
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 py-3 lg:py-4 rounded-xl font-black text-base lg:text-lg hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Create Your Roadmap
          </button>
        </div>
      )}
    </div>
  )
}