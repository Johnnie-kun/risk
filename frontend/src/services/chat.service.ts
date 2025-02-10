import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ChatMessage {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  userId: number;
}

class ChatService {
  private static instance: ChatService;

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async getChatHistory(limit: number = 50): Promise<ChatMessage[]> {
    try {
      const response = await axios.get(`${API_URL}/api/chat/history`, {
        params: { limit },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  async sendMessage(message: string): Promise<string> {
    try {
      const response = await axios.post(
        `${API_URL}/api/chat/message`,
        { message },
        { withCredentials: true }
      );
      return response.data.response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}

export const chatService = ChatService.getInstance();
