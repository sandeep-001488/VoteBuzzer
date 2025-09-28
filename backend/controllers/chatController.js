import * as chatService from "../services/chatService.js";

export const sendMessage = async (data) => {
  try {
    const message = await chatService.saveMessage(data);
    return message;
  } catch (error) {
    throw error;
  }
};
