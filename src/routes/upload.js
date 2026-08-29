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

// ============ FILE UPLOAD ROUTES ============

// Single file upload
router.post('/single', protect, uploadSingle, uploadFile);

// Multiple files upload (max 5)
router.post('/multiple', protect, uploadMultiple, uploadMultipleFiles);

// Delete file
router.delete('/:messageId', protect, deleteFile);

// Get file info
router.get('/:messageId', protect, getFileInfo);

export default router;