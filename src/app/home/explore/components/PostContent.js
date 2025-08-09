import React from 'react';
import { highlightQuery } from '../utils/highlightQuery';
import { highlightMentions } from '../utils/mentionUtils';
import ImageGallery from '../../../../components/ImageGallery';

const PostContent = ({ post, searchQuery }) => {
  // Combine search highlighting and mention highlighting
  const processedContent = searchQuery 
    ? highlightQuery(post.content, searchQuery)
    : highlightMentions(post.content);

  return (
    <div className="mb-6 space-y-4">
      {/* Post content */}
      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
        {processedContent}
      </p>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <ImageGallery images={post.images} className="mt-4" />
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm hover:bg-amber-200 transition-colors cursor-pointer font-medium"
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