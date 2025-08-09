import { motion } from 'framer-motion';
import { Trophy, Heart } from 'lucide-react';

export default function TopPerformers({ followedUser, likedPost }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Highest Followed User */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400">
            <Trophy className="w-6 h-6 text-gray-900" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Most Followed User</h3>
        </div>
        
        <div className="space-y-3">
          <div className="text-center p-4 bg-gray-50/50 rounded-xl border border-gray-100">
            <div className="text-2xl font-black text-gray-900 mb-1">
              @{followedUser?.username || 'N/A'}
            </div>
            <div className="text-lg font-bold text-purple-600">
              {followedUser?.followerCount?.toLocaleString() || 0} followers
            </div>
          </div>
        </div>
      </motion.div>

      {/* Highest Liked Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-rose-400 to-red-400">
            <Heart className="w-6 h-6 text-gray-900" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Top Performing Post</h3>
        </div>
        
        <div className="space-y-3">
          <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
            <div className="text-lg font-bold text-gray-900 mb-2">
              @{likedPost?.username || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 mb-3 line-clamp-3">
              {likedPost?.content || 'No content available'}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-semibold">
                {likedPost?.type === 'views' ? 'Views' : 'Engagement'}
              </span>
              <span className="text-lg font-bold text-rose-600">
                {likedPost?.metrics?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}