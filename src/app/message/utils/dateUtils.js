export const formatMessageDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (messageDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    // Check if it's within the current week
    const daysDiff = Math.floor((today - messageDate) / (24 * 60 * 60 * 1000));
    if (daysDiff < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }
};

export const groupMessagesByDate = (messages) => {
  const groups = [];
  let currentGroup = null;
  
  messages.forEach((message) => {
    const messageDate = new Date(message.timestamp);
    const dateKey = messageDate.toDateString();
    
    if (!currentGroup || currentGroup.dateKey !== dateKey) {
      currentGroup = {
        dateKey,
        dateLabel: formatMessageDate(message.timestamp),
        messages: []
      };
      groups.push(currentGroup);
    }
    
    currentGroup.messages.push(message);
  });
  
  return groups;
};

export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};