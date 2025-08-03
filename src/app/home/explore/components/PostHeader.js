import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../../lib/supabase_client';
import { formatDate } from '../utils/dateUtils';

const PostHeader = ({ post }) => {
  const username = post.username;
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!post?.email && !username) return;

      const { data, error } = await supabase
        .from('profile')
        .select('username, avatar_url')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
      } else if (data) {
        if (data.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      }
    };

    fetchUserProfile();
  }, [username, post]);

  return (
    <motion.div 
      className="flex items-start gap-3 mb-4"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Enhanced Avatar with hover effects */}
      <motion.div 
        className="relative w-11 h-11 flex-shrink-0"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-full h-full bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm">
          {avatarUrl ? (
            <motion.img
              src={avatarUrl}
              alt={`${username}'s avatar`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                // Fallback to initial if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : (
            <span className="text-white font-bold text-base">
              {username?.charAt(0).toUpperCase() || 'U'}
            </span>
          )}
          {avatarUrl && (
            <span 
              className="text-white font-bold text-base hidden items-center justify-center w-full h-full"
              style={{ display: 'none' }}
            >
              {username?.charAt(0).toUpperCase() || 'U'}
            </span>
          )}
        </div>
        
        {/* Online indicator (placeholder for future feature) */}
        <motion.div 
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        />
      </motion.div>

      {/* Enhanced User Info */}
      <div className="flex-1 min-w-0">
        <motion.div 
          className="flex items-center gap-2 flex-wrap"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {/* Username with better hover effects */}
          <motion.button
            className="font-bold text-gray-900 hover:text-amber-700 text-base transition-colors duration-200 hover:underline decoration-2 underline-offset-2 truncate max-w-[150px] sm:max-w-none"
            onClick={() => window.open(`https://bepro.live/${username}`, "_blank")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {username}
          </motion.button>
          
          {/* Handle */}
          <span className="text-gray-500 text-sm font-medium">
            @{username}
          </span>
          
          {/* Separator */}
          <span className="text-gray-400 text-sm">•</span>
          
          {/* Enhanced timestamp */}
          <motion.span 
            className="text-gray-500 text-sm hover:text-gray-700 cursor-pointer transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
          >
            {formatDate(post.created_at)}
          </motion.span>
        </motion.div>
        
        {/* Optional: User verification badge or role indicator */}
        {post.user_role && (
          <motion.div
            className="mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {post.user_role}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PostHeader;