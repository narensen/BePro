'use client'

import React, { useState, useEffect } from 'react';
import { Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import { supabase } from '../../../lib/supabase_client';
import Link from 'next/link';

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!comment.profile?.username) return;

      const { data, error } = await supabase
        .from('profile')
        .select('avatar_url')
        .eq('username', comment.profile.username)
        .single();

      if (!error && data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    };

    fetchUserProfile();
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
  const indentClass = level > 0 ? `ml-${Math.min(level * 6, 18)}` : '';
  
  return (
    <div className={`${indentClass} ${level > 0 ? 'border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:bg-gray-100 transition-all duration-200">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
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
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center font-bold text-xs">
                {comment.profile?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            {avatarUrl && (
              <div 
                className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 text-white hidden items-center justify-center font-bold text-xs"
                style={{ display: 'none' }}
              >
                {comment.profile?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/${comment.profile?.username}`}>
                <span className="font-semibold text-gray-900 hover:text-gray-700 transition-colors cursor-pointer text-sm">
                  @{comment.profile?.username || 'user'}
                </span>
              </Link>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500 text-xs">
                {formatDate(comment.created_at)}
              </span>
            </div>
            
            {comment.parent_comment_id && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                <span className="text-xs text-gray-600 font-medium">
                  Replying to a comment
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="ml-11">
          <p className="text-gray-800 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
            {comment.content}
          </p>
          
          <div className="flex items-center gap-4">
            {level < maxDepth && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
              >
                <Reply size={12} />
                <span className="font-medium">Reply</span>
              </button>
            )}
            
            {replies.length > 0 && (
              <button
                onClick={toggleReplies}
                className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
              >
                {showReplies ? 
                  <ChevronUp size={12} /> : 
                  <ChevronDown size={12} />
                }
                <span className="font-medium">
                  {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showReplyForm && (
        <div className="mt-3 ml-11">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200"
              rows={2}
              placeholder={`Reply to @${comment.profile?.username || 'user'}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleReply}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 font-medium"
                disabled={!replyText.trim()}
              >
                Reply
              </button>
              <button
                onClick={() => setShowReplyForm(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showReplies && replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onReply={onReply}
              level={level + 1}
              replies={reply.replies || []}
              onLoadReplies={onLoadReplies}
            />
          ))}
        </div>
      )}
      
      {loadingReplies && showReplies && (
        <div className="mt-3 ml-11 text-xs text-gray-500 flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
          <span>Loading replies...</span>
        </div>
      )}
    </div>
  );
};

export default Comment;