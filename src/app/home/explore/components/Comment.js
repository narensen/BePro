'use client'

import React, { useState, useEffect } from 'react';
import { Reply, ChevronDown, ChevronUp} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimestamp } from '../../../../lib/dateUtils';
import { highlightMentions } from '../utils/mentionUtils';
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const Comment = ({ 
  comment, 
  onReply, 
  level = 0, 
  replies = [],
  onLoadReplies,
  loadingReplies = false
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  // Fetch avatar URL for the comment author
  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (!comment.profile?.username) return;

      try {
        const { data, error } = await supabase
          .from('profile')
          .select('avatar_url')
          .eq('username', comment.profile.username)
          .single();

        if (error) {
          console.error('Error fetching avatar:', error.message);
        } else if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error('Error fetching avatar:', error);
      }
    };

    fetchUserAvatar();
  }, [comment.profile?.username]);

  const handleReply = async () => {
    if (replyText.trim()) {
      const success = await onReply(comment.id, replyText);
      if (success !== false) {
        setReplyText('');
        setShowReplyForm(false);
        setShowReplies(true);
      }
    }
  };

  const toggleReplies = async () => {
    if (!showReplies && replies.length === 0) {
      await onLoadReplies(comment.id);
    }
    setShowReplies(!showReplies);
  };

  const maxDepth = 3;
  const indentClass = level > 0 ? `ml-${Math.min(level * 4, 12)}` : '';
  
  const getGradientStyle = (level) => {
    const gradients = [
      'from-white/90 via-amber-50/20 to-yellow-50/30',
      'from-amber-50/70 via-yellow-50/40 to-orange-50/30',
      'from-blue-50/70 via-indigo-50/40 to-purple-50/30',
      'from-green-50/70 via-emerald-50/40 to-teal-50/30'
    ];
    return gradients[level] || gradients[gradients.length - 1];
  };

  const getBorderStyle = (level) => {
    const borders = [
      'border-amber-200/50',
      'border-yellow-300/50',
      'border-blue-300/50',
      'border-green-300/50'
    ];
    return borders[level] || borders[borders.length - 1];
  };
  
  return (
    <div className={`${indentClass} ${level > 0 ? 'border-l-3 border-gradient-to-b from-amber-400 to-yellow-400 pl-6' : ''}`}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${getGradientStyle(level)} backdrop-blur-sm rounded-xl p-5 border ${getBorderStyle(level)} hover:shadow-lg transition-all duration-300 transform hover:border-opacity-80`}
      >
        <div className="flex items-start mb-4">
          {/* Enhanced Avatar */}
          <div className="relative mr-4 flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full animate-pulse opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
            <div className="relative w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${comment.profile?.username}'s avatar`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {comment.profile?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
              {avatarUrl && (
                <span 
                  className="text-white font-bold text-sm hidden items-center justify-center w-full h-full"
                  style={{ display: 'none' }}
                >
                  {comment.profile?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Link href={`/${comment.profile?.username}`}>
                <span className="font-bold text-gray-800 hover:text-amber-600 transition-colors duration-200 cursor-pointer transform">
                  @{comment.profile?.username || 'user'}
                </span>
              </Link>
              <div className="flex items-center gap-2 text-gray-500">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"></div>
                <span className="text-xs font-medium">{formatTimestamp(comment.created_at)}</span>
              </div>
            </div>
            
            {comment.parent_comment_id && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-3"
              >
                <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full shadow-sm"></div>
                <span className="text-xs text-amber-600 font-semibold bg-amber-100/50 px-2 py-1 rounded-full">
                  Replying to a comment
                </span>
              </motion.div>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 mb-4 border border-white/30">
            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {highlightMentions(comment.content)}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {level < maxDepth && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-2 text-xs text-gray-600 hover:text-amber-600 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/60 backdrop-blur-sm border border-transparent hover:border-amber-200 font-semibold"
              >
                <Reply size={12} className="transform transition-transform" />
                <span>Reply</span>
              </motion.button>
            )}
            
            {replies.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleReplies}
                className="flex items-center gap-2 text-xs text-gray-600 hover:text-amber-600 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/60 backdrop-blur-sm border border-transparent hover:border-amber-200 font-semibold"
              >
                <motion.div
                  animate={{ rotate: showReplies ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={12} />
                </motion.div>
                <span>
                  {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Reply Form */}
      <AnimatePresence>
        {showReplyForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-4 ml-6"
          >
            <div className="bg-gradient-to-br from-white/90 to-amber-50/50 backdrop-blur-sm border border-amber-200/50 rounded-xl p-4 shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Reply size={16} className="text-amber-500" />
                  <span className="font-semibold text-gray-700">
                    Replying to @{comment.profile?.username || 'user'}
                  </span>
                </div>
                <textarea
                  className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 hover:shadow-sm focus:shadow-md bg-white/90 backdrop-blur-sm"
                  rows={3}
                  placeholder={`Reply to @${comment.profile?.username || 'user'}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReply}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold border-2 border-transparent hover:border-amber-300"
                    disabled={!replyText.trim()}
                  >
                    Reply
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowReplyForm(false)}
                    className="bg-white/80 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md font-semibold border-2 border-gray-200 hover:border-gray-300"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replies */}
      <AnimatePresence>
        {showReplies && replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-4 space-y-3"
          >
            {replies.map((reply, index) => (
              <motion.div 
                key={reply.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Comment
                  comment={reply}
                  onReply={onReply}
                  level={level + 1}
                  replies={reply.replies || []}
                  onLoadReplies={onLoadReplies}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {loadingReplies && showReplies && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 ml-4 text-xs text-amber-600 flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg border border-amber-200/50"
        >
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
          <span className="font-semibold">Loading replies...</span>
        </motion.div>
      )}
    </div>
  );
};

export default Comment;