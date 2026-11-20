
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";

import Cottage from "@/models/Cottage";
import Booking from "@/models/booking";

// Get today's date in Bangladesh (YYYY-MM-DD)
function getBangladeshDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    // 1. Validate cottage slug
    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Cottage slug is required",
        },
        { status: 400 }
      );
    }

    // 2. Find active cottage
    const cottage = await Cottage.findOne({
      slug,
      isActive: true,
    }).select("_id name");

    if (!cottage) {
      return NextResponse.json(
        {
          success: false,
          message: "Cottage not found",
        },
        { status: 404 }
      );
    }

    // 3. Get current time and Bangladesh calendar date
    const now = new Date();

    const today = new Date(
      `${getBangladeshDate()}T00:00:00.000Z`
    );

    // 4. Find bookings that currently block availability
    const bookings = await Booking.find({
      cottage: cottage._id,

      // Ignore bookings whose checkout date has already passed
      checkOut: { $gt: today },

      $or: [
        // Confirmed bookings always block their dates
        {
          status: "confirmed",
        },

        // Pending bookings block dates only while
        // their payment deadline is still active
        {
          status: "pending",
          $or: [
            { paymentDeadline: { $gt: now } },
            { paymentDeadline: { $exists: false } },
          ],
        },
      ],
    })
      .select("checkIn checkOut -_id")
      .lean();

    // 5. Return unavailable date ranges
    return NextResponse.json({
      success: true,
      cottage: cottage.name,
      unavailableDates: bookings.map((booking) => ({
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
      })),
    });
  } catch (error) {
    console.error("Availability API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to check availability",
      },
      { status: 500 }
    );
  }
}
