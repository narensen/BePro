'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../lib/supabase_client';
import { User, Search } from 'lucide-react';

const MentionAutocomplete = ({
  value,
  onChange,
  onMentionSelect,
  placeholder = "What's on your mind?",
  className = "",
  rows = 4,
  disabled = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const textareaRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Parse content for @mentions
  const parseMentions = (text, position) => {
    const beforeCursor = text.substring(0, position);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      const start = position - query.length - 1; // -1 for @
      return { query, start, end: position };
    }
    
    return null;
  };

  // Search users based on query
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('id, username, email, avatar_url')
        .ilike('username', `%${query}%`)
        .limit(8);

      if (!error && data) {
        setSuggestions(data);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle text change
  const handleChange = (e) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(newCursorPosition);
    
    const mentionData = parseMentions(newValue, newCursorPosition);
    
    if (mentionData) {
      setMentionQuery(mentionData.query);
      setShowSuggestions(true);
      setSelectedIndex(0);
      
      // Debounce the search
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        searchUsers(mentionData.query);
      }, 300);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setMentionQuery('');
    }
  };

  // Handle key down events
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
      case 'Tab':
        if (suggestions[selectedIndex]) {
          e.preventDefault();
          selectMention(suggestions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Select a mention
  const selectMention = (user) => {
    const mentionData = parseMentions(value, cursorPosition);
    if (!mentionData) return;

    const beforeMention = value.substring(0, mentionData.start);
    const afterMention = value.substring(mentionData.end);
    const newValue = beforeMention + `@${user.username} ` + afterMention;
    
    onChange(newValue);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Notify parent about the mention
    if (onMentionSelect) {
      onMentionSelect(user);
    }
    
    // Focus back to textarea and position cursor
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionData.start + user.username.length + 2; // +2 for @ and space
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Get suggestion dropdown position
  const getSuggestionPosition = () => {
    if (!textareaRef.current) return { top: 0, left: 0 };
    
    const textarea = textareaRef.current;
    const mentionData = parseMentions(value, cursorPosition);
    if (!mentionData) return { top: 0, left: 0 };

    // Create a temporary div to measure text dimensions
    const div = document.createElement('div');
    const styles = window.getComputedStyle(textarea);
    
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    div.style.font = styles.font;
    div.style.width = textarea.offsetWidth + 'px';
    div.style.padding = styles.padding;
    div.style.border = styles.border;
    
    document.body.appendChild(div);
    
    const textBeforeMention = value.substring(0, mentionData.start);
    div.textContent = textBeforeMention;
    
    const rect = textarea.getBoundingClientRect();
    const divRect = div.getBoundingClientRect();
    
    document.body.removeChild(div);
    
    return {
      top: rect.top + divRect.height + 8,
      left: rect.left + (divRect.width % textarea.offsetWidth)
    };
  };

  const suggestionPosition = getSuggestionPosition();

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`w-full p-4 border-2 border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none font-medium text-sm lg:text-base transition-colors duration-200 ${className}`}
        onBlur={(e) => {
          // Delay hiding suggestions to allow for clicks
          setTimeout(() => {
            setShowSuggestions(false);
          }, 200);
        }}
        onFocus={(e) => {
          const mentionData = parseMentions(value, e.target.selectionStart);
          if (mentionData && mentionQuery) {
            setShowSuggestions(true);
          }
        }}
      />

      {/* Suggestions Portal */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto min-w-64"
            style={{
              top: suggestionPosition.top,
              left: suggestionPosition.left
            }}
          >
            {loading ? (
              <div className="p-4 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600 ml-2">Searching...</span>
              </div>
            ) : suggestions.length === 0 && mentionQuery ? (
              <div className="p-4 text-center text-gray-500">
                <Search className="w-5 h-5 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No users found for "{mentionQuery}"</p>
              </div>
            ) : (
              <div className="py-2">
                {suggestions.map((user, index) => (
                  <button
                    key={user.id}
                    onClick={() => selectMention(user)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-150 ${
                      index === selectedIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={`${user.username}'s avatar`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium text-sm">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">
                        @{user.username}
                      </p>
                      {user.email && (
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MentionAutocomplete;