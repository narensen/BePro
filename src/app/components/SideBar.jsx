'use client'

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  User, 
  Users, 
  Bot, 
  MessageSquare, 
  Layout, 
  PlusCircle,
  Home,
  Settings,
  LogOut,
  MessageCircle,
  MessageCircleHeart,
  MessageCircleX
} from 'lucide-react';

export default function SideBar({ user, username, onSignOut }) {
  const pathname = usePathname();

  const navigationItems = [
    { name: 'Dashboard', icon: Home, href: '/home' },
    { name: 'Explore', icon: Search, href: '/home/explore' },
    { name: 'Profile', icon: User, href: '/profile' },  
    { name: 'Ada', icon: MessageCircleX, href: '/home/ada' },
    { name: 'Communities', icon: MessageSquare, href: '/home/communities' },
    { name: 'Post', icon: PlusCircle, href: '/home/post' },
  ];

  const bottomItems = [
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

  const buttonClass = `
    flex items-center gap-3 w-full rounded-3xl p-3 font-semibold mb-2
    transition-all duration-300 hover:bg-black/10 hover:text-gray-900 cursor-pointer group
    justify-start
  `;

  const activeButtonClass = `
    bg-gradient-to-r from-amber-400 to-yellow-400 
    text-gray-900 shadow-lg border border-amber-300/50 font-bold
  `;

  return (
    <div className="text-md font-mono h-screen bg-white/90 backdrop-blur-sm border-r border-gray-200/50 
      shadow-xl flex flex-col w-72">
      
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200/30">
        <Link href="/home">
          <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent cursor-pointer">
            BePro
          </h1>
        </Link>
        <p className="text-sm text-gray-600 font-medium mt-1">Learn smart. Build loud. Get hired.</p>
      </div>

      {user && (
        <div className="p-4 border-b border-gray-200/30">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-sm">{username}</p>
              <p className="text-gray-600 text-xs">{user.email}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation Items */}
      <div className="flex-1 p-4 overflow-y-auto">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <button
                  className={`
                    ${buttonClass} 
                    ${isActive ? activeButtonClass : 'hover:text-gray-700 text-gray-600'}
                  `}
                >
                  <Icon 
                    size={20} 
                    className={`
                      transition-colors duration-200
                      ${isActive ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-800'}
                    `}
                  />
                  <span className="font-medium">{item.name}</span>
                </button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200/30">
        <div className="space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <button
                  className={`
                    ${buttonClass} 
                    ${isActive ? activeButtonClass : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </button>
              </Link>
            );
          })}
          
          {/* Logout Button */}
          <button
            onClick={onSignOut}
            className={`
              ${buttonClass} 
              text-gray-600 hover:text-red-600 hover:bg-red-50/50
            `}
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        {/* Version Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 text-center">
            BePro
          </p>
        </div>
      </div>
    </div>
  );
}