'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  Search,
  Bookmark,
  MessageSquare,
  PlusCircle,
  Settings,
  BookAIcon,
  NewspaperIcon,
  User,
  LogOut,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import useUserStore from '../store/useUserStore';
import { supabase } from '../lib/supabase_client';

export default function SideBar() {
  const pathname = usePathname();
  const router = useRouter();

  const {
    user,
    username,
    setUserSession,
    setUsername,
    clearUserSession,
  } = useUserStore();

  const [loading, setLoading] = useState(!user);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      if (!user) {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          setUserSession(data.session.user);
        }
      }
      setLoading(false);
    };
    checkSession();
  }, [user, setUserSession]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.email) return;

      const { data, error } = await supabase
        .from('profile')
        .select('username, avatar_url')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
      } else if (data) {
      
        setUsername(data.username || '');
        setAvatarUrl(data.avatar_url || '');
      }
    };

    fetchUserProfile();
  }, [user, setUsername]);

  const navItems = [
    { name: 'Dashboard', icon: Home, href: '/home' },
    { name: 'Explore', icon: Search, href: '/home/explore' },
    { name: 'Ada', icon: BookAIcon, href: '/home/ada' },
    { name: 'News', icon: NewspaperIcon, href: '/home/news' },
    { name: 'Communities', icon: MessageSquare, href: '/home/communities' },
    { name: 'Post', icon: PlusCircle, href: '/home/post' },
  ];

  const bottomItems = [
    { name: 'Settings', icon: Settings, href: '/settings' },
    { name: 'Profile', icon: User, href: `/${username}` },
  ];

  return (
    <div className="h-screen w-72 font-mono bg-white/90 backdrop-blur-sm border-r border-gray-200/50 shadow-xl flex flex-col relative">
      <div className="p-6 border-b border-gray-200/30">
        <Link href="/home">
          <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent cursor-pointer">
            BePro
          </h1>
        </Link>
        <p className="text-sm text-gray-600 font-medium mt-1">
          Learn smart. Build loud. Get hired.
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
      ) : !user ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <button
            onClick={() => router.push('/')}
            className="w-full text-center bg-gradient-to-r from-gray-900 to-gray-800 text-amber-300 font-bold px-5 py-3 rounded-2xl shadow-md hover:scale-105 transition-all"
          >
            Login
          </button>
        </div>
      ) : (
        <>
          <div className="p-4 border-b border-gray-200/30">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${username}'s avatar`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
                {avatarUrl && (
                  <span
                    className="text-white font-bold text-sm hidden items-center justify-center w-full h-full"
                    style={{ display: 'none' }}
                  >
                    {username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm">
                  {username || 'User'}
                </p>
                <p className="text-gray-600 text-xs">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 relative p-4 overflow-y-auto">
            <nav className="space-y-1 relative">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    href={item.href}
                    key={item.name}
                    className="block relative"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-400 to-yellow-400 shadow-md"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <div
                      className={`flex items-center gap-3 p-3 rounded-3xl font-semibold relative z-10 ${
                        isActive
                          ? 'text-gray-900'
                          : 'text-gray-600 hover:text-gray-800 hover:scale-105 transition-all duration-200'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Buttons */}
          <div className="p-4 border-t border-gray-200/30 cursor-pointer">
            <div className="space-y-1 cursor-pointer">
              {[...bottomItems,
                {
                  name: 'Logout',
                  icon: LogOut,
                  action: async () => {
                    await supabase.auth.signOut();
                    clearUserSession();
                    router.push('/');
                  }
                }].map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                const content = (
                  <div
                    className={`flex items-center gap-3 p-3 rounded-3xl font-semibold relative z-10 ${
                      isActive
                        ? 'text-gray-900'
                        : 'text-gray-600 hover:text-gray-800 transition-colors duration-300'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                );

                return item.href ? (
                  <Link key={item.name} href={item.href} className="block relative">
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-400 to-yellow-400 shadow-md"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    {content}
                  </Link>
                ) : (
                  <button key={item.name} onClick={item.action} className="block relative w-full text-left">
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}