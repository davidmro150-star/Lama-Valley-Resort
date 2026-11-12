
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";

import Cottage from "@/models/Cottage";
import Booking from "@/models/booking";
import BookingSettings from "@/models/BookingSettings";

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
    paymentMethod,
    paymentAmount,
    transactionId,
    paymentProof,
  } = body || {};

  // 1. Validate required booking information
  if (
    !cottageSlug ||
    !guestName ||
    !guestEmail ||
    !guestPhone ||
    !checkIn ||
    !checkOut ||
    guests === undefined
  ) {
    throw new ApiError(400, "Please provide all required booking information.");
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
    throw new ApiError(400, "Please select a valid number of guests.");
  }

  // 5. Load admin booking settings
  const settings = await BookingSettings.findOne().lean();

  if (!settings || settings.bookingEnabled !== true) {
    throw new ApiError(
      403,
      "Online booking is currently unavailable. Please contact the resort."
    );
  }

  const advancePercentage = settings.advancePercentage;

  if (![30, 50].includes(advancePercentage)) {
    throw new ApiError(500, "Booking payment settings are incomplete.");
  }

  // 6. Validate selected payment method
  const method = paymentMethod;

  if (!["bkash", "nagad", "bank"].includes(method)) {
    throw new ApiError(400, "Please select a valid payment method.");
  }

  const methodSettings = settings.paymentMethods?.[method];

  if (!methodSettings?.enabled) {
    throw new ApiError(
      400,
      "This payment method is currently unavailable."
    );
  }

  const hasAccountDetails =
    method === "bank"
      ? Boolean(
          methodSettings.bankName &&
          methodSettings.accountName &&
          methodSettings.accountNumber
        )
      : Boolean(
          methodSettings.accountName &&
          methodSettings.accountNumber
        );

  if (!hasAccountDetails) {
    throw new ApiError(
      503,
      "The selected payment method is not configured yet."
    );
  }

  // 7. Validate payment information
  const amount = Number(paymentAmount);
  const reference = String(transactionId || "").trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, "Please enter a valid payment amount.");
  }

  if (reference.length < 4 || reference.length > 100) {
    throw new ApiError(400, "Please enter a valid transaction ID.");
  }

  if (
    !paymentProof ||
    typeof paymentProof.publicId !== "string" ||
    !paymentProof.publicId.startsWith(
      "lama-valley-resort/payment-proofs/payment-"
    )
  ) {
    throw new ApiError(400, "Please upload your payment screenshot.");
  }

  // 8. Find the cottage
  const cottage = await Cottage.findOne({
    slug: cottageSlug,
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

  // 9. Calculate total price on the server
  const startDate = new Date(`${checkIn}T00:00:00.000Z`);
  const endDate = new Date(`${checkOut}T00:00:00.000Z`);

  const nights = Math.round(
    (endDate.getTime() - startDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const totalPrice = cottage.price * nights;

  if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
    throw new ApiError(400, "Unable to calculate the booking price.");
  }

  // 10. Calculate the required advance payment
  const requiredAdvance = Math.round(
    (totalPrice * advancePercentage) / 100
  );

  if (amount !== requiredAdvance) {
    throw new ApiError(
      400,
      `The required advance payment is ৳${requiredAdvance}.`
    );
  }

  // Validate uploaded screenshot metadata
  const proofFormat = String(paymentProof.format || "").toLowerCase();
  const proofBytes = Number(paymentProof.bytes);

  if (
    !["jpg", "jpeg", "png", "webp"].includes(proofFormat) ||
    !Number.isInteger(proofBytes) ||
    proofBytes <= 0 ||
    proofBytes > 5 * 1024 * 1024
  ) {
    throw new ApiError(400, "Invalid payment screenshot information.");
  }

  // 11. Check for overlapping bookings
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
          { paymentDeadline: { $exists: false } },
        ],
      },
    ],
  }).select("_id");

  if (overlappingBooking) {
    throw new ApiError(
      409,
      "These dates are no longer available. Please select different dates."
    );
  }

  // 12. Calculate payment deadline
  const deadlineHours = Number(settings.paymentDeadlineHours);

  if (
    !Number.isInteger(deadlineHours) ||
    deadlineHours < 1 ||
    deadlineHours > 48
  ) {
    throw new ApiError(500, "Booking payment deadline is not configured correctly.");
  }

  const paymentDeadline = new Date(
    now.getTime() + deadlineHours * 60 * 60 * 1000
  );

  // 13. Create pending booking with submitted payment
  const booking = await Booking.create({
    cottage: cottage._id,
    guestName: name,
    guestEmail: email,
    guestPhone: phone,
    checkIn: startDate,
    checkOut: endDate,
    guests: guestCount,
    totalPrice,

    advancePercentage,
    paymentAmount: requiredAdvance,
    paymentMethod: method,
    transactionId: reference,

    paymentProof: {
      publicId: paymentProof.publicId,
      format: proofFormat,
      bytes: proofBytes,
    },

    paymentStatus: "submitted",
    paymentDeadline,

    status: "pending",
  });

  // 14. Return booking and payment information
  return NextResponse.json(
    {
      success: true,
      message: "Your booking request and payment details have been submitted successfully.",
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        cottage: cottage.name,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        nights,
        totalPrice: booking.totalPrice,
        advancePercentage,
        paymentAmount: booking.paymentAmount,
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
        paymentDeadline: booking.paymentDeadline,
        status: booking.status,
      },
    },
    { status: 201 }
  );
});
