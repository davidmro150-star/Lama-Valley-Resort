
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";

import sendBookingConfirmation from "@/lib/sendBookingConfirmation";
import sendBookingCancellation from "@/lib/sendBookingCancellation";
import sendBookingRejection from "@/lib/sendBookingRejection";

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

    await connectDB();

    // 4. Find booking
    const existingBooking = await Booking.findById(id);

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, message: "Booking not found." },
        { status: 404 }
      );
    }

    // 5. Payment verification action
    if (body?.action === "verify-payment") {
      if (existingBooking.status !== "pending") {
        return NextResponse.json(
          {
            success: false,
            message: "Only pending bookings can have their payment verified.",
          },
          { status: 409 }
        );
      }

      if (existingBooking.paymentStatus !== "submitted") {
        return NextResponse.json(
          {
            success: false,
            message: "This payment is not awaiting verification.",
          },
          { status: 409 }
        );
      }

      if (
        !existingBooking.transactionId ||
        !existingBooking.paymentProof?.publicId ||
        !existingBooking.paymentAmount ||
        existingBooking.paymentAmount <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Payment details or screenshot are incomplete.",
          },
          { status: 400 }
        );
      }

      const adminId = session.user.id || session.user._id;

      const updateFields = {
        paymentStatus: "verified",
        paymentVerifiedAt: new Date(),
      };

      if (
        adminId &&
        mongoose.Types.ObjectId.isValid(adminId)
      ) {
        updateFields.paymentVerifiedBy = adminId;
      }

      // Atomic update prevents duplicate verification
      const booking = await Booking.findOneAndUpdate(
        {
          _id: id,
          status: "pending",
          paymentStatus: "submitted",
        },
        {
          $set: updateFields,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!booking) {
        return NextResponse.json(
          {
            success: false,
            message: "Payment has already been updated. Please refresh.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json({
        success: true,
        message:
          "Payment verified successfully. You can now confirm this booking.",
        booking: {
          id: booking._id.toString(),
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          paymentAmount: booking.paymentAmount,
        },
      });
    }

    // 6. Validate booking status action
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
        { success: false, message: "Invalid booking action." },
        { status: 400 }
      );
    }

    // 7. Determine required previous booking status
    const requiredPreviousStatus =
      status === "cancelled" ? "confirmed" : "pending";

    // IMPORTANT:
    // A booking cannot be confirmed until payment is verified.
    if (
      status === "confirmed" &&
      existingBooking.paymentStatus !== "verified"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please verify the guest's payment before confirming this booking.",
        },
        { status: 400 }
      );
    }

    // 8. Atomically update booking
    const updateQuery = {
      _id: id,
      status: requiredPreviousStatus,
    };

    if (status === "confirmed") {
      updateQuery.paymentStatus = "verified";
    }

    const booking = await Booking.findOneAndUpdate(
      updateQuery,
      {
        $set: { status },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This booking has already been updated or its current status does not allow this action.",
        },
        { status: 409 }
      );
    }

    // 9. Send appropriate email
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

    // 10. Prepare response message
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
        paymentStatus: booking.paymentStatus,
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
