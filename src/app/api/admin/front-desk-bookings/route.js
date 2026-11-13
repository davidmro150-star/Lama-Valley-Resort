
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";

import Cottage from "@/models/Cottage";
import Booking from "@/models/booking";

import { ApiError, asyncHandler } from "@/lib/apiError";

export const runtime = "nodejs";

function getBangladeshDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

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
  // 1. Verify admin
  const session = await auth();

  if (session?.user?.role !== "admin") {
    throw new ApiError(401, "Unauthorized access.");
  }

  const adminId = session.user.id || session.user._id;

  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new ApiError(401, "Invalid admin account.");
  }

  await connectDB();

  // 2. Read request body
  let body;

  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, "Invalid request body.");
  }

  const {
    cottage: cottageId,
    guestName,
    guestEmail,
    guestPhone,
    checkIn,
    checkOut,
    guests,
    amountReceived = 0,
    paymentMethod,
    paymentReference = "",
    paymentNote = "",
  } = body || {};

  // 3. Validate required information
  if (
    !cottageId ||
    !guestName ||
    !guestPhone ||
    !checkIn ||
    !checkOut ||
    guests === undefined
  ) {
    throw new ApiError(400, "Please provide all required booking information.");
  }

  if (!mongoose.Types.ObjectId.isValid(cottageId)) {
    throw new ApiError(400, "Invalid cottage selection.");
  }

  const name = String(guestName).trim();
  const email = String(guestEmail || "").trim().toLowerCase();
  const phone = String(guestPhone).trim();

  if (name.length < 2 || name.length > 100) {
    throw new ApiError(400, "Please enter a valid guest name.");
  }

  if (email && (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  )) {
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

  // 4. Validate dates
  if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
    throw new ApiError(400, "Please select valid booking dates.");
  }

  if (checkIn < getBangladeshDate()) {
    throw new ApiError(400, "Check-in date cannot be in the past.");
  }

  if (checkOut <= checkIn) {
    throw new ApiError(400, "Check-out must be after check-in.");
  }

  const startDate = new Date(`${checkIn}T00:00:00.000Z`);
  const endDate = new Date(`${checkOut}T00:00:00.000Z`);

  const nights = Math.round(
    (endDate.getTime() - startDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // 5. Validate guest count
  const guestCount = Number(guests);

  if (!Number.isInteger(guestCount) || guestCount < 1) {
    throw new ApiError(400, "Please select a valid number of guests.");
  }

  // 6. Find active cottage
  const cottage = await Cottage.findOne({
    _id: cottageId,
    isActive: true,
  });

  if (!cottage) {
    throw new ApiError(404, "This cottage is currently unavailable.");
  }

  if (guestCount > cottage.capacity) {
    throw new ApiError(
      400,
      `This cottage allows a maximum of ${cottage.capacity} guests.`
    );
  }

  // 7. Calculate booking price on the server
  const totalPrice = Number(cottage.price) * nights;

  if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
    throw new ApiError(400, "Unable to calculate the booking price.");
  }

  // 8. Check cottage availability again
  const now = new Date();

  const overlappingBooking = await Booking.findOne({
    cottage: cottage._id,
    checkIn: { $lt: endDate },
    checkOut: { $gt: startDate },
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
  }).select("_id");

  if (overlappingBooking) {
    throw new ApiError(
      409,
      "This cottage is no longer available for the selected dates."
    );
  }

  // 9. Validate amount actually received
  const receivedAmount = Number(amountReceived);

  if (
    !Number.isFinite(receivedAmount) ||
    receivedAmount < 0 ||
    Math.round(receivedAmount * 100) !== receivedAmount * 100 ||
    receivedAmount > totalPrice
  ) {
    throw new ApiError(400, "Please enter a valid received amount.");
  }

  const allowedMethods = ["cash", "bkash", "nagad", "bank"];

  let paymentRecord = [];

  if (receivedAmount > 0) {
    if (!allowedMethods.includes(paymentMethod)) {
      throw new ApiError(400, "Please select a valid payment method.");
    }

    const reference = String(paymentReference).trim();
    const note = String(paymentNote).trim();

    if (reference.length > 100 || note.length > 300) {
      throw new ApiError(400, "Payment information is too long.");
    }

    paymentRecord = [
      {
        amount: receivedAmount,
        method: paymentMethod,
        reference,
        note,
        paidAt: now,
        recordedBy: adminId,
      },
    ];
  }

  // 10. Create confirmed front-desk booking
  const booking = await Booking.create({
    bookingSource: "front_desk",

    cottage: cottage._id,

    guestName: name,
    guestEmail: email,
    guestPhone: phone,

    checkIn: startDate,
    checkOut: endDate,
    guests: guestCount,

    totalPrice,

    // Front-desk payments are recorded in the payments array.
    // Online advance-payment fields are intentionally not used.
    paymentAmount: 0,
    paymentStatus: "unpaid",

    payments: paymentRecord,

    status: "confirmed",
  });

  // 11. Return booking information
  return NextResponse.json(
    {
      success: true,
      message: "Front-desk booking created successfully.",
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        bookingSource: booking.bookingSource,
        cottage: cottage.name,
        guestName: booking.guestName,
        guestPhone: booking.guestPhone,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        nights,
        totalPrice: booking.totalPrice,
        amountReceived: receivedAmount,
        remainingBalance: totalPrice - receivedAmount,
        paymentStatus: booking.paymentStatus,
        status: booking.status,
      },
    },
    { status: 201 }
  );
});
