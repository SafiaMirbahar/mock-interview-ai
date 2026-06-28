import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000, // fail fast instead of hanging 30-50s
      })
      .then((mongoose) => mongoose)
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null // clear the poisoned promise so the next request can retry fresh
    throw err
  }

  return cached.conn
}

export default connectDB