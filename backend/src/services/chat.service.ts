import { ChatMessage } from '../models/chat.model';
import { User } from '../models/user.model';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// FAQ database - can be moved to a separate file or database
const FAQ_DATABASE = [
  {
    keywords: ['trade', 'how', 'start'],
    question: 'How do I start trading?',
    answer: 'To start trading: 1) Complete your account verification 2) Deposit funds 3) Navigate to the trading interface 4) Select your trading pair 5) Place your first order. Always start with small amounts and use the demo account first.',
  },
  {
    keywords: ['deposit', 'fund', 'money'],
    question: 'How do I deposit funds?',
    answer: 'You can deposit funds through: 1) Bank transfer 2) Credit/Debit card 3) Cryptocurrency transfer. Go to the Wallet section and select your preferred deposit method.',
  },
  // Add more FAQ entries as needed
];

export class ChatService {
  private static instance: ChatService;

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  /**
   * Save a new chat message
   */
  async saveMessage(userId: number, content: string, role: 'user' | 'assistant'): Promise<ChatMessage> {
    return await ChatMessage.create({
      userId,
      content,
      role,
      timestamp: new Date(),
    });
  }

  /**
   * Get chat history for a user
   */
  async getChatHistory(userId: number, limit: number = 50): Promise<ChatMessage[]> {
    return await ChatMessage.findAll({
      where: { userId },
      order: [['timestamp', 'DESC']],
      limit,
      include: [{ model: User, attributes: ['username'] }],
    });
  }

  /**
   * Check if the query matches any FAQ
   */
  private matchFAQ(query: string): string | null {
    const normalizedQuery = query.toLowerCase();
    
    for (const faq of FAQ_DATABASE) {
      const matches = faq.keywords.some(keyword => 
        normalizedQuery.includes(keyword.toLowerCase())
      );
      
      if (matches) {
        return faq.answer;
      }
    }
    
    return null;
  }

  /**
   * Process a user message and generate a response
   */
  async processMessage(userId: number, message: string): Promise<string> {
    // First check FAQ database
    const faqResponse = this.matchFAQ(message);
    if (faqResponse) {
      await this.saveMessage(userId, message, 'user');
      await this.saveMessage(userId, faqResponse, 'assistant');
      return faqResponse;
    }

    try {
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

      // Save both messages to database
      await this.saveMessage(userId, message, 'user');
      await this.saveMessage(userId, response, 'assistant');

      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return "I'm sorry, but I'm having trouble processing your request at the moment. Please try again later.";
    }
  }
}