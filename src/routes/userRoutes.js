import express from 'express';
import { toggleWishlist, getWishlist } from '../controllers/userController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/wishlist', authenticateUser, toggleWishlist);
router.get('/wishlist', authenticateUser, getWishlist);

export default router;
