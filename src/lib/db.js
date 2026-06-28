import mongoose from 'mongoose'
import dns from 'dns'

// Many ISPs/routers silently drop SRV-type DNS queries — this is almost
// always the real cause of long mongodb+srv:// connection hangs.
dns.setServers(['8.8.8.8', '1.1.1.1'])

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local')
}

let cached = global.mongoose
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
      .then((m) => m)
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null // don't let a failed attempt poison future requests
    throw err
  }

  return cached.conn
}

export default connectDB