'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, User } from 'lucide-react'
import { supabase } from '../app/lib/supabase_client'

const UserMentionAutocomplete = ({ 
  inputRef, 
  onMention, 
  isVisible, 
  onHide,
  searchQuery = ''
}) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const dropdownRef = useRef(null)

  // Search users with debounce
  const searchUsers = useCallback(async (query) => {
    if (!query || query.length < 1) {
      setUsers([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .limit(10)
        .order('username')

      if (!error && data) {
        setUsers(data)
        setSelectedIndex(0)
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Search when query changes with debounce
  useEffect(() => {
    if (!isVisible) return

    const debounceTimer = setTimeout(() => {
      searchUsers(searchQuery)
    }, 200)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, isVisible, searchUsers])

  // Calculate precise cursor position within textarea
  const getTextareaCaretPosition = useCallback((textarea) => {
    if (!textarea) return { top: 0, left: 0 }

    // Create a dummy div to measure text dimensions
    const div = document.createElement('div')
    const style = window.getComputedStyle(textarea)
    
    // Copy textarea styles to div
    const properties = [
      'direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
      'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
      'borderStyle', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
      'fontSizeAdjust', 'lineHeight', 'fontFamily', 'textAlign', 'textTransform',
      'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing', 'tabSize',
      'MozTabSize', 'whiteSpace', 'wordBreak', 'wordWrap'
    ]

    properties.forEach(prop => {
      div.style[prop] = style[prop]
    })

    // Position off-screen
    div.style.position = 'absolute'
    div.style.visibility = 'hidden'
    div.style.whiteSpace = 'pre-wrap'
    div.style.wordWrap = 'break-word'

    document.body.appendChild(div)

    try {
      const cursorPos = textarea.selectionStart
      const textUpToCursor = textarea.value.substring(0, cursorPos)
      
      // Set div content up to cursor position
      div.textContent = textUpToCursor
      
      // Add a span to measure cursor position
      const span = document.createElement('span')
      span.textContent = '|' // Use a character to measure position
      div.appendChild(span)

      const spanRect = span.getBoundingClientRect()
      const textareaRect = textarea.getBoundingClientRect()

      return {
        top: spanRect.top - textareaRect.top,
        left: spanRect.left - textareaRect.left
      }
    } finally {
      document.body.removeChild(div)
    }
  }, [])

  // Position the dropdown
  useEffect(() => {
    if (!isVisible || !inputRef?.current) return

    const input = inputRef.current
    const inputRect = input.getBoundingClientRect()
    
    // Get precise cursor position within textarea
    const caretPosition = getTextareaCaretPosition(input)
    
    // Position dropdown at cursor location
    setPosition({
      top: inputRect.top + caretPosition.top + 20, // Add small offset below text line
      left: inputRect.left + caretPosition.left
    })
  }, [isVisible, inputRef, searchQuery, getTextareaCaretPosition])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isVisible || users.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, users.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
        case 'Tab':
          e.preventDefault()
          if (users[selectedIndex]) {
            handleSelectUser(users[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onHide()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, users, selectedIndex, onHide])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onHide()
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, onHide])

  const handleSelectUser = (user) => {
    onMention(user)
    onHide()
  }

  if (!isVisible) return null

  return (
    <div
      ref={dropdownRef}
      className="fixed z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-2 min-w-64 max-w-80"
      style={{ 
        top: position.top, 
        left: position.left,
        maxHeight: '300px',
        overflowY: 'auto'
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border-b border-gray-100">
        <Search className="w-4 h-4" />
        <span>Mention someone</span>
        {loading && (
          <div className="w-4 h-4 border-2 border-amber-300/30 border-t-amber-500 rounded-full animate-spin ml-auto"></div>
        )}
      </div>

      {/* User List */}
      <div className="py-2">
        {users.length === 0 && !loading && searchQuery ? (
          <div className="px-3 py-4 text-center text-gray-500 text-sm">
            <User className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p>No users found for "{searchQuery}"</p>
          </div>
        ) : users.length === 0 && !searchQuery ? (
          <div className="px-3 py-4 text-center text-gray-500 text-sm">
            <User className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p>Type to search users...</p>
          </div>
        ) : (
          users.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors duration-150 ${
                index === selectedIndex 
                  ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200' 
                  : 'hover:bg-gray-50'
              } rounded-lg mx-1`}
              onClick={() => handleSelectUser(user)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center overflow-hidden border-2 border-amber-200/50 flex-shrink-0">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* Username */}
              <div className="flex-1">
                <span className="font-medium text-gray-900">@{user.username}</span>
              </div>
              
              {/* Selected indicator */}
              {index === selectedIndex && (
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-3 py-2 text-xs text-gray-500">
        Use ↑↓ to navigate, Enter to select, Esc to close
      </div>
    </div>
  )
}

export default UserMentionAutocomplete