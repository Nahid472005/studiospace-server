import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

export async function toggleWishlist(req, res) {
  try {
    const { studioId } = req.body;
    if (!studioId || !ObjectId.isValid(studioId)) {
      return res.status(400).json({ success: false, message: 'Valid studioId is required.' });
    }

    const db = getDB();
    const user = await db.collection('users').findOne({ email: req.user.email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const wishlist = user.wishlist || [];
    const exists = wishlist.includes(studioId);

    let updatedWishlist;
    let message;

    if (exists) {
      updatedWishlist = wishlist.filter(id => id !== studioId);
      message = 'Studio removed from your saved wishlist.';
    } else {
      updatedWishlist = [...wishlist, studioId];
      message = 'Studio saved to your wishlist!';
    }

    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { wishlist: updatedWishlist, updatedAt: new Date() } }
    );

    return res.status(200).json({
      success: true,
      message,
      saved: !exists,
      wishlist: updatedWishlist
    });
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    return res.status(500).json({ success: false, message: 'Could not update your wishlist.' });
  }
}

export async function getWishlist(req, res) {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ email: req.user.email.toLowerCase() });

    if (!user || !user.wishlist || user.wishlist.length === 0) {
      return res.status(200).json({ success: true, studios: [] });
    }

    const objectIds = user.wishlist.map(id => {
      try {
        return new ObjectId(id);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    const studios = await db.collection('studios').find({ _id: { $in: objectIds } }).toArray();

    return res.status(200).json({
      success: true,
      count: studios.length,
      studios
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve saved studios.' });
  }
}
