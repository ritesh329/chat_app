import express from 'express';
import {
  createPersonalChat,
  getPersonalChats,
  getChatMessages,
  sendMessage,
  markMessageRead,
  editMessage,
  deleteMessage,
  addReaction,
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/personal', protect, createPersonalChat);
router.get('/personal', protect, getPersonalChats);
router.get('/:chatId/messages', protect, getChatMessages);
router.post('/message', protect, sendMessage);
router.put('/message/:messageId/read', protect, markMessageRead);
router.put('/message/:messageId', protect, editMessage);
router.delete('/message/:messageId', protect, deleteMessage);
router.post('/message/:messageId/reaction', protect, addReaction);

export default router;