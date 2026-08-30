// import express from 'express';
// import {
//   createGroup,
//   getGroups,
//   getGroupById,
//   addMember,
//   removeMember,
//   toggleAIMode,
// } from '../controllers/groupController.js';
// import { protect } from '../middleware/auth.js';

// const router = express.Router();

// router.post('/', protect, createGroup);
// router.get('/', protect, getGroups);
// router.get('/:groupId', protect, getGroupById);
// router.post('/:groupId/member', protect, addMember);
// router.delete('/:groupId/member/:userId', protect, removeMember);
// router.put('/:groupId/ai-mode', protect, toggleAIMode);

// export default router;

import express from 'express';

import {
  createGroup,
  getGroups,
  getGroupById,
  getGroupMessages,
  addMember,
  removeMember,
  toggleAIMode,
} from '../controllers/groupController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createGroup);

router.get('/', protect, getGroups);

// Get complete group chat messages
router.get('/:groupId/messages', protect, getGroupMessages);

router.get('/:groupId', protect, getGroupById);

router.post('/:groupId/member', protect, addMember);

router.delete('/:groupId/member/:userId', protect, removeMember);

router.put('/:groupId/ai-mode', protect, toggleAIMode);

export default router;