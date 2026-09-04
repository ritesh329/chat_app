import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  logout,
  getAllUsers 
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();


router.post('/register', register);
router.post('/login', login);

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.get('/users', protect, getAllUsers);  

export default router;