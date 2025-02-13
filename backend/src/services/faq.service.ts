import { CacheService } from './cache.service';
import { BaseService } from './base.service';

interface FAQ {
  id: number;
  keywords: string[];
  question: string;
  answer: string;
  category: string;
}

export class FAQService extends BaseService {
  private static instance: FAQService | null = null;
  private cacheService: CacheService;
  private faqDatabase: FAQ[] = [
    {
      id: 1,
      keywords: ['trade', 'how', 'start'],
      question: 'How do I start trading?',
      answer: 'To start trading: 1) Complete your account verification 2) Deposit funds 3) Navigate to the trading interface 4) Select your trading pair 5) Place your first order. Always start with small amounts and use the demo account first.',
      category: 'trading'
    },
    {
      id: 2,
      keywords: ['deposit', 'fund', 'money'],
      question: 'How do I deposit funds?',
      answer: 'You can deposit funds through: 1) Bank transfer 2) Credit/Debit card 3) Cryptocurrency transfer. Go to the Wallet section and select your preferred deposit method.',
      category: 'payments'
    },
    // Add more FAQs here
  ];

  protected constructor() {
    super();
    this.cacheService = CacheService.getInstance();
    this.initializeCache();
  }

  public static getInstance(): FAQService {
    if (!FAQService.instance) {
      FAQService.instance = new FAQService();
    }
    return FAQService.instance;
  }

  private async initializeCache(): Promise<void> {
    return this.tryCatch(
      async () => {
        await this.cacheService.cacheFAQ(this.faqDatabase);
      },
      'initializeCache'
    );
  }

  /**
   * Get all FAQs
   */
  async getAllFAQs(): Promise<FAQ[]> {
    return this.tryCatch(async () => {
      const cachedFAQs = await this.cacheService.getFAQ();
      if (cachedFAQs) {
        return cachedFAQs;
      }
      
      await this.initializeCache();
      return this.faqDatabase;
    }, 'getAllFAQs', []);
  }

  /**
   * Get FAQs by category
   */
  async getFAQsByCategory(category: string): Promise<FAQ[]> {
    return this.tryCatch(async () => {
      const allFAQs = await this.getAllFAQs();
      return allFAQs.filter(faq => faq.category === category);
    }, 'getFAQsByCategory', []);
  }

  /**
   * Search FAQs by query
   */
  async searchFAQs(query: string): Promise<FAQ[]> {
    return this.tryCatch(async () => {
      const allFAQs = await this.getAllFAQs();
      const words = new Set(query.toLowerCase().split(/\s+/));

      return allFAQs.filter(faq => {
        // Check keywords match
        const keywordMatches = faq.keywords.some(keyword => 
          words.has(keyword.toLowerCase())
        );

        // Check question contains any of the words
        const questionMatches = Array.from(words).some((word: string) =>
          faq.question.toLowerCase().includes(word)
        );

        return keywordMatches || questionMatches;
      });
    }, 'searchFAQs', []);
  }

  /**
   * Get FAQ by ID
   */
  async getFAQById(id: number): Promise<FAQ | null> {
    return this.tryCatch(async () => {
      const allFAQs = await this.getAllFAQs();
      return allFAQs.find(faq => faq.id === id) || null;
    }, 'getFAQById', null);
  }

  /**
   * Add new FAQ
   */
  async addFAQ(faq: Omit<FAQ, 'id'>): Promise<FAQ> {
    return this.tryCatch(async () => {
      const allFAQs = await this.getAllFAQs();
      const newFAQ: FAQ = {
        ...faq,
        id: Math.max(...allFAQs.map(f => f.id), 0) + 1
      };

      this.faqDatabase.push(newFAQ);
      await this.initializeCache();

      return newFAQ;
    }, 'addFAQ');
  }

  /**
   * Update FAQ
   */
  async updateFAQ(id: number, updates: Partial<Omit<FAQ, 'id'>>): Promise<FAQ | null> {
    return this.tryCatch(async () => {
      const index = this.faqDatabase.findIndex(faq => faq.id === id);
      if (index === -1) return null;

      this.faqDatabase[index] = {
        ...this.faqDatabase[index],
        ...updates
      };

      await this.initializeCache();
      return this.faqDatabase[index];
    }, 'updateFAQ', null);
  }

  /**
   * Delete FAQ
   */
  async deleteFAQ(id: number): Promise<boolean> {
    return this.tryCatch(async () => {
      const initialLength = this.faqDatabase.length;
      this.faqDatabase = this.faqDatabase.filter(faq => faq.id !== id);
      
      if (this.faqDatabase.length !== initialLength) {
        await this.initializeCache();
        return true;
      }
      
      return false;
    }, 'deleteFAQ', false);
  }
} 