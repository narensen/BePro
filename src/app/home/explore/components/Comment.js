'use client'

import React, { useState, useEffect } from 'react';
import { Reply, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
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
    const colors = ['bg-white/90', 'bg-white/80', 'bg-white/70', 'bg-white/60'];
    return colors[level] || colors[colors.length - 1];
  };
  const getBorderColor = (level) => {
    const colors = ['border-white/40', 'border-white/30', 'border-amber-200/50', 'border-yellow-200/50'];
    return colors[level] || colors[colors.length - 1];
  };
  
  return (
    <div className={`${indentClass} ${level > 0 ? 'border-l-2 border-white/30 pl-4' : ''}`}>
      <div className={`${getBackgroundColor(level)} backdrop-blur-sm rounded-xl p-4 border ${getBorderColor(level)} hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] shadow-sm`}>
        <div className="flex items-start mb-3">
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
            {comment.content}
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
          <div className="bg-white/90 backdrop-blur-sm border border-white/40 rounded-xl p-4 shadow-lg">
            <div className="flex gap-3">
              <div className="flex-1">
                <textarea
                  className="w-full border border-gray-200/50 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all duration-200 hover:shadow-md focus:shadow-lg bg-white/80 backdrop-blur-sm"
                  rows={3}
                  placeholder={`Reply to @${comment.profile?.username || 'user'}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleReply}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-xl text-sm hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium shadow-md"
                    disabled={!replyText.trim()}
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => setShowReplyForm(false)}
                    className="bg-white/50 text-gray-700 px-4 py-2 rounded-xl text-sm hover:bg-white/70 transition-all duration-200 transform hover:scale-105 active:scale-95 font-medium backdrop-blur-sm border border-gray-200/50"
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