// Legacy functions for message grouping (can be customized as needed)
export const formatMessageDate = (timestamp) => {
  return formatTimestamp(timestamp);
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
        dateLabel: formatTimestamp(message.timestamp),
        messages: []
      };
      groups.push(currentGroup);
    }
    
    currentGroup.messages.push(message);
  });
  
  return groups;
};

export const formatTime = (timestamp) => {
  return formatTimeOnly(timestamp);
};