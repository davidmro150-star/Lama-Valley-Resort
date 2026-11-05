
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";


const statusStyles = {
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  cancelled: "bg-gray-100 text-gray-700 ring-gray-500/20",
  rejected: "bg-red-50 text-red-700 ring-red-600/20",
  expired: "bg-orange-50 text-orange-700 ring-orange-600/20",
};

const paymentStyles = {
  unpaid: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700",
  refunded: "bg-purple-50 text-purple-700",
};

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date(date));
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(price || 0);
}

function StatusBadge({ status, styles }) {
  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
        styles[status] || "bg-gray-100 text-gray-600 ring-gray-500/20"
      }`}
    >
      {label}
    </span>
  );
}

export default async function AdminBookingsPage() {
  let bookings = [];
  let error = false;

  try {
    await connectDB();

    bookings = await Booking.find({})
      .populate("cottage", "name")
      .sort({ createdAt: -1 })
      .lean();
  } catch (err) {
    console.error("Admin bookings page error:", err);
    error = true;
  }

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;
  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;
  const totalRevenue = bookings
    .filter((booking) => booking.paymentStatus === "paid")
    .reduce((total, booking) => total + (booking.totalPrice || 0), 0);

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#987447]">
            Resort Management
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#173729] sm:text-3xl">
            Bookings
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage guest reservations and monitor booking activity.
          </p>
        </div>

        <div className="rounded-xl border border-[#e8e2d7] bg-white px-4 py-3">
          <p className="text-xs text-gray-500">Total reservations</p>
          <p className="mt-1 text-xl font-semibold text-[#173729]">
            {totalBookings}
          </p>
        </div>
      </div>

      {/* Database error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Unable to load bookings. Please check your database connection and
          try again.
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Bookings"
          value={totalBookings}
          description="All reservations"
        />

        <SummaryCard
          label="Pending"
          value={pendingBookings}
          description="Awaiting confirmation"
        />

        <SummaryCard
          label="Confirmed"
          value={confirmedBookings}
          description="Confirmed reservations"
        />

        <SummaryCard
          label="Paid Revenue"
          value={formatPrice(totalRevenue)}
          description="From paid bookings"
        />
      </div>

      {/* Bookings table */}
      <section className="overflow-x-auto rounded-2xl border border-[#e8e2d7] bg-white">
        <div className="flex min-w-[800px] items-center justify-between border-b border-[#eee9df] px-6 py-5">
          <div>
            <h2 className="font-semibold text-[#173729]">
              Recent Reservations
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Latest guest booking records
            </p>
          </div>

          <span className="rounded-full bg-[#f5f2eb] px-3 py-1.5 text-xs font-medium text-[#426b55]">
            {totalBookings} records
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h3 className="font-semibold text-[#173729]">
              No bookings found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Guest reservations will appear here when customers make bookings.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[800px] text-left">
            <thead className="bg-[#faf9f6] text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Guest</th>
                <th className="px-6 py-4 font-semibold">Cottage</th>
                <th className="px-6 py-4 font-semibold">Stay</th>
                <th className="px-6 py-4 font-semibold">Guests</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Payment</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#eee9df]">
              {bookings.map((booking) => (
                <tr
                  key={booking._id.toString()}
                  className="transition-colors hover:bg-[#faf9f6]"
                >
                  <td className="px-6 py-5">
                    <p className="font-medium text-[#173729]">
                      {booking.guestName}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {booking.guestEmail}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {booking.guestPhone}
                    </p>
                  </td>

                  <td className="px-6 py-5 text-sm font-medium text-gray-700">
                    {booking.cottage?.name || "Cottage unavailable"}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    <p>{formatDate(booking.checkIn)}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      to {formatDate(booking.checkOut)}
                    </p>
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {booking.guests}
                  </td>

                  <td className="px-6 py-5 text-sm font-semibold text-[#173729]">
                    {formatPrice(booking.totalPrice)}
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge
                      status={booking.paymentStatus}
                      styles={paymentStyles}
                    />
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge
                      status={booking.status}
                      styles={statusStyles}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p className="text-xs text-gray-400">
        Booking information is retrieved directly from the resort database.
      </p>
    </div>
  );
}

function SummaryCard({ label, value, description }) {
  return (
    <div className="rounded-2xl border border-[#e8e2d7] bg-white p-5">
      <p className="text-sm font-medium text-gray-500">{label}</p>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-[#173729]">
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-400">{description}</p>
    </div>
  );
}
