import express from 'express';
import {
  getAllStudios,
  getStudioById,
  createStudio,
  updateStudio,
  deleteStudio,
  getUserStudios
} from '../controllers/studioController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllStudios);
router.get('/:id', getStudioById);

// Protected routes (Challenge 1: JWT HTTPOnly Cookie protection)
router.post('/', authenticateUser, createStudio);
router.put('/:id', authenticateUser, updateStudio);
router.delete('/:id', authenticateUser, deleteStudio);
router.get('/user/:email', authenticateUser, getUserStudios);

export default router;
