
import connectDB from "@/lib/mongodb";

import Booking from "@/models/booking";
import Cottage from "@/models/Cottage";

import { ApiError, asyncHandler } from "@/lib/apiError";

export const dynamic = "force-dynamic";

export const POST = asyncHandler(async (request) => {
  await connectDB();

  let body;

  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, "Invalid request body.");
  }

  const { bookingReference, guestEmail } = body || {};

  // 1. Validate required fields
  if (!bookingReference || !guestEmail) {
    throw new ApiError(
      400,
      "Please provide your booking reference and email address."
    );
  }

  // 2. Normalize input
  const reference = String(bookingReference).trim().toUpperCase();
  const email = String(guestEmail).trim().toLowerCase();

  // 3. Validate booking reference
  if (!/^LV-\d{4}-[A-F0-9]{8}$/.test(reference)) {
    throw new ApiError(400, "Please enter a valid booking reference.");
  }

  // 4. Validate email
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new ApiError(400, "Please enter a valid email address.");
  }

  // 5. Find booking
  const booking = await Booking.findOne({
    bookingReference: reference,
    guestEmail: email,
  })
    .select(
      "bookingReference guestName guestEmail cottage checkIn checkOut guests totalPrice status paymentStatus createdAt"
    )
    .populate("cottage", "name")
    .lean();

  if (!booking) {
    throw new ApiError(
      404,
      "No booking found with the provided reference and email."
    );
  }

  // 6. Calculate nights
  const nights = Math.max(
    0,
    Math.round(
      (new Date(booking.checkOut).getTime() -
        new Date(booking.checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  // 7. Return booking details
  return Response.json(
    {
      success: true,
      message: "Booking details retrieved successfully.",

      booking: {
        bookingReference: booking.bookingReference,
        guestName: booking.guestName,
        cottage: booking.cottage?.name || "Cottage unavailable",
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        nights,
        totalPrice: booking.totalPrice,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt,
      },
    },
    { status: 200 }
  );
});
