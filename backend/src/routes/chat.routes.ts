import { Router, Request, Response } from 'express';
import { ChatService } from '../services/chat.service';
import { authenticateToken } from '../middleware/auth.middleware';

// Extend Express Request to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const router = Router();
const chatService = ChatService.getInstance();

// Get chat history
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User ID missing' });
      return;
    }

    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      res.status(400).json({ error: 'Invalid user ID format' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 50;
    if (limit < 1 || limit > 100) {
      res.status(400).json({ error: 'Limit must be between 1 and 100' });
      return;
    }

    const messages = await chatService.getChatHistory(userIdNum, limit);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Send a message and get response
router.post('/message', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User ID missing' });
      return;
    }

    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      res.status(400).json({ error: 'Invalid user ID format' });
      return;
    }

    const { message } = req.body;

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Message is required and must be a non-empty string' });
      return;
    }
    if (message.length > 500) {
      res.status(400).json({ error: 'Message too long (max 500 characters)' });
      return;
    }

    // Process message and get AI response
    const response = await chatService.processMessage(userIdNum, message);
    res.status(200).json({ response });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router;
