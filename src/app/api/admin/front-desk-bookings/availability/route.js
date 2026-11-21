
import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Cottage from "@/models/Cottage";
import Booking from "@/models/booking";

import { authorizeApiRequest } from "@/lib/authorize";
import { PERMISSIONS } from "@/lib/permissions";

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
    // 1. Authorize staff who can view bookings.
    const { response } = await authorizeApiRequest(
      PERMISSIONS.BOOKINGS_VIEW
    );

    if (response) return response;

    // 2. Read selected dates.
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

    // 3. Retrieve active cottages.
    const cottages = await Cottage.find({
      isActive: true,
    })
      .select("name slug price capacity description images")
      .sort({ name: 1 })
      .lean();

    const now = new Date();

    // 4. Find bookings that block the selected date range.
    const existingBookings = await Booking.find({
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
      $or: [
        { status: "confirmed" },
        {
          status: "pending",
          $or: [
            { paymentDeadline: { $gt: now } },
            { paymentDeadline: null },
            { paymentDeadline: { $exists: false } },
          ],
        },
      ],
    })
      .select("cottage checkIn checkOut status paymentDeadline")
      .lean();

    // 5. Collect unavailable cottage IDs.
    const unavailableCottageIds = new Set(
      existingBookings.map((booking) => String(booking.cottage))
    );

    // 6. Return cottage availability.
    const results = cottages.map((cottage) => {
      const isAvailable = !unavailableCottageIds.has(
        String(cottage._id)
      );

      return {
        _id: String(cottage._id),
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
