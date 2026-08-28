import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  logout,
  getAllUsers  // Add this
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.get('/users', protect, getAllUsers);  // Add this line

export default router;