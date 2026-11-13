
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";

import Cottage from "@/models/Cottage";
import Booking from "@/models/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export async function GET(request) {
  try {
    // Verify admin access
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access.",
        },
        { status: 401 }
      );
    }

    // Read selected dates
    const { searchParams } = new URL(request.url);

    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");

    if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide valid check-in and check-out dates.",
        },
        { status: 400 }
      );
    }

    // Use UTC midnight to match the existing booking date format
    const checkInDate = new Date(`${checkIn}T00:00:00.000Z`);
    const checkOutDate = new Date(`${checkOut}T00:00:00.000Z`);

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Check-out must be after check-in.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Retrieve all active cottages
    const cottages = await Cottage.find({
      isActive: true,
    })
      .select("name slug price capacity description images")
      .sort({ name: 1 })
      .lean();

    const now = new Date();

    // Find reservations that block the selected date range
    const existingBookings = await Booking.find({
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },

      $or: [
        {
          status: "confirmed",
        },
        {
          status: "pending",
          $or: [
            { paymentDeadline: { $gt: now } },
            { paymentDeadline: null },
          ],
        },
      ],
    })
      .select("cottage checkIn checkOut status paymentDeadline")
      .lean();

    // Collect cottage IDs that are already occupied
    const unavailableCottageIds = new Set(
      existingBookings.map((booking) =>
        String(booking.cottage)
      )
    );

    // Return availability information for each cottage
    const results = cottages.map((cottage) => {
      const isAvailable = !unavailableCottageIds.has(
        String(cottage._id)
      );

      return {
        _id: cottage._id,
        name: cottage.name,
        slug: cottage.slug,
        price: cottage.price,
        capacity: cottage.capacity,
        description: cottage.description,
        images: cottage.images,
        isAvailable,
      };
    });

    return NextResponse.json(
      {
        success: true,
        dates: {
          checkIn,
          checkOut,
        },
        cottages: results,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Front Desk Availability Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to check cottage availability.",
      },
      { status: 500 }
    );
  }
}
