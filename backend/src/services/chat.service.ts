import { ChatMessage } from '../models/chat.model';
import { User } from '../models/user.model';
import { OpenAI } from 'openai';
import { FAQService } from './faq.service';
import { NotificationService } from './notification.service';
import { BaseService } from './base.service';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class ChatService extends BaseService {
  private faqService: FAQService;
  private notificationService: NotificationService;

  protected constructor() {
    super();
    this.faqService = FAQService.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  /**
   * Save a new chat message
   */
  async saveMessage(userId: number, content: string, role: 'user' | 'assistant'): Promise<ChatMessage | null> {
    return this.tryCatch(async () => {
      const message = await ChatMessage.create({
        userId,
        content,
        role,
        timestamp: new Date(),
      });

      // Broadcast the message through WebSocket
      await this.notificationService.broadcastChatMessage(userId.toString(), {
        messageId: message.id,
        content: message.content,
        role: message.role,
        userId: message.userId
      });

      return message;
    }, 'saveMessage', null);
  }

  /**
   * Get chat history for a user
   */
  async getChatHistory(userId: number, limit: number = 50): Promise<ChatMessage[]> {
    return this.tryCatch(async () => {
      return await ChatMessage.findAll({
        where: { userId },
        order: [['timestamp', 'DESC']],
        limit,
        include: [{ model: User, attributes: ['username'] }],
      });
    }, 'getChatHistory', []);
  }

  /**
   * Process a user message and generate a response
   */
  async processMessage(userId: number, message: string): Promise<string> {
    return this.tryCatch(async () => {
      // First, check FAQ database
      const matchingFAQs = await this.faqService.searchFAQs(message);
      if (matchingFAQs.length > 0) {
        const faqResponse = matchingFAQs[0].answer;
        await Promise.all([
          this.saveMessage(userId, message, 'user'),
          this.saveMessage(userId, faqResponse, 'assistant'),
        ]);
        return faqResponse;
      }

      // If no FAQ match, use OpenAI
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful trading assistant. Provide concise, accurate information about trading, market analysis, and risk management. Never provide financial advice or specific trading recommendations."
          },
          {
            role: "user",
            content: message
          }
        ],
        model: "gpt-3.5-turbo",
      });

      const response = completion.choices[0]?.message?.content || 
        "I apologize, but I couldn't process your request at the moment.";

      // Save both messages to database in parallel
      await Promise.all([
        this.saveMessage(userId, message, 'user'),
        this.saveMessage(userId, response, 'assistant'),
      ]);

      return response;
    }, 'processMessage', "I'm sorry, but I'm having trouble processing your request at the moment. Please try again later.");
  }
}
