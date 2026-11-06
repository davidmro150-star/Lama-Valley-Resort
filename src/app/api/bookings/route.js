
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";

import Cottage from "@/models/Cottage";
import Booking from "@/models/booking";

import { ApiError, asyncHandler } from "@/lib/apiError";

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

export const POST = asyncHandler(async (request) => {
  await connectDB();

  let body;

  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, "Invalid request body.");
  }

  const {
    cottage: cottageSlug,
    guestName,
    guestEmail,
    guestPhone,
    checkIn,
    checkOut,
    guests,
  } = body || {};

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
    throw new ApiError(
      400,
      "Please provide all required information."
    );
  }

  // 2. Validate guest information
  const name = String(guestName).trim();
  const email = String(guestEmail).trim().toLowerCase();
  const phone = String(guestPhone).trim();

  if (name.length < 2 || name.length > 100) {
    throw new ApiError(400, "Please enter a valid guest name.");
  }

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new ApiError(400, "Please enter a valid email address.");
  }

  const phoneDigits = phone.replace(/\D/g, "");

  if (
    phone.length > 25 ||
    phoneDigits.length < 7 ||
    phoneDigits.length > 15
  ) {
    throw new ApiError(400, "Please enter a valid phone number.");
  }

  // 3. Validate dates
  if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
    throw new ApiError(400, "Please select valid booking dates.");
  }

  if (checkIn < getBangladeshDate()) {
    throw new ApiError(400, "Check-in date cannot be in the past.");
  }

  if (checkOut <= checkIn) {
    throw new ApiError(400, "Check-out must be after check-in.");
  }

  // 4. Validate guest count
  const guestCount = Number(guests);

  if (!Number.isInteger(guestCount) || guestCount < 1) {
    throw new ApiError(
      400,
      "Please select a valid number of guests."
    );
  }

  // 5. Find the cottage
  const cottage = await Cottage.findOne({
    slug: cottageSlug,
    isActive: true,
  });

  if (!cottage) {
    throw new ApiError(
      404,
      "This cottage is currently unavailable."
    );
  }

  if (guestCount > cottage.capacity) {
    throw new ApiError(
      400,
      `This cottage allows a maximum of ${cottage.capacity} guests.`
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

  // 7. Check for overlapping pending or confirmed bookings
  const overlappingBooking = await Booking.findOne({
    cottage: cottage._id,
    checkIn: { $lt: endDate },
    checkOut: { $gt: startDate },
    status: { $in: ["pending", "confirmed"] },
  });

  if (overlappingBooking) {
    throw new ApiError(
      409,
      "These dates are no longer available. Please select different dates."
    );
  }

  // 8. Create a pending booking without automatic expiry
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
  });

  // 9. Return booking details
  return NextResponse.json(
    {
      success: true,
      message: "Your booking request has been submitted successfully.",
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        cottage: cottage.name,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        nights,
        totalPrice: booking.totalPrice,
        status: booking.status,
      },
    },
    { status: 201 }
  );
});
