import express from 'express';
import {
  createBooking,
  getUserBookings,
  cancelBooking,
  getStudioBookedSlots
} from '../controllers/bookingController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.get('/slots', getStudioBookedSlots);

router.post('/', authenticateUser, createBooking);
router.get('/user/:email', authenticateUser, getUserBookings);
router.patch('/:id/cancel', authenticateUser, cancelBooking);

export default router;
