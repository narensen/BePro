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
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import useUserStore from '../store/useUserStore';
import { supabase } from '../lib/supabase_client';

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
  } = useUserStore();

  const [loading, setLoading] = useState(!user);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

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
  
  useEffect(() => {
    if (!username) return;

    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_username', username)
        .eq('is_read', false);

      if (error) {
        console.error('Error fetching unread message count:', error);
      } else {
        setUnreadCount(count ?? 0);
      }
    };

    fetchUnreadCount();

    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_username=eq.${username}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username]);

  const navItems = [
    { name: 'Dashboard', icon: Home, href: '/home' },
    { name: 'Explore', icon: Search, href: '/home/explore' },
    { name: 'Codex', icon: AtomIcon, href: '/codex' },
    { name: 'Messages', icon: MessageSquare, href: '/message' },
    { name: 'Post', icon: PlusCircle, href: '/home/post' },
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

      {/* Sidebar */}
      <div className="hidden lg:flex h-screen font-mono bg-white/90 backdrop-blur-sm border-r border-gray-200/50 shadow-xl flex-col fixed z-[70] w-72 left-0 top-0">

      <div className="p-6 border-b border-gray-200/30">
        <Link href="/home">
          <h1 className="font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent cursor-pointer transition-all duration-300 text-3xl">
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
            className="text-center bg-gradient-to-r from-gray-900 to-gray-800 text-amber-300 font-bold px-5 py-3 rounded-2xl shadow-md hover:scale-105 transition-all w-full"
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
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                    <div
                      className={`flex items-center gap-3 p-3 rounded-3xl font-semibold relative z-10 transition-all duration-200 ${
                        isActive
                          ? 'text-gray-900'
                          : 'text-gray-600 hover:text-gray-800 hover:scale-105'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.name}</span>
                      {item.name === 'Messages' && unreadCount > 0 && (
                        <span className="ml-auto flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Buttons */}
          <div className="p-4 border-t border-gray-200/30">
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
                    className={`flex items-center gap-3 p-3 rounded-3xl font-semibold relative z-10 transition-colors duration-300 ${
                      isActive
                        ? 'text-gray-900'
                        : 'text-gray-600 hover:text-gray-800'
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
                        className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-400 to-yellow-400 shadow-md"
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

     {/* Mobile Top Navigation Bar */}
     <div className="lg:hidden fixed top-0 left-0 right-0 z-[90] bg-transparent backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
       <div className="flex items-center justify-between py-3 px-4">
         {/* Logo */}
         <Link href="/home">
           <h1 className="text-2xl font-black text-gray-900">BePro</h1>
         </Link>
         
         {/* Profile Menu */}
         {user && (
           <div className="relative">
             <button
               onClick={() => setShowProfileMenu(!showProfileMenu)}
               className="flex items-center gap-2 p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:scale-105 transition-all duration-300"
             >
               <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center overflow-hidden">
                 {avatarUrl ? (
                   <img
                     src={avatarUrl}
                     alt={`${username}'s avatar`}
                     className="w-full h-full object-cover"
                   />
                 ) : (
                   <span className="text-white font-bold text-sm">
                     {username?.charAt(0).toUpperCase() || 'U'}
                   </span>
                 )}
               </div>
               <ChevronDown size={16} className={`transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
             </button>
             
             {/* Profile Dropdown */}
             {showProfileMenu && (
               <>
                 <div 
                   className="fixed inset-0 z-40"
                   onClick={() => setShowProfileMenu(false)}
                 />
                 <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 z-50">
                   <div className="p-3 border-b border-gray-200/30">
                     <p className="font-bold text-gray-900 text-sm">{username}</p>
                     <p className="text-gray-600 text-xs">{user.email}</p>
                   </div>
                   <div className="p-2">
                     <button
                       onClick={() => handleProfileMenuClick(`/${username}`)}
                       className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                     >
                       <User size={18} />
                       <span className="font-medium">Profile</span>
                     </button>
                     <button
                       onClick={() => handleProfileMenuClick('/settings')}
                       className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                     >
                       <Settings size={18} />
                       <span className="font-medium">Settings</span>
                     </button>
                     <button
                       onClick={() => {
                         handleSignOut();
                         setShowProfileMenu(false);
                       }}
                       className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors text-left"
                     >
                       <LogOut size={18} />
                       <span className="font-medium">Logout</span>
                     </button>
                   </div>
                 </div>
               </>
             )}
           </div>
         )}
       </div>
     </div>

     {/* Mobile Bottom Navigation Bar */}
     <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] bg-white/95 backdrop-blur-sm border-t border-gray-200/50 shadow-2xl">
       <div className="flex items-center justify-around py-2 px-4">
         {navItems.slice(0, 5).map((item) => {
           const isActive = pathname === item.href;
           const Icon = item.icon;
           return (
             <button
               key={item.name}
               onClick={() => handleMobileNavClick(item.href)}
               className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 relative ${
                 isActive 
                   ? 'text-amber-600 scale-110' 
                   : 'text-gray-600 hover:text-gray-800 active:scale-95'
               }`}
             >
               <div className="relative">
                 <Icon size={20} />
                 {item.name === 'Messages' && unreadCount > 0 && (
                   <span className="absolute -top-2 -right-2 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4">
                     {unreadCount > 9 ? '9+' : unreadCount}
                   </span>
                 )}
               </div>
               <span className={`text-xs mt-1 font-medium transition-all duration-300 ${
                 isActive ? 'text-amber-600' : 'text-gray-500'
               }`}>
                 {item.name === 'Dashboard' ? 'Home' : item.name}
               </span>
               {isActive && (
                 <motion.div
                   layoutId="mobile-active-indicator"
                   className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-amber-600 rounded-full"
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