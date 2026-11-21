
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";

import { authorizeApiRequest } from "@/lib/authorize";
import { PERMISSIONS } from "@/lib/permissions";

import Booking from "@/models/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getDhakaDateRange(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString || "")) {
    return null;
  }

  const [year, month, day] = dateString.split("-").map(Number);
  const checkDate = new Date(Date.UTC(year, month - 1, day));

  if (
    checkDate.getUTCFullYear() !== year ||
    checkDate.getUTCMonth() !== month - 1 ||
    checkDate.getUTCDate() !== day
  ) {
    return null;
  }

  const start = new Date(`${dateString}T00:00:00+06:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return { start, end };
}

export async function GET(request) {
  try {
    const { user, response } = await authorizeApiRequest(
      PERMISSIONS.GUESTS_VIEW
    );

    if (response) {
      return response;
    }

    const isAdmin = user.role === "admin";

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const dateRange = getDhakaDateRange(date);

    if (!dateRange) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid date in YYYY-MM-DD format.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const now = new Date();
    const { start, end } = dateRange;

    let bookingQuery = Booking.find({
      checkIn: { $lt: end },
      checkOut: { $gt: start },
      $or: [
        { status: "confirmed" },
        {
          status: "pending",
          $or: [
            { paymentDeadline: { $gt: now } },
            { paymentDeadline: null },
          ],
        },
      ],
    });

    // Managers receive guest-service fields only.
    // Admins retain the complete existing payment information.
    if (isAdmin) {
      bookingQuery = bookingQuery.select(
        [
          "bookingReference",
          "guestName",
          "guestEmail",
          "guestPhone",
          "cottage",
          "checkIn",
          "checkOut",
          "guests",
          "totalPrice",
          "paymentAmount",
          "paymentStatus",
          "paymentMethod",
          "transactionId",
          "paymentDeadline",
          "paymentVerifiedAt",
          "payments",
          "status",
          "createdAt",
        ].join(" ")
      );
    } else {
      bookingQuery = bookingQuery.select(
        [
          "bookingReference",
          "guestName",
          "guestEmail",
          "guestPhone",
          "cottage",
          "checkIn",
          "checkOut",
          "guests",
          "status",
          "createdAt",
        ].join(" ")
      );
    }

    const bookings = await bookingQuery
      .populate("cottage", "name")
      .sort({ checkIn: 1 })
      .lean();

    const guests = bookings.map((booking) => {
      const guest = {
        _id: booking._id,
        bookingReference: booking.bookingReference,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        cottage: booking.cottage
          ? {
              _id: booking.cottage._id,
              name: booking.cottage.name,
            }
          : null,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        status: booking.status,
        createdAt: booking.createdAt,
      };

      if (isAdmin) {
        const verifiedAdvance =
          booking.paymentStatus === "verified"
            ? Number(booking.paymentAmount || 0)
            : 0;

        const additionalPayments = (
          booking.payments || []
        ).reduce((sum, payment) => {
          return sum + Number(payment.amount || 0);
        }, 0);

        const totalReceived =
          Math.round(
            (verifiedAdvance + additionalPayments) * 100
          ) / 100;

        const totalPrice = Number(booking.totalPrice || 0);

        const remainingBalance = Math.max(
          0,
          Math.round((totalPrice - totalReceived) * 100) / 100
        );

        guest.payment = {
          status: booking.paymentStatus,
          method: booking.paymentMethod,
          transactionId: booking.transactionId,
          deadline: booking.paymentDeadline,
          verifiedAt: booking.paymentVerifiedAt,
          totalPrice,
          verifiedAdvance,
          additionalPayments,
          totalReceived,
          remainingBalance,
        };
      }

      return guest;
    });

    return NextResponse.json(
      {
        success: true,
        date,
        totalGuests: guests.length,
        confirmedGuests: guests.filter(
          (guest) => guest.status === "confirmed"
        ).length,
        pendingGuests: guests.filter(
          (guest) => guest.status === "pending"
        ).length,
        guests,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Admin guest lookup error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load guests for this date.",
      },
      { status: 500 }
    );
  }
}
