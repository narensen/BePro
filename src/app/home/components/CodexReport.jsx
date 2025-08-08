'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { CheckCircle, XCircle, Clock, Calendar, Target, Flame, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase_client'
import useLoadingStore from '@/app/store/useLoadingStore'

export default function CodexReport({ username }) {
  const [studyStatus, setStudyStatus] = useState(null)
  const [loadingPage, setLoadingPage] = useState(true)
  const [hasRoadmap, setHasRoadmap] = useState(false)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [totalMissions, setTotalMissions] = useState(0)
  const [completedMissions, setCompletedMissions] = useState(0)
  const [activityData, setActivityData] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredCell, setHoveredCell] = useState(null)
  const [rotateX, setRotateX] = useState(25)
  const [rotateY, setRotateY] = useState(0)
  const [rotateZ, setRotateZ] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [availableYears, setAvailableYears] = useState([])
  const [animationPhase, setAnimationPhase] = useState(0)
  const heatmapRef = useRef(null)
  const animationRef = useRef(null)

  const { loading } = useLoadingStore()

  // Animate the visualization - moved to top level from inside useMemo
  useEffect(() => {
    const animate = () => {
      setAnimationPhase(prev => (prev + 0.005) % (Math.PI * 2))
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, []) // Empty dependency array to run only once on mount

  // Process activity data from session data
  const processActivityData = (session) => {
    const activityMap = {}
    
    Object.values(session).forEach(missionMessages => {
      if (Array.isArray(missionMessages)) {
        missionMessages.forEach(message => {
          if (message.timestamp) {
            const date = new Date(message.timestamp).toISOString().split('T')[0]
            activityMap[date] = (activityMap[date] || 0) + 1
          }
        })
      }
    })

    // Get all years from the activity data
    const years = new Set()
    Object.keys(activityMap).forEach(date => {
      const year = new Date(date).getFullYear()
      years.add(year)
    })
    
    // Ensure current year is always included
    years.add(new Date().getFullYear())
    setAvailableYears(Array.from(years).sort((a, b) => b - a)) // Sort years descending

    return Object.entries(activityMap).map(([date, count]) => ({ date, count }))
  }

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
        
        // Process activity data for heatmap
        const processedActivityData = processActivityData(session)
        setActivityData(processedActivityData)

        // Calculate streak and today's status
        const today = new Date()
        let studiedToday = false
        let streak = 0

        // Check if studied today
        Object.values(session).forEach(missionMessages => {
          if (Array.isArray(missionMessages)) {
            missionMessages.forEach(message => {
              if (message.timestamp) {
                const messageDate = new Date(message.timestamp)
                if (messageDate.toDateString() === today.toDateString()) {
                  studiedToday = true
                }
              }
            })
          }
        })

        // Calculate streak (simplified)
        const dates = Array.from({length: 30}, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - i)
          return d.toDateString()
        })

        for (const dateStr of dates) {
          let studiedOnDate = false
          Object.values(session).forEach(missionMessages => {
            if (Array.isArray(missionMessages)) {
              missionMessages.forEach(message => {
                if (message.timestamp) {
                  const messageDate = new Date(message.timestamp)
                  if (messageDate.toDateString() === dateStr) {
                    studiedOnDate = true
                  }
                }
              })
            }
          })
          if (studiedOnDate) streak++
          else break
        }

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
          bgColor: '',
          borderColor: 'focus:ring-0',
          iconColor: ''
        }
      case 'not_studied':
        return {
          icon: Clock,
          bgColor: 'from-yellow-500/20 to-orange-500/20',
          borderColor: 'border-yellow-500/30',
          iconColor: 'text-yellow-400'
        }
      case 'no_roadmap':
        return {
          icon: Target,
          bgColor: 'from-yellow-400 via-amber-400 to-orange-400',
          borderColor: 'border-gray-700',
          iconColor: 'text-gray-900'
        }
      default:
        return {
          icon: XCircle,
          bgColor: 'from-red-500/20 to-red-600/20',
          borderColor: 'border-red-500/30',
          iconColor: 'text-red-400'
        }
    }
  }

