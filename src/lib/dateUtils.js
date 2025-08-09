/**
 * Centralized date/time formatting utilities
 * Enhanced user-friendly timestamp formatting
 */

/**
 * Format timestamp with user-friendly format:
 * - Within 24 hours: Relative format (e.g., "just now", "2m", "5h")
 * - Older than 24 hours: Format like "9:30 PM · Aug 8, 2025"
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} - Formatted timestamp
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  // Within 24 hours: Relative format
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  
  // Older than 24 hours: "9:30 PM · Aug 8, 2025" format
  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${timeString} · ${month} ${day}, ${year}`;
};

/**
 * Format timestamp for notifications - same as main timestamp format
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} - Formatted timestamp
 */
export const formatNotificationTime = (timestamp) => {
  return formatTimestamp(timestamp);
};

/**
 * Format time only (for inline contexts where date is shown separately)
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} - Formatted time (12-hour format)
 */
export const formatTimeOnly = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format date only (for contexts where time is shown separately)
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} - Formatted date (Month Day, Year format)
 */
export const formatDateOnly = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
};

// Legacy function for backward compatibility
export const formatDate = formatTimestamp;