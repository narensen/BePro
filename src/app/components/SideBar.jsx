'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  Search,
  AtomIcon,
  MessageSquare,
  PlusCircle,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BarChart3,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import useUserStore from '../store/useUserStore';
import { supabase } from '../lib/supabase_client';
import { checkAdminAccess } from '../utils/adminUtils';

export default function SideBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const {
    user,
    username,
    setUserSession,
    setUsername,
    clearUserSession,
    totalUnreadCount,
  } = useUserStore();

  const [loading, setLoading] = useState(!user);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

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
    const checkAdmin = async () => {
      if (user) {
        try {
          const adminStatus = await checkAdminAccess(user);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      }
    };

    checkAdmin();
  }, [user]);

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
    { name: 'Codex', icon: AtomIcon, href: '/codex' },
    { name: 'Messages', icon: MessageSquare, href: '/message' },
    { name: 'Post', icon: PlusCircle, href: '/home/post' },
    ...(isAdmin ? [{ name: 'Stats', icon: BarChart3, href: '/stats' }] : []),
  ];

  const bottomItems = [
    { name: 'Settings', icon: Settings, href: '/settings' },
    { name: 'Profile', icon: User, href: `/${username}` },
  ];

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    clearUserSession();
    router.push('/');
  }, [clearUserSession, router]);

  const handleMobileNavClick = (href) => {
    router.push(href);
    setIsMobileOpen(false);
  };

  const handleProfileMenuClick = (href) => {
    router.push(href);
    setShowProfileMenu(false);
  };
  return (
    <>
      {/* Mobile Header with Deep Navy theme */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[100] bg-deep-navy border-b border-warm-beige/20 shadow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-black text-warm-beige">BePro</h1>
          </div>
          
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 bg-terracotta/20 backdrop-blur-sm rounded-full p-2 border border-terracotta/30 hover:bg-terracotta/30 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-terracotta to-muted-teal rounded-full flex items-center justify-center overflow-hidden border-2 border-warm-beige shadow-md">
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
                <svg className="w-4 h-4 text-warm-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Updated Mobile Profile Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-warm-beige/95 backdrop-blur-sm rounded-xl shadow-xl border border-deep-navy/20 py-2 z-50">
                  <button
                    onClick={() => handleProfileMenuClick(`/${username}`)}
                    className="w-full text-left px-4 py-3 text-deep-navy hover:bg-terracotta/10 transition-colors flex items-center space-x-3"
                  >
                    <User size={16} />
                    <span className="font-medium">Profile</span>
                  </button>
                  <button
                    onClick={() => handleProfileMenuClick('/settings')}
                    className="w-full text-left px-4 py-3 text-gray-900 hover:bg-gray-100/50 transition-colors flex items-center space-x-3"
                  >
                    <Settings size={16} />
                    <span className="font-medium">Settings</span>
                  </button>
                  <hr className="my-2 border-gray-200" />
                  <button
                    onClick={() => {
                      handleSignOut();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-3"
                  >
                    <LogOut size={16} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push('/auth')}
              className="bg-gray-900 text-amber-300 px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {}
      {/* Desktop Sidebar with Deep Navy theme */}
      <div className="hidden lg:flex h-screen font-sans bg-deep-navy backdrop-blur-sm border-r border-warm-beige/20 shadow-xl flex-col fixed z-[70] w-72 left-0 top-0">

      <div className="p-6 border-b border-warm-beige/20">
        <Link href="/home">
          <h1 className="font-black bg-gradient-to-r from-warm-beige to-terracotta bg-clip-text text-transparent cursor-pointer transition-all duration-300 text-3xl hover-lift">
            BePro
          </h1>
        </Link>
        <p className="text-sm text-warm-beige/70 font-medium mt-1">
          Learn smart. Build loud. Get hired.
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-terracotta/20 border-t-terracotta rounded-full animate-spin"></div>
        </div>
      ) : !user ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <button
            onClick={() => router.push('/')}
            className="text-center bg-terracotta text-white font-bold px-6 py-3 rounded-2xl shadow-md hover:bg-terracotta/90 hover-lift transition-all w-full"
          >
            Login
          </button>
        </div>
      ) : (
        <>
          <div className="p-4 border-b border-warm-beige/20">
            <div className="flex items-center gap-3 p-3 bg-terracotta/10 rounded-xl hover:bg-terracotta/15 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-r from-terracotta to-muted-teal rounded-full flex items-center justify-center overflow-hidden border-2 border-warm-beige shadow-md">
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
                <p className="font-bold text-warm-beige text-sm">
                  {username || 'User'}
                </p>
                <p className="text-warm-beige/70 text-xs">{user.email}</p>
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
                        className="absolute inset-0 rounded-3xl bg-terracotta shadow-md"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                    <div
                      className={`flex items-center gap-3 p-3 rounded-3xl font-semibold relative z-10 transition-all duration-200 hover-lift ${
                        isActive
                          ? 'text-white'
                          : 'text-warm-beige/70 hover:text-warm-beige hover:bg-terracotta/10'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.name}</span>
                      {item.name === 'Messages' && totalUnreadCount > 0 && (
                        <span className="ml-auto bg-muted-teal text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Navigation */}
          <div className="p-4 border-t border-warm-beige/20">
            <div className="space-y-1 cursor-pointer">
              {[...bottomItems,
                {
                  name: 'Logout',
                  icon: LogOut,
                  action: handleSignOut
                }].map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                const content = (
                  <div
                    className={`flex items-center gap-3 p-3 rounded-3xl font-semibold relative z-10 transition-all duration-200 hover-lift ${
                      isActive
                        ? 'text-white'
                        : 'text-warm-beige/70 hover:text-warm-beige hover:bg-terracotta/10'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                );

                return item.href ? (
                  <Link 
                    key={item.name} 
                    href={item.href} 
                    className="block relative"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 rounded-3xl bg-terracotta shadow-md"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                    {content}
                  </Link>
                ) : (
                  <button 
                    key={item.name} 
                    onClick={() => {
                      item.action();
                    }} 
                    className="block relative w-full text-left"
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>

     {}

     {}
     <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 border-t border-white/20 shadow-2xl pb-safe">
       <div className="flex items-center justify-around py-2 px-4">
         {[...navItems.slice(0, 4), { name: 'Profile', icon: User, href: `/${username}` }].map((item) => {
           const isActive = pathname === item.href;
           const Icon = item.icon;
           return (
             <button
               key={item.name}
               onClick={() => handleMobileNavClick(item.href)}
               className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 relative ${
                 isActive 
                   ? 'text-gray-900 scale-110'
                   : 'text-gray-700 hover:text-gray-900 active:scale-95'
               }`}
             >
               <div className="relative">
                 <Icon size={20} />
                 {item.name === 'Messages' && totalUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                    </span>
                  )}
               </div>
               <span className={`text-xs mt-1 font-medium transition-all duration-300 ${
                 isActive ? 'text-gray-900' : 'text-gray-700'
               }`}>
                 {item.name === 'Dashboard' ? 'Home' : item.name === 'Profile' ? 'Profile' : item.name}
               </span>
               {isActive && (
                 <motion.div
                   layoutId="mobile-active-indicator"
                   className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-900 rounded-full"
                   transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                 />
               )}
             </button>
           );
         })}
       </div>
     </div>
    </>
  );
}