
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Cottage from "@/models/Cottage";
import Booking from "@/models/booking";

import transporter from "@/lib/mailer";

import { ApiError, asyncHandler } from "@/lib/apiError";
import { authorizeApiRequest } from "@/lib/authorize";
import { PERMISSIONS } from "@/lib/permissions";

export const runtime = "nodejs";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

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

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date(date));
}

function formatMoney(amount) {
  return `BDT ${Number(amount).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// --------------------------------------------------
// Booking confirmation email
// --------------------------------------------------

async function sendFrontDeskConfirmationEmail({
  booking,
  cottageName,
  nights,
  totalPrice,
  amountReceived,
  remainingBalance,
}) {
  const guestName = escapeHtml(booking.guestName);
  const cottage = escapeHtml(cottageName);
  const reference = escapeHtml(booking.bookingReference);
  const email = booking.guestEmail;

  const checkIn = formatDate(booking.checkIn);
  const checkOut = formatDate(booking.checkOut);

  const subject = `Booking Confirmed - ${booking.bookingReference}`;

  const text = `
Dear ${booking.guestName},

Your reservation at Lama Valley Resort & Restaurant has been confirmed.

BOOKING DETAILS

Booking Reference: ${booking.bookingReference}
Guest Name: ${booking.guestName}
Cottage: ${cottageName}
Check-in: ${checkIn}
Check-out: ${checkOut}
Number of Guests: ${booking.guests}
Number of Nights: ${nights}

PAYMENT SUMMARY

Total Amount: ${formatMoney(totalPrice)}
Amount Received: ${formatMoney(amountReceived)}
Remaining Balance: ${formatMoney(remainingBalance)}

Please keep your booking reference for future communication.

Thank you for choosing Lama Valley Resort & Restaurant.

Lama Valley Resort & Restaurant
Lama, Bandarban, Bangladesh
  `;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
      </head>

      <body style="
        margin: 0;
        padding: 24px 12px;
        background-color: #f7f5ef;
        font-family: Arial, Helvetica, sans-serif;
        color: #333333;
      ">

        <div style="
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #e8e5dc;
        ">

          <div style="
            background: #234b3b;
            padding: 28px 20px;
            text-align: center;
            color: #ffffff;
          ">
            <h1 style="margin: 0; font-size: 25px;">
              Lama Valley Resort &amp; Restaurant
            </h1>

            <p style="margin: 10px 0 0; font-size: 15px;">
              Booking Confirmation
            </p>
          </div>

          <div style="padding: 28px 24px;">

            <h2 style="color: #234b3b; margin-top: 0;">
              Your booking is confirmed!
            </h2>

            <p>Dear ${guestName},</p>

            <p>
              Thank you for choosing Lama Valley Resort &amp; Restaurant.
              Your reservation has been successfully confirmed.
            </p>

            <div style="
              background: #f7f5ef;
              border-radius: 8px;
              padding: 18px;
              margin: 22px 0;
            ">

              <p style="
                margin-top: 0;
                color: #234b3b;
                font-weight: bold;
                font-size: 17px;
              ">
                Booking Details
              </p>

              <p><strong>Booking Reference:</strong> ${reference}</p>
              <p><strong>Guest Name:</strong> ${guestName}</p>
              <p><strong>Cottage:</strong> ${cottage}</p>
              <p><strong>Check-in:</strong> ${checkIn}</p>
              <p><strong>Check-out:</strong> ${checkOut}</p>
              <p><strong>Guests:</strong> ${booking.guests}</p>
              <p><strong>Number of Nights:</strong> ${nights}</p>

            </div>

            <h3 style="color: #234b3b;">
              Payment Summary
            </h3>

            <table style="
              width: 100%;
              border-collapse: collapse;
              font-size: 14px;
            ">

              <tr>
                <td style="padding: 12px 5px; border-bottom: 1px solid #eeeeee;">
                  Total Amount
                </td>
                <td style="
                  padding: 12px 5px;
                  border-bottom: 1px solid #eeeeee;
                  text-align: right;
                ">
                  ${formatMoney(totalPrice)}
                </td>
              </tr>

              <tr>
                <td style="padding: 12px 5px; border-bottom: 1px solid #eeeeee;">
                  Amount Received
                </td>
                <td style="
                  padding: 12px 5px;
                  border-bottom: 1px solid #eeeeee;
                  text-align: right;
                ">
                  ${formatMoney(amountReceived)}
                </td>
              </tr>

              <tr>
                <td style="padding: 12px 5px; font-weight: bold;">
                  Remaining Balance
                </td>
                <td style="
                  padding: 12px 5px;
                  text-align: right;
                  font-weight: bold;
                  color: #234b3b;
                ">
                  ${formatMoney(remainingBalance)}
                </td>
              </tr>

            </table>

            <p style="margin-top: 25px;">
              Please keep your booking reference for future communication.
            </p>

            <p>
              We look forward to welcoming you!
            </p>

            <p style="margin-bottom: 0;">
              Best regards,<br />
              <strong>Lama Valley Resort &amp; Restaurant</strong><br />
              Lama, Bandarban, Bangladesh
            </p>

          </div>

          <div style="
            background: #f7f5ef;
            padding: 16px;
            text-align: center;
            color: #777777;
            font-size: 12px;
          ">
            This is an automatic booking confirmation email.
          </div>

        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Lama Valley Resort & Restaurant" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    text,
    html,
  });
}

// --------------------------------------------------
// POST: Create front-desk booking
// --------------------------------------------------

export const POST = asyncHandler(async (request) => {
  // 1. Authorize staff.
  const { user, response } = await authorizeApiRequest(
    PERMISSIONS.BOOKINGS_CREATE
  );

  if (response) return response;

  const staffId = user.id || user._id;

  if (!mongoose.Types.ObjectId.isValid(staffId)) {
    throw new ApiError(401, "Invalid staff account.");
  }

  await connectDB();

  // 2. Read request body.
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

  // 3. Validate required fields.
  if (
    !cottageId ||
    !guestName ||
    !guestEmail ||
    !guestPhone ||
    !checkIn ||
    !checkOut ||
    guests === undefined
  ) {
    throw new ApiError(
      400,
      "Please provide all required booking information, including guest email."
    );
  }

  if (!mongoose.Types.ObjectId.isValid(cottageId)) {
    throw new ApiError(400, "Invalid cottage selection.");
  }

  // 4. Normalize guest information.
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
    throw new ApiError(400, "Please enter a valid guest email address.");
  }

  const phoneDigits = phone.replace(/\D/g, "");

  if (
    phone.length > 25 ||
    phoneDigits.length < 7 ||
    phoneDigits.length > 15
  ) {
    throw new ApiError(400, "Please enter a valid phone number.");
  }

  // 5. Validate dates.
  if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
    throw new ApiError(400, "Please select valid booking dates.");
  }

  const today = getBangladeshDate();

  if (checkIn < today) {
    throw new ApiError(400, "Check-in date cannot be in the past.");
  }

  if (checkOut <= checkIn) {
    throw new ApiError(400, "Check-out must be after check-in.");
  }

  const startDate = new Date(`${checkIn}T00:00:00.000Z`);
  const endDate = new Date(`${checkOut}T00:00:00.000Z`);

  const nights = Math.round(
    (endDate.getTime() - startDate.getTime()) / 86400000
  );

  // 6. Validate guest count.
  const guestCount = Number(guests);

  if (!Number.isInteger(guestCount) || guestCount < 1) {
    throw new ApiError(400, "Please select a valid number of guests.");
  }

  // 7. Find active cottage.
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

  // 8. Calculate price on the server.
  const totalPrice = Number(cottage.price) * nights;

  if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
    throw new ApiError(400, "Unable to calculate the booking price.");
  }

  // 9. Check cottage availability.
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

  // 10. Validate received payment.
  const receivedAmount = Number(amountReceived);

  if (
    !Number.isFinite(receivedAmount) ||
    receivedAmount < 0 ||
    Math.abs(
      receivedAmount * 100 - Math.round(receivedAmount * 100)
    ) > 1e-8 ||
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

    const reference = String(paymentReference || "").trim();
    const note = String(paymentNote || "").trim();

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
        recordedBy: staffId,
      },
    ];
  }

  // 11. Create confirmed front-desk booking.
  // Online advance verification fields remain separate.
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

    paymentAmount: 0,
    paymentStatus: "unpaid",

    payments: paymentRecord,
    status: "confirmed",
  });

  const remainingBalance = totalPrice - receivedAmount;

  // 12. Send confirmation email after successful booking creation.
  let emailSent = false;

  try {
    await sendFrontDeskConfirmationEmail({
      booking,
      cottageName: cottage.name,
      nights,
      totalPrice,
      amountReceived: receivedAmount,
      remainingBalance,
    });

    emailSent = true;
  } catch (emailError) {
    // Do not undo or fail the booking if email delivery fails.
    console.error(
      "Front-desk booking confirmation email failed:",
      emailError
    );
  }

  // 13. Return booking information.
  return NextResponse.json(
    {
      success: true,
      message: emailSent
        ? "Front-desk booking created and confirmation email sent successfully."
        : "Booking created successfully, but confirmation email could not be sent.",

      emailSent,

      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        bookingSource: booking.bookingSource,

        cottage: cottage.name,

        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,

        checkIn: booking.checkIn,
        checkOut: booking.checkOut,

        guests: booking.guests,
        nights,

        totalPrice: booking.totalPrice,
        amountReceived: receivedAmount,
        remainingBalance,

        paymentStatus: booking.paymentStatus,
        status: booking.status,
      },
    },
    { status: 201 }
  );
});
