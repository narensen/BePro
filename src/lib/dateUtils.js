/**
 * Centralized date/time formatting utilities
 * All timestamps should show Time first, then Date (HH:MM:SS YYYY-MM-DD)
 */

/**
 * Format timestamp with smart relative/absolute display
 * Shows relative time (e.g., "2 hours ago") for < 24 hours
 * Shows absolute time (e.g., "9:30 PM July 30 2025") for >= 24 hours
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} - Formatted timestamp
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffMs = now - date;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  // If less than 24 hours ago, show relative time
  if (diffHours < 24) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    
    const hours = Math.floor(diffMinutes / 60);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  
  // For 24+ hours ago, show absolute format: "9:30 PM July 30 2025"
  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  const dateString = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  return `${timeString} ${dateString}`;
};

/**
 * Format timestamp for notifications with relative time when recent
 * Falls back to standard format for older timestamps
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} - Formatted timestamp
 */
export const formatNotificationTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / (1000 * 60));
  
  // Show relative time for very recent items
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  // For older items, use standard format
  return formatTimestamp(timestamp);
};

/**
 * Format time only (for inline contexts where date is shown separately)
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} - Formatted time (HH:MM:SS)
 */
export const formatTimeOnly = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * Format date only (for contexts where time is shown separately)
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} - Formatted date (YYYY-MM-DD)
 */
export const formatDateOnly = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
};

// Legacy function for backward compatibility
export const formatDate = formatTimestamp;