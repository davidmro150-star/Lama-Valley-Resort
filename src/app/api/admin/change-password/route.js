
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

const ALLOWED_ROLES = ["admin", "manager"];
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    if (!ALLOWED_ROLES.includes(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to change passwords.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Please provide all password fields." },
        { status: 400 }
      );
    }

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    if (
      currentPassword.length > MAX_PASSWORD_LENGTH ||
      newPassword.length > MAX_PASSWORD_LENGTH
    ) {
      return NextResponse.json(
        { success: false, message: "Password cannot exceed 128 characters." },
        { status: 400 }
      );
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New password and confirmation do not match.",
        },
        { status: 400 }
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Your new password must be different from your current password.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select("+password");

    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is unavailable.",
        },
        { status: 404 }
      );
    }

    if (!ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to change passwords.",
        },
        { status: 403 }
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Your current password is incorrect.",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    user.passwordChangedAt = new Date();

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
