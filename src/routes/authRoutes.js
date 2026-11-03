import express from 'express';
import {
  registerUser,
  loginUser,
  googleAuth,
  getMe,
  logoutUser
} from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/me', authenticateUser, getMe);
router.post('/logout', logoutUser);

export default router;
