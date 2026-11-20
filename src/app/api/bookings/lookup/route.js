
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";

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
      [
        "bookingReference",
        "guestName",
        "cottage",
        "checkIn",
        "checkOut",
        "guests",
        "totalPrice",
        "status",
        "paymentStatus",
        "advancePercentage",
        "paymentAmount",
        "paymentMethod",
        "transactionId",
        "paymentVerifiedAt",
        "payments",
        "createdAt",
      ].join(" ")
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

  // 7. Calculate verified advance payment
  const isAdvanceVerified =
    booking.paymentStatus === "verified";

  const submittedAdvanceAmount =
    Number(booking.paymentAmount) || 0;

  const verifiedAdvanceAmount = isAdvanceVerified
    ? submittedAdvanceAmount
    : 0;

  // 8. Prepare additional payments recorded by admin
  const additionalPayments = Array.isArray(booking.payments)
    ? booking.payments.map((payment) => ({
        amount: Number(payment.amount) || 0,
        method: payment.method || "",
        paidAt: payment.paidAt || null,
      }))
    : [];

  const additionalPaymentsTotal = additionalPayments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  // 9. Calculate total paid and remaining balance
  const totalPrice = Number(booking.totalPrice) || 0;

  const totalPaid =
    verifiedAdvanceAmount + additionalPaymentsTotal;

  const remainingBalance = Math.max(
    0,
    totalPrice - totalPaid
  );

  // 10. Return guest-safe booking information
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

        totalPrice,
        status: booking.status,

        paymentStatus: booking.paymentStatus,

        advancePercentage: booking.advancePercentage || 0,

        submittedAdvanceAmount,
        verifiedAdvanceAmount,

        paymentMethod: booking.paymentMethod || "",
        transactionId: booking.transactionId || "",

        paymentVerifiedAt: booking.paymentVerifiedAt || null,

        additionalPayments,

        additionalPaymentsTotal,
        totalPaid,
        remainingBalance,

        createdAt: booking.createdAt,
      },
    },
    { status: 200 }
  );
});
