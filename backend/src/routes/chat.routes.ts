import { Router } from 'express';
import { ChatService } from '../services/chat.service';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const chatService = ChatService.getInstance();

// Get chat history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const messages = await chatService.getChatHistory(userId, limit);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Send a message and get response
router.post('/message', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await chatService.processMessage(userId, message);
    res.json({ response });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router;