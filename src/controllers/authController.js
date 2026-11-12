import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'studiospace_super_secure_jwt_secret_key_2026_xyz';
const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

export async function registerUser(req, res) {
  try {
    const { name, email, photoURL, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must contain at least one uppercase letter.' });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must contain at least one lowercase letter.' });
    }

    const db = getDB();
    const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      name,
      email: email.toLowerCase(),
      photoURL: photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      passwordHash,
      role: 'creator',
      wishlist: [],
      createdAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Please log in.',
      userId: result.insertedId
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error while registering user.' });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const db = getDB();
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      photoURL: user.photoURL,
      role: user.role || 'creator'
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('studiospace_token', token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: 'Welcome back to StudioSpace!',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role || 'creator'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error while logging in.' });
  }
}

export async function googleAuth(req, res) {
  try {
    const { email, name, photoURL } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required for Google authentication.' });
    }

    const db = getDB();
    const normalizedEmail = email.toLowerCase();
    let user = await db.collection('users').findOne({ email: normalizedEmail });

    if (!user) {
      const newUser = {
        name: name || email.split('@')[0],
        email: normalizedEmail,
        photoURL: photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}`,
        provider: 'google',
        role: 'creator',
        wishlist: [],
        createdAt: new Date()
      };
      const result = await db.collection('users').insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else {
      if (photoURL && photoURL !== user.photoURL) {
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: { photoURL, updatedAt: new Date() } }
        );
        user.photoURL = photoURL;
      }
    }

    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      photoURL: user.photoURL,
      role: user.role || 'creator'
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('studiospace_token', token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: 'Google authentication successful!',
      token,
      user: tokenPayload
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    return res.status(500).json({ success: false, message: 'Google authentication failed on server.' });
  }
}

export async function getMe(req, res) {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne(
      { email: req.user.email.toLowerCase() },
      { projection: { passwordHash: 0 } }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role || 'creator',
        wishlist: user.wishlist || []
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ success: false, message: 'Could not fetch current profile.' });
  }
}

export async function logoutUser(req, res) {
  res.clearCookie('studiospace_token', COOKIE_OPTIONS);
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
}
