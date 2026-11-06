
import connectDB from "@/lib/mongodb";

import BookingActions from "@/components/admin/BookingActions";
import Booking from "@/models/booking";
import Cottage from "@/models/Cottage";

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
  }).format(amount || 0);
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
    paid: "bg-green-50 text-green-700 ring-green-200",
    unpaid: "bg-amber-50 text-amber-700 ring-amber-200",
    refunded: "bg-purple-50 text-purple-700 ring-purple-200",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
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

  // Booking statistics
  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;

  const paidRevenue = bookings
    .filter((booking) => booking.paymentStatus === "paid")
    .reduce(
      (total, booking) => total + (booking.totalPrice || 0),
      0
    );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Booking Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage guest reservations and booking requests.
          </p>
        </div>

        <div className="rounded-xl bg-[#234b3b]/10 px-4 py-2 text-sm font-semibold text-[#234b3b]">
          {totalBookings} Total Bookings
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          title="Paid Revenue"
          value={formatPrice(paidRevenue)}
          description="Revenue from paid bookings"
        />
      </div>

      {/* Bookings Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">
            All Reservations
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Review guest details and manage reservation status.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Guest</th>
                <th className="px-6 py-4 font-semibold">Cottage</th>
                <th className="px-6 py-4 font-semibold">Check-in / Out</th>
                <th className="px-6 py-4 font-semibold">Guests</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Payment</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr
                    key={booking._id.toString()}
                    className="transition hover:bg-gray-50/70"
                  >
                    {/* Guest */}
                    <td className="px-6 py-5">
                      <p className="font-semibold text-gray-900">
                        {booking.guestName}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {booking.guestEmail}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {booking.guestPhone}
                      </p>
                    </td>

                    {/* Cottage */}
                    <td className="px-6 py-5 font-medium text-gray-700">
                      {booking.cottage?.name || "Cottage unavailable"}
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-5">
                      <p className="font-medium text-gray-800">
                        {formatDate(booking.checkIn)}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        to {formatDate(booking.checkOut)}
                      </p>
                    </td>

                    {/* Guests */}
                    <td className="px-6 py-5 text-gray-700">
                      {booking.guests}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-5 font-semibold text-gray-900">
                      {formatPrice(booking.totalPrice)}
                    </td>

                    {/* Payment */}
                    <td className="px-6 py-5">
                      <StatusBadge status={booking.paymentStatus} />
                    </td>

                    {/* Booking Status */}
                    <td className="px-6 py-5">
                      <StatusBadge status={booking.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <BookingActions
                        bookingId={booking._id.toString()}
                        status={booking.status}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <p className="font-semibold text-gray-700">
                      No bookings found
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      New reservations will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-6 py-4">
          <p className="text-xs text-gray-400">
            Showing {bookings.length} reservation(s).
            Scroll horizontally to view all columns.
          </p>
        </div>
      </div>
    </div>
  );
}
