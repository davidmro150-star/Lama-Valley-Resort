
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";
import RestaurantOrder from "@/models/RestaurantOrder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DHAKA_OFFSET_HOURS = 6;

function money(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function addDays(dateString, amount) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);

  return date.toISOString().slice(0, 10);
}

function getDhakaDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

// Converts midnight in Bangladesh into its UTC equivalent.
function dhakaMidnight(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(
    Date.UTC(year, month - 1, day) -
      DHAKA_OFFSET_HOURS * 60 * 60 * 1000
  );
}

function getPeriodRange(period, startDate, endDate) {
  const today = getDhakaDateString();

  let start;
  let end;

  if (period === "today") {
    start = today;
    end = addDays(today, 1);
  } else if (period === "week") {
    const weekday = new Date(
      `${today}T00:00:00.000Z`
    ).getUTCDay();

    const daysSinceMonday = (weekday + 6) % 7;

    start = addDays(today, -daysSinceMonday);
    end = addDays(start, 7);
  } else if (period === "month") {
    start = `${today.slice(0, 7)}-01`;

    const [year, month] = today.split("-").map(Number);

    end =
      month === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 1).padStart(2, "0")}-01`;
  } else if (period === "year") {
    start = `${today.slice(0, 4)}-01-01`;
    end = `${Number(today.slice(0, 4)) + 1}-01-01`;
  } else if (period === "custom") {
    if (
      !isValidDateString(startDate) ||
      !isValidDateString(endDate) ||
      startDate > endDate
    ) {
      throw new Error("Please select a valid custom date range.");
    }

    start = startDate;
    end = addDays(endDate, 1);

    const difference =
      (Date.parse(`${end}T00:00:00.000Z`) -
        Date.parse(`${start}T00:00:00.000Z`)) /
      86400000;

    if (difference > 366) {
      throw new Error("Custom date range cannot exceed 366 days.");
    }
  } else {
    throw new Error("Invalid reporting period.");
  }

  return {
    start,
    end,
    startDate: dhakaMidnight(start),
    endDate: dhakaMidnight(end),
  };
}

function getDhakaParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );
}

function getBucketKey(date, grouping) {
  const parts = getDhakaParts(date);

  return grouping === "month"
    ? `${parts.year}-${parts.month}`
    : `${parts.year}-${parts.month}-${parts.day}`;
}

function createSeries(start, end, grouping) {
  const result = [];
  let current = start;

  while (current < end) {
    const key =
      grouping === "month"
        ? current.slice(0, 7)
        : current;

    result.push({
      date: key,
      bookings: 0,
      revenue: 0,
    });

    if (grouping === "month") {
      const [year, month] = current.split("-").map(Number);

      current =
        month === 12
          ? `${year + 1}-01-01`
          : `${year}-${String(month + 1).padStart(2, "0")}-01`;
    } else {
      current = addDays(current, 1);
    }
  }

  return result;
}

function getGrouping(period, start, end) {
  if (period === "year") return "month";

  const days =
    (Date.parse(`${end}T00:00:00.000Z`) -
      Date.parse(`${start}T00:00:00.000Z`)) /
    86400000;

  return days > 31 ? "month" : "day";
}

function emptyMethods() {
  return {
    cash: 0,
    bkash: 0,
    nagad: 0,
    bank: 0,
  };
}

export async function GET(request) {
  try {
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

    const { searchParams } = new URL(request.url);

    const period = searchParams.get("period") || "month";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    const range = getPeriodRange(
      period,
      customStart,
      customEnd
    );

    await connectDB();

    const dateQuery = {
      $gte: range.startDate,
      $lt: range.endDate,
    };

    // Bookings are counted by their creation date.
    const bookings = await Booking.find({
      createdAt: dateQuery,
    })
      .select(
        "bookingSource status totalPrice paymentStatus paymentAmount paymentMethod paymentVerifiedAt payments createdAt"
      )
      .lean();

    // Payment reports use actual payment dates.
    // This also includes payments for bookings created earlier.
    const paymentBookings = await Booking.find({
      $or: [
        {
          paymentStatus: "verified",
          paymentVerifiedAt: dateQuery,
        },
        {
          "payments.paidAt": dateQuery,
        },
      ],
    })
      .select(
        "paymentStatus paymentAmount paymentMethod paymentVerifiedAt payments"
      )
      .lean();

    // Direct restaurant payments only.
    // Checkout allocations are deliberately excluded because
    // they refer to payments already recorded against bookings.
    const restaurantOrders = await RestaurantOrder.find({
      orderStatus: { $ne: "cancelled" },
      "payments.paidAt": dateQuery,
    })
      .select("payments")
      .lean();

    const bookingStats = {
      total: bookings.length,
      confirmed: 0,
      pending: 0,
      rejected: 0,
      cancelled: 0,
      online: 0,
      frontDesk: 0,
      paid: 0,
      unpaid: 0,
      outstanding: 0,
      other: 0,
    };

    // Outstanding accommodation balance is calculated from
    // bookings created within the selected reporting period.
    for (const booking of bookings) {
   if (
  ["confirmed", "pending", "rejected", "cancelled"].includes(
    booking.status
  )
) {
  bookingStats[booking.status] += 1;
} else {
  bookingStats.other += 1;
}

      if (booking.bookingSource === "front_desk") {
        bookingStats.frontDesk += 1;
      } else {
        bookingStats.online += 1;
      }

      if (["cancelled", "rejected"].includes(booking.status)) {
        continue;
      }

      const verifiedAdvance =
        booking.paymentStatus === "verified"
          ? money(booking.paymentAmount)
          : 0;

      const additionalPayments = (booking.payments || []).reduce(
        (total, payment) => total + money(payment.amount),
        0
      );

      const received = money(
        verifiedAdvance + additionalPayments
      );

      const balance = Math.max(
        0,
        money(booking.totalPrice - received)
      );

      bookingStats.outstanding = money(
        bookingStats.outstanding + balance
      );

      if (balance === 0) {
        bookingStats.paid += 1;
      } else {
        bookingStats.unpaid += 1;
      }
    }

    const revenue = {
      total: 0,
      transactions: 0,
      methods: emptyMethods(),
      accommodation: 0,
      restaurant: 0,
    };

    function addPayment(amount, method, category) {
      const value = money(amount);

      if (value <= 0) return;

      revenue.total = money(revenue.total + value);
      revenue.transactions += 1;

      if (method in revenue.methods) {
        revenue.methods[method] = money(
          revenue.methods[method] + value
        );
      }

      revenue[category] = money(
        revenue[category] + value
      );
    }

    // Build payment-date revenue from booking records.
    for (const booking of paymentBookings) {
      if (
        booking.paymentStatus === "verified" &&
        booking.paymentVerifiedAt &&
        booking.paymentVerifiedAt >= range.startDate &&
        booking.paymentVerifiedAt < range.endDate
      ) {
        // A refunded advance is not counted as collected revenue.
        if (booking.paymentStatus !== "refunded") {
          addPayment(
            booking.paymentAmount,
            booking.paymentMethod,
            "accommodation"
          );
        }
      }

      for (const payment of booking.payments || []) {
        const paidAt = payment.paidAt
          ? new Date(payment.paidAt)
          : null;

        if (
          paidAt &&
          paidAt >= range.startDate &&
          paidAt < range.endDate
        ) {
          addPayment(
            payment.amount,
            payment.method,
            "accommodation"
          );
        }
      }
    }

    // Add direct restaurant payments, never checkout allocations.
    for (const order of restaurantOrders) {
      for (const payment of order.payments || []) {
        const paidAt = payment.paidAt
          ? new Date(payment.paidAt)
          : null;

        if (
          paidAt &&
          paidAt >= range.startDate &&
          paidAt < range.endDate
        ) {
          addPayment(
            payment.amount,
            payment.method,
            "restaurant"
          );
        }
      }
    }

    const grouping = getGrouping(
      period,
      range.start,
      range.end
    );

    const series = createSeries(
      range.start,
      range.end,
      grouping
    );

    const seriesMap = new Map(
      series.map((item) => [item.date, item])
    );

    // Booking trend: booking creation date.
    for (const booking of bookings) {
      const key = getBucketKey(
        new Date(booking.createdAt),
        grouping
      );

      const bucket = seriesMap.get(key);

      if (bucket) {
        bucket.bookings += 1;
      }
    }

    // Revenue trend: actual payment date.
    function addToRevenueSeries(date, amount) {
      const key = getBucketKey(new Date(date), grouping);
      const bucket = seriesMap.get(key);

      if (bucket) {
        bucket.revenue = money(
          bucket.revenue + money(amount)
        );
      }
    }

    for (const booking of paymentBookings) {
      if (
        booking.paymentStatus === "verified" &&
        booking.paymentVerifiedAt &&
        booking.paymentVerifiedAt >= range.startDate &&
        booking.paymentVerifiedAt < range.endDate
      ) {
        addToRevenueSeries(
          booking.paymentVerifiedAt,
          booking.paymentAmount
        );
      }

      for (const payment of booking.payments || []) {
        const paidAt = payment.paidAt
          ? new Date(payment.paidAt)
          : null;

        if (
          paidAt &&
          paidAt >= range.startDate &&
          paidAt < range.endDate
        ) {
          addToRevenueSeries(paidAt, payment.amount);
        }
      }
    }

    for (const order of restaurantOrders) {
      for (const payment of order.payments || []) {
        const paidAt = payment.paidAt
          ? new Date(payment.paidAt)
          : null;

        if (
          paidAt &&
          paidAt >= range.startDate &&
          paidAt < range.endDate
        ) {
          addToRevenueSeries(paidAt, payment.amount);
        }
      }
    }

    return NextResponse.json({
      success: true,
      period,
      dateRange: {
        start: range.start,
        end: addDays(range.end, -1),
        timezone: "Asia/Dhaka",
      },
      bookings: bookingStats,
      revenue,
      series,
      grouping,
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message || "Unable to load dashboard analytics.",
      },
      { status: 500 }
    );
  }
}
