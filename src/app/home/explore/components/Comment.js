'use client'

import React, { useState, useEffect } from 'react';
import { Reply, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
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
  const getBackgroundColor = (level) => {
    const colors = ['bg-white', 'bg-gray-50', 'bg-blue-50', 'bg-yellow-50'];
    return colors[level] || colors[colors.length - 1];
  };
  const getBorderColor = (level) => {
    const colors = ['border-gray-200', 'border-gray-300', 'border-blue-200', 'border-yellow-200'];
    return colors[level] || colors[colors.length - 1];
  };
  
  return (
    <div className={`${indentClass} ${level > 0 ? 'border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className={`${getBackgroundColor(level)} rounded-xl p-4 border ${getBorderColor(level)} hover:shadow-md transition-all duration-300 transform hover:scale-[1.01]`}>
        <div className="flex items-start mb-3">
          {/* Avatar */}
          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm mr-3 flex-shrink-0">
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
              <span className="text-white font-bold text-xs">
                {comment.profile?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
            {avatarUrl && (
              <span 
                className="text-white font-bold text-xs hidden items-center justify-center w-full h-full"
                style={{ display: 'none' }}
              >
                {comment.profile?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/${comment.profile?.username}`}>
                <span className="font-semibold text-gray-700 hover:text-amber-600 transition-colors duration-200 text-sm cursor-pointer">
                  @{comment.profile?.username || 'user'}
                </span>
              </Link>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>{formatDate(comment.created_at)}</span>
              </div>
            </div>
            
            {comment.parent_comment_id && (
              <div className="flex items-center gap-1 mb-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-xs text-amber-600 font-medium">
                  Replying to a comment
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <p className="text-gray-800 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
            {highlightMentions(comment.content)}
          </p>
          
          <div className="flex items-center gap-4">
            {level < maxDepth && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-600 transition-all duration-200 px-2 py-1 rounded-lg hover:bg-amber-50 group"
              >
                <Reply size={12} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">Reply</span>
              </button>
            )}
            
            {replies.length > 0 && (
              <button
                onClick={toggleReplies}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-600 transition-all duration-200 px-2 py-1 rounded-lg hover:bg-amber-50 group"
              >
                {showReplies ? 
                  <ChevronUp size={12} className="group-hover:scale-110 transition-transform" /> : 
                  <ChevronDown size={12} className="group-hover:scale-110 transition-transform" />
                }
                <span className="font-medium">
                  {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {}
      {showReplyForm && (
        <div className="mt-3 ml-4 transform transition-all duration-300 animate-in slide-in-from-top-2">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="flex-1">
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 hover:shadow-sm focus:shadow-md"
                  rows={3}
                  placeholder={`Reply to @${comment.profile?.username || 'user'}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleReply}
                    className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-600 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
                    disabled={!replyText.trim()}
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => setShowReplyForm(false)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 active:scale-95 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {showReplies && replies.length > 0 && (
        <div className="mt-4 space-y-3 animate-in slide-in-from-top-3 duration-300">
          {replies.map((reply, index) => (
            <div 
              key={reply.id}
              style={{
                animation: `slideInUp 0.3s ease-out ${index * 0.1}s both`
              }}
            >
              <Comment
                comment={reply}
                onReply={onReply}
                level={level + 1}
                replies={reply.replies || []}
                onLoadReplies={onLoadReplies}
              />
            </div>
          ))}
        </div>
      )}
      
      {loadingReplies && showReplies && (
        <div className="mt-3 ml-4 text-xs text-gray-500 flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
          <span>Loading replies...</span>
        </div>
      )}
    </div>
  );
};

export default Comment;