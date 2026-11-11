import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

export async function createBooking(req, res) {
  try {
    const {
      studioId,
      date,
      startTime,
      endTime,
      notes
    } = req.body;

    if (!studioId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Studio ID, Date, Start Time, and End Time.'
      });
    }

    if (!ObjectId.isValid(studioId)) {
      return res.status(400).json({ success: false, message: 'Invalid Studio ID.' });
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (endMinutes <= startMinutes) {
      return res.status(400).json({
        success: false,
        message: 'End time must be later than start time.'
      });
    }

    const db = getDB();

    const studio = await db.collection('studios').findOne({ _id: new ObjectId(studioId) });
    if (!studio) {
      return res.status(404).json({ success: false, message: 'Studio workspace not found.' });
    }

    const existingBookings = await db.collection('bookings').find({
      studioId: studio._id.toString(),
      date: date,
      status: { $in: ['Confirmed', 'Pending'] }
    }).toArray();

    const collision = existingBookings.find(b => {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return startMinutes < bEnd && endMinutes > bStart;
    });

    if (collision) {
      return res.status(409).json({
        success: false,
        message: `Time Slot Collision: The studio is already booked from ${collision.startTime} to ${collision.endTime} on ${date}. Please choose a different slot.`,
        collision: {
          startTime: collision.startTime,
          endTime: collision.endTime,
          status: collision.status
        }
      });
    }

    const totalHours = Number(((endMinutes - startMinutes) / 60).toFixed(2));
    const subtotal = Math.round(totalHours * studio.hourlyRate);
    const securityDeposit = Number(studio.securityDeposit || 0);
    const totalPrice = subtotal + securityDeposit;

    const newBooking = {
      studioId: studio._id.toString(),
      studioTitle: studio.title,
      studioImage: studio.image || (studio.images && studio.images[0]),
      category: studio.category,
      location: studio.location,
      hourlyRate: studio.hourlyRate,
      userEmail: req.user.email.toLowerCase(),
      userName: req.user.name || 'Creative Guest',
      userAvatar: req.user.photoURL,
      date,
      startTime,
      endTime,
      totalHours,
      subtotal,
      securityDeposit,
      totalPrice,
      notes: notes || '',
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('bookings').insertOne(newBooking);

    return res.status(201).json({
      success: true,
      message: 'Workspace reservation request submitted successfully!',
      bookingId: result.insertedId,
      booking: { ...newBooking, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ success: false, message: 'Server error while processing studio booking.' });
  }
}

export async function getUserBookings(req, res) {
  try {
    const email = (req.params.email || req.user.email).toLowerCase();
    const db = getDB();

    const bookings = await db.collection('bookings')
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    return res.status(500).json({ success: false, message: 'Could not load your reservations.' });
  }
}

export async function cancelBooking(req, res) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Booking ID format.' });
    }

    const db = getDB();
    const booking = await db.collection('bookings').findOne({ _id: new ObjectId(id) });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    if (booking.userEmail !== req.user.email.toLowerCase() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only cancel your own bookings.' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'This booking is already cancelled.' });
    }

    if (booking.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Completed bookings cannot be cancelled.' });
    }

    await db.collection('bookings').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'Cancelled', updatedAt: new Date(), cancelledAt: new Date() } }
    );

    return res.status(200).json({
      success: true,
      message: 'Booking has been cancelled successfully.'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ success: false, message: 'Server error while cancelling reservation.' });
  }
}

export async function getStudioBookedSlots(req, res) {
  try {
    const { studioId, date } = req.query;
    if (!studioId || !date) {
      return res.status(400).json({ success: false, message: 'studioId and date are required.' });
    }

    const db = getDB();
    const bookedSlots = await db.collection('bookings').find(
      {
        studioId,
        date,
        status: { $in: ['Pending', 'Confirmed'] }
      },
      {
        projection: { startTime: 1, endTime: 1, status: 1 }
      }
    ).toArray();

    return res.status(200).json({
      success: true,
      bookedSlots
    });
  } catch (error) {
    console.error('Get booked slots error:', error);
    return res.status(500).json({ success: false, message: 'Failed to check studio availability.' });
  }
}
