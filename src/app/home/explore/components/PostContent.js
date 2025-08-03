import React from 'react';
import { motion } from 'framer-motion';
import { highlightQuery } from '../utils/highlightQuery';

const PostContent = ({ post, searchQuery }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.1 }}
  >
    {/* Enhanced Post Content with better typography */}
    <div className="mb-4">
      <p className="text-gray-900 leading-relaxed text-base font-normal tracking-wide whitespace-pre-wrap break-words">
        {highlightQuery(post.content, searchQuery)}
      </p>
    </div>

    {/* Enhanced Post Tags with improved styling */}
    {post.tags && post.tags.length > 0 && (
      <motion.div 
        className="flex flex-wrap gap-2 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {post.tags.map((tag, index) => (
          <motion.span
            key={index}
            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200/50 hover:from-amber-200 hover:to-orange-200 hover:border-amber-300/60 hover:shadow-sm transition-all duration-200 cursor-pointer select-none"
            whileHover={{ 
              scale: 1.05,
              y: -1,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: { delay: 0.3 + index * 0.05 }
            }}
          >
            <span className="mr-1 text-amber-600">#</span>
            {tag}
          </motion.span>
        ))}
      </motion.div>
    )}

    {/* Media content placeholder - if posts have images/media */}
    {post.media_url && (
      <motion.div 
        className="mt-3 mb-2 rounded-xl overflow-hidden border border-gray-200/50"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
      >
        <img 
          src={post.media_url} 
          alt="Post media"
          className="w-full h-auto object-cover"
          loading="lazy"
        />
      </motion.div>
    )}
  </motion.div>
);

export default PostContent;
