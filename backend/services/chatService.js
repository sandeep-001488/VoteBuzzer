export const saveMessage = async (messageData) => {
  // In a real application, you might want to save messages to database
  // For now, we'll just return the formatted message
  return {
    ...messageData,
    timestamp: new Date(),
    at: new Date(), 
  };
};
