import React from 'react';
import { highlightQuery } from '../utils/highlightQuery';
import { highlightMentions } from '../utils/mentionUtils';

const PostContent = ({ post, searchQuery }) => {
  // Combine search highlighting and mention highlighting
  const processedContent = searchQuery 
    ? highlightQuery(post.content, searchQuery)
    : highlightMentions(post.content);

  return (
    <div>
      {/* Post content with preserved line breaks and mention highlighting */}
      <p className="text-gray-800 mb-4 leading-relaxed transition-colors duration-300 hover:text-gray-900 whitespace-pre-wrap">
        {processedContent}
      </p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm transition-all duration-300 hover:bg-yellow-200 hover:scale-105 cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostContent;
