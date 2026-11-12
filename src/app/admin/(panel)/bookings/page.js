
import connectDB from "@/lib/mongodb";

import BookingActions from "@/components/admin/BookingActions";
import Booking from "@/models/booking";

export const dynamic = "force-dynamic";
import PaymentProofViewer from "@/components/admin/PaymentProofViewer";
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
      className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold capitalize ring-1 ring-inset ${
        styles[status] || "bg-gray-100 text-gray-600 ring-gray-200"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

function formatPaymentMethod(method) {
  const methods = {
    bkash: "bKash",
    nagad: "Nagad",
    bank: "Bank Transfer",
  };

  return methods[method] || "—";
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

  // Booking statistics
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

  const verifiedPayments = bookings
    .filter((booking) => booking.paymentStatus === "verified")
    .reduce(
      (total, booking) =>
        total + (Number(booking.paymentAmount) || 0),
      0
    );

  return (
    <div className="space-y-6">
      {/* Page Header */}
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
          description="Manually verified payments only"
        />
      </div>

      {/* Bookings Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-4">
          <h2 className="text-base font-bold text-gray-900">
            All Reservations
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Review guest information, payment details and booking status.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] table-auto text-left text-xs">
            <colgroup>
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[9%]" />
              <col className="w-[4%]" />
              <col className="w-[7%]" />
              <col className="w-[7%]" />
              <col className="w-[7%]" />
              <col className="w-[14%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
            </colgroup>

            <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500">
              <tr>
                <th className="whitespace-nowrap px-2 py-3 font-semibold">
                  Guest
                </th>
                <th className="whitespace-nowrap px-2 py-3 font-semibold">
                  Cottage
                </th>
                <th className="whitespace-nowrap px-2 py-3 font-semibold">
                  Check-in / Out
                </th>
                <th className="whitespace-nowrap px-2 py-3 font-semibold">
                  Guests
                </th>
                <th className="whitespace-nowrap px-2 py-3 font-semibold">
                  Total
                </th>
                <th className="whitespace-nowrap px-2 py-3 font-semibold">
                  Advance
                </th>
                <th className="whitespace-nowrap px-2 py-3 font-semibold">
                  Remaining
                </th>
                <th className="px-2 py-3 font-semibold">
                  Payment Details
                </th>
                <th className="whitespace-nowrap px-2 py-3 font-semibold">
                  Payment
                </th>
                <th className="whitespace-nowrap px-2 py-3 font-semibold">
                  Booking
                </th>
                <th className="whitespace-nowrap px-2 py-3 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {bookings.length > 0 ? (
                bookings.map((booking) => {
                  const totalPrice = Number(booking.totalPrice) || 0;

                  const verifiedAmount =
                    booking.paymentStatus === "verified"
                      ? Number(booking.paymentAmount) || 0
                      : 0;

                  const remaining = Math.max(
                    totalPrice - verifiedAmount,
                    0
                  );

                  return (
                    <tr
                      key={booking._id.toString()}
                      className="transition hover:bg-gray-50/70"
                    >
                      {/* Guest */}
                      <td className="px-2 py-3 align-top">
                        <p className="font-semibold text-gray-900">
                          {booking.guestName}
                        </p>

                        <p className="mt-1 max-w-[130px] break-all text-[10px] text-gray-500">
                          {booking.guestEmail}
                        </p>

                        <p className="mt-1 text-[10px] text-gray-500">
                          {booking.guestPhone}
                        </p>

                        <p className="mt-2 break-all text-[10px] font-semibold text-[#234b3b]">
                          {booking.bookingReference || "No reference"}
                        </p>
                      </td>

                      {/* Cottage */}
                      <td className="px-2 py-3 align-top font-medium text-gray-700">
                        {booking.cottage?.name || "Cottage unavailable"}
                      </td>

                      {/* Dates */}
                      <td className="whitespace-nowrap px-2 py-3 align-top">
                        <p className="font-medium text-gray-800">
                          {formatDate(booking.checkIn)}
                        </p>

                        <p className="mt-1 text-[10px] text-gray-500">
                          to {formatDate(booking.checkOut)}
                        </p>
                      </td>

                      {/* Guests */}
                      <td className="px-2 py-3 align-top text-gray-700">
                        {booking.guests}
                      </td>

                      {/* Total Price */}
                      <td className="whitespace-nowrap px-2 py-3 align-top font-semibold text-gray-900">
                        {formatPrice(totalPrice)}
                      </td>

                      {/* Advance */}
                      <td className="whitespace-nowrap px-2 py-3 align-top">
                        <p className="font-semibold text-gray-900">
                          {formatPrice(booking.paymentAmount)}
                        </p>

                        <p className="mt-1 text-[10px] text-gray-500">
                          {booking.advancePercentage || 0}% advance
                        </p>
                      </td>

                      {/* Remaining */}
                      <td className="whitespace-nowrap px-2 py-3 align-top font-semibold text-gray-700">
                        {formatPrice(remaining)}
                      </td>

                      {/* Payment Details */}
                      <td className="px-2 py-3 align-top">
                        <p className="font-medium text-gray-800">
                          {formatPaymentMethod(booking.paymentMethod)}
                        </p>

                        <p className="mt-2 text-[10px] text-gray-500">
                          Transaction ID
                        </p>

                        <p className="mt-1 max-w-[110px] break-all text-[10px] font-medium text-gray-700">
                          {booking.transactionId || "—"}
                        </p>

                      {booking.paymentProof?.publicId ? (
  <div>
    <span className="font-semibold text-green-700">
      Screenshot uploaded
    </span>

    <PaymentProofViewer
      bookingId={booking._id.toString()}
    />
  </div>
) : (
  <p className="mt-2 text-[10px] text-gray-400">
    No screenshot
  </p>
)}
                      </td>

                      {/* Payment Status */}
                      <td className="px-2 py-3 align-top">
                        <StatusBadge status={booking.paymentStatus} />
                      </td>

                      {/* Booking Status */}
                      <td className="px-2 py-3 align-top">
                        <StatusBadge status={booking.status} />
                      </td>

                   {/* Actions */}
<td className="px-2 py-3 align-top">
  <BookingActions
    bookingId={booking._id.toString()}
    status={booking.status}
    paymentStatus={booking.paymentStatus}
  />
</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center">
                    <p className="font-semibold text-gray-700">
                      No bookings found
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      New reservations will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-4 py-3">
          <p className="text-[10px] text-gray-400">
            Showing {bookings.length} reservation(s). Scroll horizontally
            when necessary.
          </p>
        </div>
      </div>
    </div>
  );
}
