'use client'

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MentionAutocomplete = ({ 
  textareaRef, 
  content, 
  onContentChange, 
  onMentionSelect 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const suggestionRefs = useRef([]);

  const searchUsers = async (query) => {
    if (!query || query.length < 1) {
      setSuggestions([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profile')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .limit(5)
        .order('username');

      if (!error && data) {
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleTextChange = (e) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    onContentChange(e);
    
    // Find @ mentions
    const beforeCursor = value.substring(0, cursorPosition);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const afterAt = beforeCursor.substring(atIndex + 1);
      const spaceIndex = afterAt.indexOf(' ');
      
      if (spaceIndex === -1 && /^[\w]*$/.test(afterAt)) {
        setMentionStart(atIndex);
        setMentionQuery(afterAt);
        setShowSuggestions(true);
        setSelectedIndex(0);
        searchUsers(afterAt);
        return;
      }
    }
    
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        selectMention(suggestions[selectedIndex]);
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const selectMention = (user) => {
    if (!user || mentionStart === -1) return;

    const beforeMention = content.substring(0, mentionStart);
    const afterMention = content.substring(mentionStart + mentionQuery.length + 1);
    const newContent = beforeMention + `@${user.username} ` + afterMention;
    
    onContentChange({ target: { value: newContent } });
    onMentionSelect?.(user);
    
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = mentionStart + user.username.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const getPosition = () => {
    if (!textareaRef.current || mentionStart === -1) return { top: 0, left: 0 };

    const textarea = textareaRef.current;
    const textBeforeCursor = content.substring(0, mentionStart);
    
    // Create a temporary div to calculate position
    const temp = document.createElement('div');
    temp.style.cssText = window.getComputedStyle(textarea).cssText;
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    temp.style.height = 'auto';
    temp.style.maxHeight = 'none';
    temp.style.overflow = 'hidden';
    temp.textContent = textBeforeCursor;
    
    document.body.appendChild(temp);
    const rect = textarea.getBoundingClientRect();
    
    const lines = textBeforeCursor.split('\n').length;
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 20;
    
    document.body.removeChild(temp);
    
    return {
      top: rect.top + (lines - 1) * lineHeight + lineHeight + 5,
      left: rect.left + 20
    };
  };

  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  if (!showSuggestions || suggestions.length === 0) return null;

  const position = getPosition();

  return (
    <div
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: '200px'
      }}
    >
      {suggestions.map((user, index) => (
        <button
          key={user.id}
          ref={el => suggestionRefs.current[index] = el}
          className={`w-full text-left p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
            index === selectedIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
          }`}
          onClick={() => selectMention(user)}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={`${user.username}'s avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-xs">
                {user.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">@{user.username}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

// Enhanced PostForm component with mention autocomplete
export const PostFormWithMentions = ({ 
  content, 
  handleContentChange, 
  charCount, 
  maxChars,
  images,
  onImagesChange,
  textareaRef
}) => {
  const [mentionedUsers, setMentionedUsers] = useState([]);

  const handleMentionSelect = (user) => {
    setMentionedUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
  };

  const enhancedHandleChange = (e) => {
    handleContentChange(e);
  };

  return (
    <div className="relative">
      <MentionAutocomplete
        textareaRef={textareaRef}
        content={content}
        onContentChange={enhancedHandleChange}
        onMentionSelect={handleMentionSelect}
      />
    </div>
  );
};

export default MentionAutocomplete;