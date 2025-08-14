'use client'

import { Calendar, Target } from 'lucide-react'

export default function DashboardHeader({ username }) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="mb-6 lg:mb-8">
      <div className="lg:hidden mb-6 text-center mobile-fade-in">
        <h1 className="mobile:text-2xl text-3xl font-black text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600 mobile:text-sm">Welcome to your BePro dashboard</p>
      </div>
      
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 rounded-2xl p-6 lg:p-8 shadow-xl border border-gray-700 mobile-slide-up">
        <div className="flex mobile:flex-col flex-col lg:flex-row lg:items-center lg:justify-between mobile:gap-3 gap-4">
          <div>
            <h2 className="mobile:text-xl text-2xl lg:text-3xl font-black text-amber-300 mb-2">
              Welcome back, {username}!
            </h2>
            <div className="flex items-center gap-2 text-amber-200">
              <Calendar size={16} />
              <span className="mobile:text-xs text-sm lg:text-base">{currentDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-xl border border-amber-500/30 mobile:self-start lg:self-auto">
            <Target size={16} className="text-amber-300" />
            <span className="text-amber-300 font-bold mobile:text-xs text-sm lg:text-base">Pro Member</span>
          </div>
        </div>
      </div>
    </div>
  )
}