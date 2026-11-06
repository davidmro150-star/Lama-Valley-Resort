
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";

import sendBookingConfirmation from "@/lib/sendBookingConfirmation";
import Booking from "@/models/booking";

export async function PATCH(request, { params }) {
  try {
    // 1. Verify admin authentication
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access.",
        },
        { status: 401 }
      );
    }

    // 2. Validate booking ID
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking ID.",
        },
        { status: 400 }
      );
    }

    // 3. Validate requested status
    const body = await request.json();
    const { status } = body;

    if (!["confirmed", "rejected", "cancelled"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking status.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // 4. Find booking
    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    // 5. Validate status transitions
    if (booking.status === "pending") {
      if (!["confirmed", "rejected"].includes(status)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Pending bookings can only be confirmed or rejected.",
          },
          { status: 400 }
        );
      }

      // Check booking expiry
      if (
        status === "confirmed" &&
        booking.expiresAt &&
        booking.expiresAt <= new Date()
      ) {
        booking.status = "expired";
        await booking.save();

        return NextResponse.json(
          {
            success: false,
            message:
              "This booking has expired and cannot be confirmed.",
          },
          { status: 409 }
        );
      }
    } else if (booking.status === "confirmed") {
      if (status !== "cancelled") {
        return NextResponse.json(
          {
            success: false,
            message: "Confirmed bookings can only be cancelled.",
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "This booking can no longer be updated.",
        },
        { status: 409 }
      );
    }

    // 6. Update booking status
    booking.status = status;
    await booking.save();

    // 7. Send email only when booking is confirmed
    if (status === "confirmed") {
      let emailSent = false;

      try {
        await booking.populate("cottage", "name");

        const emailResult = await sendBookingConfirmation(booking);

        emailSent = Boolean(emailResult?.messageId);

        if (emailSent) {
          console.log(
            `Booking confirmation email sent: ${booking._id}`
          );
        }
      } catch (emailError) {
        console.error(
          "Booking confirmation email error:",
          emailError
        );
      }

      return NextResponse.json({
        success: true,
        message: emailSent
          ? "Booking confirmed and confirmation email sent successfully."
          : "Booking confirmed, but the confirmation email could not be sent.",
        emailSent,
        booking: {
          id: booking._id.toString(),
          status: booking.status,
        },
      });
    }

    // 8. Return response for rejection or cancellation
    return NextResponse.json({
      success: true,
      message: `Booking ${status} successfully.`,
      booking: {
        id: booking._id.toString(),
        status: booking.status,
      },
    });
  } catch (error) {
    console.error("Admin booking update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update booking. Please try again.",
      },
      { status: 500 }
    );
  }
}
