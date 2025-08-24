export const formatDate = (dateString) => {
  if (!dateString) return 'Just now'; // Handle null/undefined
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Just now'; // Handle invalid dates
  
  const now = new Date();
  const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  
  // For posts older than 24 hours, include time
  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  const dateStr = date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric'
  });
  
  return `${timeString} ${dateStr}`;
};