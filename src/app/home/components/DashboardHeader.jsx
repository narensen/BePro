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
      <div className="lg:hidden mb-6 text-center">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your BePro dashboard</p>
      </div>
      
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 rounded-2xl p-6 lg:p-8 shadow-xl border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-amber-300 mb-2">
              Welcome back, {username}!
            </h2>
            <div className="flex items-center gap-2 text-amber-200">
              <Calendar size={16} />
              <span className="text-sm lg:text-base">{currentDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-xl border border-amber-500/30">
            <Target size={16} className="text-amber-300" />
            <span className="text-amber-300 font-bold text-sm lg:text-base">Pro Member</span>
          </div>
        </div>
      </div>
    </div>
  )
}