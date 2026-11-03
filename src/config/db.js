import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/StudioSpace';

let client;
let db;

export async function connectDB() {
  if (db) return db;

  if (uri.includes('<YOUR_PASSWORD>') || uri.includes('<db_password>')) {
    console.warn('\n⚠️ [MongoDB Warning]: Please replace <YOUR_PASSWORD> with your actual MongoDB Atlas password in server/.env');
    return null;
  }

  try {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
      },
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    db = client.db('StudioSpace');
    console.log('✅ MongoDB Connected successfully to StudioSpace database');

    // Create required indexes
    try {
      await db.collection('studios').createIndex({ category: 1 });
      await db.collection('studios').createIndex({ hostEmail: 1 });
      await db.collection('studios').createIndex({ hourlyRate: 1 });
      await db.collection('studios').createIndex({ title: 'text', overview: 'text', location: 'text' });
      await db.collection('bookings').createIndex({ studioId: 1, date: 1 });
      await db.collection('bookings').createIndex({ userEmail: 1 });
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
    } catch (idxErr) {
      console.log('Index note:', idxErr.message);
    }

    return db;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    return null;
  }
}

export function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Please ensure MongoDB is connected.');
  }
  return db;
}

export async function closeDB() {
  if (client) {
    await client.close();
    db = null;
    console.log('MongoDB connection closed.');
  }
}
