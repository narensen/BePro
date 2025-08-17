'use client'

import { Plus, Search, AtomIcon, MessageSquare, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      icon: Plus,
      title: 'Create Post',
      description: 'Share your thoughts',
      href: '/home/post',
      gradient: 'from-gray-400 to-gray-200'
    },
    {
      icon: Search,
      title: 'Explore',
      description: 'Discover content',
      href: '/home/explore',
      gradient: 'from-gray-400 to-gray-200'
    },
    {
      icon: AtomIcon,
      title: 'Codex',
      description: 'Continue learning',
      href: '/codex',
      gradient: 'from-gray-400 to-gray-200'
    },
    {
      icon: MessageSquare,
      title: 'Messages',
      description: 'Chat with others',
      href: '/message',
      gradient: 'from-gray-400 to-gray-200'
    }
  ]

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 lg:p-8 shadow-xl border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
      </div>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.title}
              onClick={() => router.push(action.href)}
              className="group bg-gray-800/50 hover:bg-gray-800/70 rounded-xl p-4 lg:p-6 border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:scale-105"
            >
              <div className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r relative left-4 ${action.gradient} rounded-xl flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="flex items-center justify-center text-white" />
              </div>
              <h4 className="text-gray-300 font-bold text-sm lg:text-base mb-1">
                {action.title}
              </h4>
              <p className="text-gray-200/80 text-xs lg:text-sm">
                {action.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}