
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";

import Cottage from "@/models/Cottage";
import Booking from "@/models/booking";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Cottage slug is required" },
        { status: 400 }
      );
    }

    const cottage = await Cottage.findOne({
      slug,
      isActive: true,
    }).select("_id name");

    if (!cottage) {
      return NextResponse.json(
        { success: false, message: "Cottage not found" },
        { status: 404 }
      );
    }

    const now = new Date();

    // Pending and confirmed bookings block these dates.
    // Rejected and cancelled bookings do not.
    const bookings = await Booking.find({
      cottage: cottage._id,
      status: { $in: ["pending", "confirmed"] },
      checkOut: { $gt: now },
    })
      .select("checkIn checkOut -_id")
      .lean();

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
