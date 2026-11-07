
import bcrypt from "bcryptjs";

import connectDB from "../lib/mongodb.js";
import User from "../models/User.js";

async function checkAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD is missing.");
    }

    await connectDB();

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      console.log("Admin account: NOT FOUND");
      process.exitCode = 1;
      return;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    const isValidAdmin =
      user.role === "admin" &&
      user.isActive === true &&
      passwordMatches;

    console.log("Account found:", true);
    console.log("Role:", user.role);
    console.log("Active:", user.isActive);
    console.log("Password matches:", passwordMatches);
    console.log("Valid admin account:", isValidAdmin);

    if (!isValidAdmin) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("Verification failed:", error.message);
    process.exitCode = 1;
  } finally {
    const mongoose = await import("mongoose");

    if (mongoose.default.connection.readyState !== 0) {
      await mongoose.default.connection.close();
    }
  }
}

checkAdmin();
