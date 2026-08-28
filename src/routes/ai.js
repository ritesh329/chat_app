import express from 'express';
import {
  getPersonalAIResponse,
  getGroupMentionResponse,
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/personal', protect, getPersonalAIResponse);
router.post('/group/mention', protect, getGroupMentionResponse);

export default router;