
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const MANAGER_NAME = "Resort Manager";
const MANAGER_EMAIL = "manager@lamavalley.com";

async function createManager() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env.local");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to:", mongoose.connection.name);

    const users = mongoose.connection.collection("users");

    const existingUser = await users.findOne({
      email: MANAGER_EMAIL,
    });

    if (existingUser) {
      console.log("This email already exists. No account created.");
      return;
    }

    const temporaryPassword = crypto.randomBytes(18).toString("base64url");
    const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

    const now = new Date();

    await users.insertOne({
      name: MANAGER_NAME,
      email: MANAGER_EMAIL,
      password: hashedPassword,
      role: "manager",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    console.log("\nManager account created successfully!");
    console.log("Email:", MANAGER_EMAIL);
    console.log("Temporary password:", temporaryPassword);
    console.log("\nSave this password securely.");
  } catch (error) {
    console.error("Manager creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createManager();
