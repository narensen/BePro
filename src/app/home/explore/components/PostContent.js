import React from 'react';
import { parseMentions } from './UserMention';

const PostContent = ({ post, searchQuery }) => (
  <div>
    {/* Enhanced content display with proper text formatting and mention parsing */}
    <div className="text-gray-800 mb-3 leading-relaxed whitespace-pre-wrap text-[15px] transition-colors duration-300 hover:text-gray-900">
      {parseMentions(post.content, searchQuery)}
    </div>

    {/* Tags display */}
    {post.tags && post.tags.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-3">
        {post.tags.map((tag, index) => (
          <span
            key={index}
            className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-sm font-medium transition-all duration-300 hover:bg-blue-100 hover:scale-105 cursor-pointer"
          >
            #{tag}
          </span>
        ))}
      </div>
    )}
  </div>
);

export default PostContent;
