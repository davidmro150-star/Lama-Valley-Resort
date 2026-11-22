
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

async function connectDB() {
  // Reuse an existing healthy connection.
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Remove stale connection references.
  if (mongoose.connection.readyState === 3) {
    cached.conn = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 0,
      })
      .then((mongooseInstance) => {
        console.log(
          "MongoDB Connected:",
          mongooseInstance.connection.name
        );

        return mongooseInstance;
      })
      .catch((error) => {
        cached.conn = null;
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.conn = null;
    cached.promise = null;
    throw error;
  }
}

export default connectDB;
