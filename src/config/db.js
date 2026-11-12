import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/StudioSpace';

let client;
let db;
export let lastDbError = null;

export async function connectDB() {
  if (db) return db;

  const currentUri = process.env.MONGODB_URI || uri;

  if (!currentUri || currentUri.includes('localhost') || currentUri.includes('<YOUR_PASSWORD>') || currentUri.includes('<db_password>')) {
    const warnMsg = !currentUri ? 'MONGODB_URI environment variable is not defined.' : (currentUri.includes('localhost') ? 'MONGODB_URI is falling back to localhost.' : 'Password placeholder detected in MONGODB_URI.');
    console.warn('\n⚠️ [MongoDB Warning]:', warnMsg);
    lastDbError = warnMsg;
    return null;
  }

  try {
    client = new MongoClient(currentUri, {
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
    lastDbError = null;
    console.log('✅ MongoDB Connected successfully to StudioSpace database');
    console.log('✅ MongoDB Connected successfully to StudioSpace database');

    try {
      await db.collection('studios').createIndex({ category: 1 });
      await db.collection('studios').createIndex({ hostEmail: 1 });
      await db.collection('studios').createIndex({ hourlyRate: 1 });
      await db.collection('studios').createIndex({ title: 'text', overview: 'text', location: 'text' });
      await db.collection('bookings').createIndex({ studioId: 1, date: 1 });
      await db.collection('bookings').createIndex({ userEmail: 1 });
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
    } catch (idxErr) {
    }

    return db;
  } catch (error) {
    lastDbError = error.message;
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
