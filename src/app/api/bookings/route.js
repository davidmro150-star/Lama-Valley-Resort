
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";

import Cottage from "@/models/Cottage";
import Booking from "@/models/booking";

// Get today's date in Bangladesh
function getBangladeshDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Validate YYYY-MM-DD and reject impossible dates
function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      cottage: cottageSlug,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      guests,
    } = body;

    // 1. Validate required fields
    if (
      !cottageSlug ||
      !guestName ||
      !guestEmail ||
      !guestPhone ||
      !checkIn ||
      !checkOut ||
      guests === undefined
    ) {
      return NextResponse.json(
        { success: false, message: "Please provide all required information." },
        { status: 400 }
      );
    }

    // 2. Validate guest information
    const name = String(guestName).trim();
    const email = String(guestEmail).trim().toLowerCase();
    const phone = String(guestPhone).trim();

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid guest name." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const phoneDigits = phone.replace(/\D/g, "");

    if (
      phone.length > 25 ||
      phoneDigits.length < 7 ||
      phoneDigits.length > 15
    ) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    // 3. Validate dates
    if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
      return NextResponse.json(
        { success: false, message: "Please select valid booking dates." },
        { status: 400 }
      );
    }

    if (checkIn < getBangladeshDate()) {
      return NextResponse.json(
        { success: false, message: "Check-in date cannot be in the past." },
        { status: 400 }
      );
    }

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { success: false, message: "Check-out must be after check-in." },
        { status: 400 }
      );
    }

    // 4. Validate guest count
    const guestCount = Number(guests);

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return NextResponse.json(
        { success: false, message: "Please select a valid number of guests." },
        { status: 400 }
      );
    }

    // 5. Find the cottage
    const cottage = await Cottage.findOne({
      slug: cottageSlug,
      isActive: true,
    });

    if (!cottage) {
      return NextResponse.json(
        { success: false, message: "This cottage is currently unavailable." },
        { status: 404 }
      );
    }

    if (guestCount > cottage.capacity) {
      return NextResponse.json(
        {
          success: false,
          message: `This cottage allows a maximum of ${cottage.capacity} guests.`,
        },
        { status: 400 }
      );
    }

    // 6. Calculate price on the server
    const startDate = new Date(`${checkIn}T00:00:00.000Z`);
    const endDate = new Date(`${checkOut}T00:00:00.000Z`);

    const nights = Math.round(
      (endDate.getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const totalPrice = cottage.price * nights;

    // 7. Check for overlapping active bookings
    const now = new Date();

    const overlappingBooking = await Booking.findOne({
      cottage: cottage._id,
      checkIn: { $lt: endDate },
      checkOut: { $gt: startDate },
      $or: [
        { status: "confirmed" },
        {
          status: "pending",
          expiresAt: { $gt: now },
        },
      ],
    });

    if (overlappingBooking) {
      return NextResponse.json(
        {
          success: false,
          message: "These dates are no longer available. Please select different dates.",
        },
        { status: 409 }
      );
    }

    // 8. Create a pending booking with a 15-minute hold
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    const booking = await Booking.create({
      cottage: cottage._id,
      guestName: name,
      guestEmail: email,
      guestPhone: phone,
      checkIn: startDate,
      checkOut: endDate,
      guests: guestCount,
      totalPrice,
      status: "pending",
      paymentStatus: "unpaid",
      expiresAt,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your booking request has been submitted successfully.",
        booking: {
          id: booking._id,
          cottage: cottage.name,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          guests: booking.guests,
          nights,
          totalPrice: booking.totalPrice,
          status: booking.status,
          expiresAt: booking.expiresAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking submission error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit your booking. Please try again.",
      },
      { status: 500 }
    );
  }
}
