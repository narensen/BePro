'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Code2, 
  Calendar,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

import useUserStore from '../store/useUserStore';
import { checkAdminAccess } from '../utils/adminUtils';
import SideBar from '../components/SideBar';
import StatCard from '../components/admin/StatCard';
import TimeBasedStats from '../components/admin/TimeBasedStats';
import TopPerformers from '../components/admin/TopPerformers';

export default function AdminStatsPage() {
  const router = useRouter();
  const { user } = useUserStore();
  
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Check admin access on component mount
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        router.push('/auth');
        return;
      }

      try {
        const hasAccess = await checkAdminAccess(user);
        if (!hasAccess) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setIsAdmin(true);
        await fetchStatistics();
      } catch (error) {
        console.error('Error checking admin access:', error);
        setError('Failed to verify admin access');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, router]);

  const fetchStatistics = async () => {
    try {
      setError('');
      const response = await fetch('/api/stats', {
        headers: {
          'x-user-email': user?.email || '',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStatistics(data);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError(error.message);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchStatistics();
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono relative">
        <SideBar />
        <div className="lg:ml-72 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-gray-900 animate-spin mx-auto mb-4" />
            <div className="text-2xl lg:text-4xl font-black mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Loading Admin Dashboard
            </div>
            <p className="text-gray-800 text-sm lg:text-lg">Verifying access and fetching statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono relative">
        <SideBar />
        <div className="lg:ml-72 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200/50 max-w-md mx-4"
          >
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-gray-900 mb-4">Access Restricted</h1>
            <p className="text-gray-600 mb-6">
              This page is only accessible to users with admin privileges. 
              Please contact an administrator if you believe this is an error.
            </p>
            <button
              onClick={() => router.push('/home')}
              className="bg-gradient-to-r from-gray-900 to-gray-800 text-amber-300 font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
            >
              Return to Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono relative">
        <SideBar />
        <div className="lg:ml-72 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200/50 max-w-md mx-4"
          >
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-gray-900 mb-4">Error Loading Statistics</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex space-x-4">
              <button
                onClick={handleRefresh}
                className="bg-gradient-to-r from-gray-900 to-gray-800 text-amber-300 font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
              <button
                onClick={() => router.push('/home')}
                className="bg-gray-200 text-gray-800 font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
              >
                Go Back
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono overflow-x-hidden relative">
      <SideBar />

      <div className="transition-all duration-300 ease-in-out pb-20 lg:pb-0 lg:ml-72">
        <main className="p-4 sm:p-6 pt-16 lg:pt-4">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-2">
                    Admin Statistics Dashboard
                  </h1>
                  <p className="text-gray-700 font-semibold">
                    Comprehensive analytics and insights for BePro platform
                  </p>
                </div>
                <div className="mt-4 lg:mt-0 flex items-center space-x-4">
                  {lastUpdated && (
                    <div className="text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                      Last updated: {lastUpdated}
                    </div>
                  )}
                  <button
                    onClick={handleRefresh}
                    className="bg-white/80 backdrop-blur-sm text-gray-900 font-bold px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {statistics && (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Total Users"
                    value={statistics.users?.total}
                    subtitle="Registered accounts"
                    icon={Users}
                    color="from-blue-400 to-cyan-400"
                    delay={0}
                  />
                  <StatCard
                    title="Total Posts"
                    value={statistics.posts?.total}
                    subtitle="Content created"
                    icon={FileText}
                    color="from-green-400 to-emerald-400"
                    delay={1}
                  />
                  <StatCard
                    title="Total Codex Projects"
                    value={statistics.codex?.total}
                    subtitle="AI roadmaps created"
                    icon={Code2}
                    color="from-purple-400 to-violet-400"
                    delay={2}
                  />
                  <StatCard
                    title="Weekly Active Users"
                    value={statistics.users?.wau}
                    subtitle="Active in past 7 days"
                    icon={Calendar}
                    color="from-orange-400 to-red-400"
                    delay={3}
                  />
                </div>

                {/* Time-based Statistics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  <TimeBasedStats
                    title="Codex Projects Created"
                    data={statistics.codex}
                    icon={Code2}
                    color="from-purple-400 to-violet-400"
                  />
                  <TimeBasedStats
                    title="New User Registrations"
                    data={statistics.users?.registrations}
                    icon={Users}
                    color="from-blue-400 to-cyan-400"
                  />
                  <TimeBasedStats
                    title="Posts Published"
                    data={statistics.posts?.timeStats}
                    icon={FileText}
                    color="from-green-400 to-emerald-400"
                  />
                </div>

                {/* Top Performers */}
                <div className="mb-8">
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3"
                  >
                    <BarChart3 className="w-6 h-6" />
                    <span>Top Performers</span>
                  </motion.h2>
                  
                  <TopPerformers
                    followedUser={statistics.posts?.highestFollowedUser}
                    likedPost={statistics.posts?.highestLikedPost}
                  />
                </div>

              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}