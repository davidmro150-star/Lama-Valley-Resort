
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";
import RestaurantOrder from "@/models/RestaurantOrder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const money = (value) =>
  Math.round((Number(value) || 0) * 100) / 100;

const sumPayments = (payments = []) =>
  payments.reduce(
    (total, payment) => total + money(payment.amount),
    0
  );

export async function POST(request, { params }) {
  try {
    // 1. Verify admin access
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const adminId = session.user.id || session.user._id;

    if (!adminId) {
      return NextResponse.json(
        { success: false, message: "Admin account ID not found." },
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

    await connectDB();

    // 3. Find booking
    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found." },
        { status: 404 }
      );
    }

    if (booking.status !== "confirmed") {
      return NextResponse.json(
        {
          success: false,
          message: "Only confirmed bookings can be checked out.",
        },
        { status: 400 }
      );
    }

    if (booking.checkoutStatus === "checked_out") {
      return NextResponse.json(
        {
          success: false,
          message: "This guest has already checked out.",
        },
        { status: 409 }
      );
    }

    // 4. Find all non-cancelled restaurant orders
    const restaurantOrders = await RestaurantOrder.find({
      booking: booking._id,
      orderStatus: { $ne: "cancelled" },
    })
      .select("total payments")
      .lean();

    // 5. Calculate cottage payments received
    const verifiedAdvance =
      booking.paymentStatus === "verified"
        ? money(booking.paymentAmount)
        : 0;

    const additionalBookingPayments = sumPayments(
      booking.payments
    );

    // 6. Calculate direct restaurant payments
    const directRestaurantPayments = restaurantOrders.reduce(
      (total, order) =>
        total + sumPayments(order.payments),
      0
    );

    // Checkout allocations are NOT counted separately.
    // They reference payments already recorded against the booking.

    // 7. Calculate combined bill and outstanding balance
    const cottageTotal = money(booking.totalPrice);

    const restaurantTotal = restaurantOrders.reduce(
      (total, order) => total + money(order.total),
      0
    );

    const grandTotal = money(
      cottageTotal + restaurantTotal
    );

    const totalReceived = money(
      verifiedAdvance +
        additionalBookingPayments +
        directRestaurantPayments
    );

    const remainingBalance = money(
      Math.max(grandTotal - totalReceived, 0)
    );

    // 8. Prevent checkout if any amount remains unpaid
    if (remainingBalance > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Checkout cannot be completed. Outstanding balance: ৳${remainingBalance.toLocaleString("en-BD")}.`,
          financialSummary: {
            cottageTotal,
            restaurantTotal,
            grandTotal,
            totalReceived,
            remainingBalance,
          },
        },
        { status: 400 }
      );
    }

    // 9. Complete guest checkout
    const checkedOutAt = new Date();

    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        status: "confirmed",
        checkoutStatus: { $ne: "checked_out" },
      },
      {
        $set: {
          checkoutStatus: "checked_out",
          checkedOutAt,
          checkedOutBy: adminId,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedBooking) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Checkout could not be completed. Please refresh and check the booking status.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Guest checkout completed successfully.",
      checkout: {
        checkoutStatus: updatedBooking.checkoutStatus,
        checkedOutAt: updatedBooking.checkedOutAt,
        financialSummary: {
          cottageTotal,
          restaurantTotal,
          grandTotal,
          totalReceived,
          remainingBalance,
        },
      },
    });
  } catch (error) {
    console.error("Guest checkout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while completing guest checkout.",
      },
      { status: 500 }
    );
  }
}