// Enhanced Activity Heatmap - GitHub style (replace the existing ActivityHeatmap useMemo)
const ActivityHeatmap = useMemo(() => {
  if (!activityData.length) return null

  const activityMap = {}
  activityData.forEach(({ date, count }) => {
    activityMap[date] = count
  })

  // Generate all weeks for the selected year
  const startDate = new Date(selectedYear, 0, 1)
  const endDate = new Date(selectedYear, 11, 31)
  
  // Find the first Sunday of the year (or before)
  const firstSunday = new Date(startDate)
  firstSunday.setDate(startDate.getDate() - startDate.getDay())
  
  // Find the last Saturday of the year (or after)
  const lastSaturday = new Date(endDate)
  lastSaturday.setDate(endDate.getDate() + (6 - endDate.getDay()))

  const weeks = []
  let currentDate = new Date(firstSunday)
  
  while (currentDate <= lastSaturday) {
    const week = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    weeks.push(week)
  }

  const getIntensityColor = (count) => {
    if (!count || count <= 0) return "bg-gray-800"
    if (count <= 4) return "bg-amber-100"
    if (count <= 9) return "bg-amber-300"
    if (count <= 14) return "bg-amber-400"
    if (count <= 19) return "bg-amber-500"
    return "bg-amber-600"
  }

  const getIntensityLevel = (count) => {
    if (!count || count <= 0) return 0
    if (count <= 4) return 1
    if (count <= 9) return 2
    if (count <= 14) return 3
    if (count <= 19) return 4
    return 5
  }

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const handleCellHover = (date, count, event) => {
    const rect = event.target.getBoundingClientRect()
    setHoveredCell({
      date,
      count,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })
  }

  const handleCellLeave = () => {
    setHoveredCell(null)
  }

  // Navigation functions
  const navigateYear = (direction) => {
    const currentIndex = availableYears.indexOf(selectedYear)
    if (direction === 'next' && currentIndex > 0) {
      setSelectedYear(availableYears[currentIndex - 1])
    } else if (direction === 'prev' && currentIndex < availableYears.length - 1) {
      setSelectedYear(availableYears[currentIndex + 1])
    }
  }

  // Month labels
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  // Calculate which weeks correspond to each month
  const getMonthPositions = () => {
    const positions = []
    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(selectedYear, month, 1)
      const weekIndex = Math.floor((firstDay.getTime() - firstSunday.getTime()) / (7 * 24 * 60 * 60 * 1000))
      positions.push({ month, weekIndex, label: monthLabels[month] })
    }
    return positions
  }

  const monthPositions = getMonthPositions()

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          <h4 className="text-xl font-bold text-amber-300">Activity Timeline</h4>
        </div>
        
        {/* Year Navigation */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigateYear('prev')}
            disabled={availableYears.indexOf(selectedYear) >= availableYears.length - 1}
            className="p-1 rounded-full bg-gray-700 hover:bg-amber-500/20 text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          
          <h3 className="text-lg font-bold text-amber-300 min-w-[4rem] text-center">
            {selectedYear}
          </h3>
          
          <button 
            onClick={() => navigateYear('next')}
            disabled={availableYears.indexOf(selectedYear) <= 0}
            className="p-1 rounded-full bg-gray-700 hover:bg-amber-500/20 text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Heatmap Container */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Month Labels */}
          <div className="flex mb-2 ml-8">
            {monthPositions.map(({ month, weekIndex, label }, index) => {
              // Only show label if there's enough space and it's not overlapping
              const nextPosition = monthPositions[index + 1]
              const hasSpace = !nextPosition || (nextPosition.weekIndex - weekIndex) >= 4
              
              return (
                <div
                  key={month}
                  className="text-xs text-amber-200/70"
                  style={{
                    position: 'absolute',
                    left: `${32 + weekIndex * 12}px`,
                    display: hasSpace ? 'block' : 'none'
                  }}
                >
                  {label}
                </div>
              )
            })}
          </div>

          {/* Days of Week Labels + Heatmap Grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] mr-2 mt-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div 
                  key={day} 
                  className="h-3 flex items-center text-xs text-amber-200/50"
                  style={{ opacity: index % 2 === 1 ? 1 : 0 }} // Only show Mon, Wed, Fri
                >
                  {index % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-[2px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[2px]">
                  {week.map((date, dayIndex) => {
                    const dateStr = date.toISOString().split('T')[0]
                    const count = activityMap[dateStr] || 0
                    const isCurrentYear = date.getFullYear() === selectedYear
                    const isToday = dateStr === todayStr
                    const intensityColor = getIntensityColor(count)
                    const intensityLevel = getIntensityLevel(count)

                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`w-3 h-3 rounded-sm transition-all duration-200 cursor-pointer ${intensityColor} ${
                          !isCurrentYear ? 'opacity-30' : ''
                        } ${
                          isToday ? 'ring-2 ring-amber-400 ring-opacity-60' : ''
                        } hover:ring-2 hover:ring-amber-300 hover:ring-opacity-40`}
                        onMouseEnter={(e) => isCurrentYear && handleCellHover(date, count, e)}
                        onMouseLeave={handleCellLeave}
                        style={{
                          opacity: isCurrentYear ? (0.4 + intensityLevel * 0.12) : 0.1
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-xs text-amber-200/50">
              <span>Less</span>
              <div className="flex gap-[2px]">
                {[0, 1, 5, 10, 15, 20].map((level) => (
                  <div
                    key={level}
                    className={`w-3 h-3 rounded-sm ${getIntensityColor(level)}`}
                    style={{ opacity: 0.4 + getIntensityLevel(level) * 0.12 }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredCell && (
        <div 
          className="fixed z-50 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm pointer-events-none shadow-xl"
          style={{
            left: hoveredCell.x,
            top: hoveredCell.y,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="text-amber-200 font-medium">
            {hoveredCell.count} contributions
          </div>
          <div className="text-amber-200/70 text-xs">
            {new Date(hoveredCell.date).toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
        </div>
      )}

      {/* Year Selection Tabs */}
      {availableYears.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mt-6 pt-4 border-t border-gray-700/50">
          {availableYears.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1 text-sm rounded-md transition-all ${
                selectedYear === year 
                  ? 'bg-amber-500 text-gray-900 font-bold shadow-md' 
                  : 'bg-gray-700/50 text-amber-200/70 hover:bg-gray-700 hover:text-amber-200'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}, [activityData, availableYears, selectedYear, hoveredCell])

  if (loadingPage) {
    return (
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 lg:p-8 shadow-xl border border-gray-700 mb-6 lg:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-500/20 rounded-xl animate-pulse"></div>
          <h3 className="text-xl lg:text-2xl font-black text-amber-300">Codex Report</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-40 bg-gray-700 rounded"></div>
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
        <div className="text-xs text-amber-200/50 ml-auto">@{username}</div>
      </div>

      {hasRoadmap ? (
        <div className="space-y-6">
          {/* Stats Grid with 3D effect */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 perspective-800">
            <div 
              className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 transition-all duration-300 hover:shadow-xl"
              style={{ 
                transform: 'translateZ(10px) rotateX(5deg)',
                transformStyle: 'preserve-3d',
                boxShadow: '0 8px 16px -8px rgba(0, 0, 0, 0.4), 0 0 8px rgba(251, 191, 36, 0.1)'
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-gray-400">Current Streak</span>
              </div>
              <div className="text-2xl font-bold text-orange-300">{currentStreak} days</div>
            </div>
            
            <div 
              className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 transition-all duration-300 hover:shadow-xl"
              style={{ 
                transform: 'translateZ(10px) rotateX(5deg)',
                transformStyle: 'preserve-3d',
                boxShadow: '0 8px 16px -8px rgba(0, 0, 0, 0.4), 0 0 8px rgba(79, 209, 197, 0.1)'
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-400">Progress</span>
              </div>
              <div className="text-2xl font-bold text-blue-300">
                {totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0}%
              </div>
            </div>
            
            <div 
              className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 col-span-2 lg:col-span-1 transition-all duration-300 hover:shadow-xl"
              style={{ 
                transform: 'translateZ(10px) rotateX(5deg)',
                transformStyle: 'preserve-3d',
                boxShadow: '0 8px 16px -8px rgba(0, 0, 0, 0.4), 0 0 8px rgba(74, 222, 128, 0.1)'
              }}
            >
              <div className="text-2xl font-bold text-green-300">
                {completedMissions}/{totalMissions}
              </div>
            </div>
          </div>


          {/* Enhanced 3D Year-by-Year Activity Heatmap */}
          {ActivityHeatmap}
        </div>
      ) : (
        <div>
          <div className={`bg-gradient-to-r ${config.bgColor} rounded-xl p-4 lg:p-6 border ${config.borderColor} mb-6 flex justify-center`}>
            <StatusIcon className={`w-12 h-12 ${config.iconColor}`} />
          </div>

          <button
            onClick={() => window.location.href = '/codex'}
            disabled={loading}
            className={`w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 py-3 lg:py-4 rounded-xl font-black text-base lg:text-lg transition-all duration-300 shadow-lg 
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl'}`}
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