
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";

import sendBookingConfirmation from "@/lib/sendBookingConfirmation";
import sendBookingCancellation from "@/lib/sendBookingCancellation";
import sendBookingRejection from "@/lib/sendBookingRejection";

import Cottage from "@/models/Cottage";
import Booking from "@/models/booking";

export async function PATCH(request, { params }) {
  try {
    // 1. Verify administrator authentication
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    // 2. Validate booking ID
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid booking ID." },
        { status: 400 }
      );
    }

    // 3. Validate request body
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    const { status } = body || {};

    const allowedStatuses = [
      "confirmed",
      "rejected",
      "cancelled",
    ];

    if (
      typeof status !== "string" ||
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid booking status." },
        { status: 400 }
      );
    }

    await connectDB();

    // 4. Determine the allowed previous status
    const requiredPreviousStatus =
      status === "cancelled" ? "confirmed" : "pending";

    // 5. Atomically update the booking
    const booking = await Booking.findOneAndUpdate(
      {
        _id: id,
        status: requiredPreviousStatus,
      },
      {
        $set: { status },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // 6. Handle missing bookings and conflicting updates
    if (!booking) {
      const existingBooking = await Booking.exists({ _id: id });

      if (!existingBooking) {
        return NextResponse.json(
          { success: false, message: "Booking not found." },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            "This booking has already been updated or its current status does not allow this action.",
        },
        { status: 409 }
      );
    }

    // 7. Send the appropriate email
    let emailSent = false;

    try {
      await booking.populate("cottage", "name");

      let emailResult;

      if (status === "confirmed") {
        emailResult = await sendBookingConfirmation(booking);
      } else if (status === "cancelled") {
        emailResult = await sendBookingCancellation(booking);
      } else if (status === "rejected") {
        emailResult = await sendBookingRejection(booking);
      }

      emailSent = Boolean(emailResult?.messageId);

      if (emailSent) {
        console.log(
          `Booking ${status} email sent: ${booking._id}`
        );
      }
    } catch (emailError) {
      console.error(
        `Booking ${status} email error:`,
        emailError
      );
    }

    // 8. Return the result
    let message;

    if (status === "confirmed") {
      message = emailSent
        ? "Booking confirmed and confirmation email sent successfully."
        : "Booking confirmed, but the confirmation email could not be sent.";
    } else if (status === "cancelled") {
      message = emailSent
        ? "Booking cancelled and cancellation email sent successfully."
        : "Booking cancelled, but the cancellation email could not be sent.";
    } else {
      message = emailSent
        ? "Booking rejected and notification email sent successfully."
        : "Booking rejected, but the notification email could not be sent.";
    }

    return NextResponse.json({
      success: true,
      message,
      emailSent,
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
