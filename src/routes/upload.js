import express from 'express';
import { 
  uploadFile, 
  uploadMultipleFiles,
  deleteFile,
  getFileInfo 
} from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import { uploadSingle, uploadMultiple } from '../middleware/upload.js';

const router = express.Router();


router.post('/single', protect, uploadSingle, uploadFile);


router.post('/multiple', protect, uploadMultiple, uploadMultipleFiles);


router.delete('/:messageId', protect, deleteFile);


router.get('/:messageId', protect, getFileInfo);

export default router;