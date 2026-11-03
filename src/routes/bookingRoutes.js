import express from 'express';
import {
  createBooking,
  getUserBookings,
  cancelBooking,
  getStudioBookedSlots
} from '../controllers/bookingController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Availability check (can be public so calendar/modal can show occupied slots)
router.get('/slots', getStudioBookedSlots);

// Protected routes (Challenge 1 & Challenge 2)
router.post('/', authenticateUser, createBooking);
router.get('/user/:email', authenticateUser, getUserBookings);
router.patch('/:id/cancel', authenticateUser, cancelBooking);

export default router;
