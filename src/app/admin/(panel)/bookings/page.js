
import Link from "next/link";

import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";
import Cottage from "@/models/Cottage";
import BookingActions from "@/components/admin/BookingActions";

export const dynamic = "force-dynamic";

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date(date));
}

function formatPrice(amount) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function SummaryCard({ title, value, description }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="mt-3 text-2xl font-bold text-gray-900">{value}</h3>
      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    confirmed: "bg-green-50 text-green-700 ring-green-200",
    rejected: "bg-red-50 text-red-700 ring-red-200",
    cancelled: "bg-gray-100 text-gray-600 ring-gray-200",
    expired: "bg-gray-100 text-gray-600 ring-gray-200",
    submitted: "bg-blue-50 text-blue-700 ring-blue-200",
    verified: "bg-green-50 text-green-700 ring-green-200",
    unpaid: "bg-amber-50 text-amber-700 ring-amber-200",
    refunded: "bg-purple-50 text-purple-700 ring-purple-200",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ring-1 ring-inset ${
        styles[status] || "bg-gray-100 text-gray-600 ring-gray-200"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

export default async function BookingsPage() {
  let bookings = [];

  try {
    await connectDB();

    bookings = await Booking.find({})
      .populate("cottage", "name")
      .sort({ createdAt: -1 })
      .lean();
  } catch (error) {
    console.error("Admin bookings page error:", error);

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-700">
          Unable to load bookings
        </h2>
        <p className="mt-2 text-sm text-red-600">
          Please check your database connection and try again.
        </p>
      </div>
    );
  }

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;

  const activeBookings = bookings.filter(
    (booking) =>
      !["cancelled", "rejected", "expired"].includes(booking.status)
  );

  const totalBookingValue = activeBookings.reduce(
    (total, booking) => total + (Number(booking.totalPrice) || 0),
    0
  );

  const verifiedPayments = bookings.reduce((total, booking) => {
    const advance =
      booking.paymentStatus === "verified"
        ? Number(booking.paymentAmount) || 0
        : 0;

    const additional = Array.isArray(booking.payments)
      ? booking.payments.reduce(
          (sum, payment) => sum + (Number(payment.amount) || 0),
          0
        )
      : 0;

    return total + advance + additional;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Booking Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage reservations, guest details and payments.
          </p>
        </div>

        <div className="w-fit rounded-xl bg-[#234b3b]/10 px-4 py-2 text-sm font-semibold text-[#234b3b]">
          {totalBookings} Total Bookings
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Total Bookings"
          value={totalBookings}
          description="All reservation records"
        />

        <SummaryCard
          title="Pending Bookings"
          value={pendingBookings}
          description="Waiting for admin action"
        />

        <SummaryCard
          title="Confirmed Bookings"
          value={confirmedBookings}
          description="Successfully confirmed"
        />

        <SummaryCard
          title="Total Booking Value"
          value={formatPrice(totalBookingValue)}
          description="Excludes cancelled, rejected and expired bookings"
        />

        <SummaryCard
          title="Total Payments Received"
          value={formatPrice(verifiedPayments)}
          description="Recorded payments"
        />
      </div>

      {/* Reservation List */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              All Reservations
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Select a reservation to view complete guest and payment details.
            </p>
          </div>

          <span className="text-xs font-medium text-gray-500">
            {bookings.length} reservation(s)
          </span>
        </div>

        {bookings.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {bookings.map((booking) => {
              const totalPrice = Number(booking.totalPrice) || 0;

              const verifiedAdvance =
                booking.paymentStatus === "verified"
                  ? Number(booking.paymentAmount) || 0
                  : 0;

              const additionalPayments = Array.isArray(booking.payments)
                ? booking.payments.reduce(
                    (sum, payment) =>
                      sum + (Number(payment.amount) || 0),
                    0
                  )
                : 0;

              const totalReceived =
                verifiedAdvance + additionalPayments;

              const remaining = Math.max(
                totalPrice - totalReceived,
                0
              );

              return (
                <div
                  key={booking._id.toString()}
                  className="p-5 transition hover:bg-gray-50/70"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Guest and Cottage */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-gray-900">
                          {booking.guestName || "Unknown Guest"}
                        </h3>

                        <StatusBadge status={booking.status} />
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        {booking.guestPhone || "No phone number"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-600">
                        <span>
                          <span className="font-semibold text-gray-800">
                            Cottage:
                          </span>{" "}
                          {booking.cottage?.name || "Unavailable"}
                        </span>

                        <span>
                          <span className="font-semibold text-gray-800">
                            Guests:
                          </span>{" "}
                          {booking.guests || 0}
                        </span>
                      </div>

                      <p className="mt-2 break-all text-xs font-semibold text-[#234b3b]">
                        {booking.bookingReference || "No reference"}
                      </p>
                    </div>

                    {/* Stay Dates */}
                    <div className="min-w-[170px]">
                      <p className="text-xs font-medium text-gray-400">
                        CHECK-IN
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {formatDate(booking.checkIn)}
                      </p>

                      <p className="mt-2 text-xs font-medium text-gray-400">
                        CHECK-OUT
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {formatDate(booking.checkOut)}
                      </p>
                    </div>

                    {/* Financial Summary */}
                    <div className="min-w-[150px]">
                      <p className="text-xs text-gray-400">
                        TOTAL BOOKING
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        {formatPrice(totalPrice)}
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        Received: {formatPrice(totalReceived)}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-amber-700">
                        Remaining: {formatPrice(remaining)}
                      </p>
                    </div>

                    {/* Payment Status */}
                    <div className="flex flex-col items-start gap-2 lg:min-w-[115px]">
                      <p className="text-xs text-gray-400">PAYMENT</p>
                      <StatusBadge status={booking.paymentStatus} />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <Link
                        href={`/admin/bookings/${booking._id.toString()}`}
                        className="inline-flex items-center justify-center rounded-lg border border-[#234b3b] px-3 py-2 text-xs font-semibold text-[#234b3b] transition hover:bg-[#234b3b] hover:text-white"
                      >
                        View Details →
                      </Link>

                      <BookingActions
                        bookingId={booking._id.toString()}
                        status={booking.status}
                        paymentStatus={booking.paymentStatus}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-5 py-16 text-center">
            <h3 className="font-semibold text-gray-700">
              No bookings found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              New reservations will appear here.
            </p>
          </div>
        )}

        <div className="border-t border-gray-100 px-5 py-3">
          <p className="text-xs text-gray-400">
            Showing {bookings.length} reservation(s).
          </p>
        </div>
      </div>
    </div>
  );
}
