
import Link from "next/link";
import connectDB from "@/lib/mongodb";

import Booking from "@/models/booking";
import Cottage from "@/models/Cottage";
import RestaurantOrder from "@/models/RestaurantOrder";
import DashboardAnalytics from "@/components/admin/DashboardAnalytics";

import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  Banknote,
  ArrowUpRight,
  ArrowRight,
  House,
  UtensilsCrossed,
  Images,
  Package,
  TrendingUp,
  ClipboardPlus,
  Users,
} from "lucide-react";

function money(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function formatMoney(value) {
  return `৳${money(value).toLocaleString("en-BD")}`;
}

function formatDate(date) {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
}

function getStatusStyle(status) {
  switch (status) {
    case "confirmed":
      return "bg-emerald-50 text-emerald-700";
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "rejected":
      return "bg-red-50 text-red-700";
    case "cancelled":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

const quickActions = [
  {
    title: "Manage Bookings",
    description: "Review and manage guest reservations",
    icon: CalendarDays,
    href: "/admin/bookings",
  },
  {
    title: "Front Desk Booking",
    description: "Create reservations for walk-in guests",
    icon: ClipboardPlus,
    href: "/admin/front-desk-bookings",
  },
  {
    title: "Manage Cottages",
    description: "Update accommodation and availability",
    icon: House,
    href: "/admin/rooms",
  },
  {
    title: "Restaurant",
    description: "Manage dining information and menu",
    icon: UtensilsCrossed,
    href: "/admin/restaurant",
  },
  {
    title: "Guest Management",
    description: "View and manage resort guests",
    icon: Users,
    href: "/admin/guests",
  },
  {
    title: "Gallery",
    description: "Update resort photos and images",
    icon: Images,
    href: "/admin/gallery",
  },
  {
    title: "Packages",
    description: "Manage offers and travel packages",
    icon: Package,
    href: "/admin/packages",
  },
];

function StatCard({ item }) {
  const Icon = item.icon;

  return (
    <div className="rounded-xl border border-[#eeece4] bg-white p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#777d73]">
            {item.title}
          </p>

          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#252a25]">
            {item.value}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}
        >
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>

      <p className="mt-4 text-xs text-[#92998f]">
        {item.description}
      </p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  await connectDB();

  // Fetch actual booking and restaurant payment records.
  const [bookings, restaurantOrders] = await Promise.all([
    Booking.find({})
      .populate("cottage", "name")
      .sort({ createdAt: -1 })
      .lean(),

    RestaurantOrder.find({
      orderStatus: { $ne: "cancelled" },
    })
      .select("booking payments total")
      .lean(),
  ]);

  // Group restaurant orders by booking.
  const restaurantPaymentsByBooking = new Map();

  for (const order of restaurantOrders) {
    const bookingId = order.booking?.toString();

    if (!bookingId) continue;

    const directPayments = (order.payments || []).reduce(
      (total, payment) => total + money(payment.amount),
      0
    );

    restaurantPaymentsByBooking.set(
      bookingId,
      money(
        (restaurantPaymentsByBooking.get(bookingId) || 0) +
          directPayments
      )
    );
  }

  let totalRevenue = 0;
  let paidBookings = 0;
  let unpaidBookings = 0;

  const activeBookings = bookings.filter(
    (booking) =>
      !["cancelled", "rejected"].includes(booking.status)
  );

  for (const booking of bookings) {
    // Only verified online advances count as received.
    const verifiedAdvance =
      booking.paymentStatus === "verified"
        ? money(booking.paymentAmount)
        : 0;

    // Additional payments recorded by an administrator.
    const additionalPayments = (booking.payments || []).reduce(
      (total, payment) => total + money(payment.amount),
      0
    );

    // Direct restaurant payments only.
    // Checkout allocations are references to booking payments
    // and must not be counted a second time.
    const restaurantDirectPayments =
      restaurantPaymentsByBooking.get(
        booking._id.toString()
      ) || 0;

    totalRevenue = money(
      totalRevenue +
        verifiedAdvance +
        additionalPayments +
        restaurantDirectPayments
    );
  }

  // Paid/unpaid booking counts are based on cottage accommodation.
  for (const booking of activeBookings) {
    const verifiedAdvance =
      booking.paymentStatus === "verified"
        ? money(booking.paymentAmount)
        : 0;

    const additionalPayments = (booking.payments || []).reduce(
      (total, payment) => total + money(payment.amount),
      0
    );

    const accommodationReceived = money(
      verifiedAdvance + additionalPayments
    );

    if (accommodationReceived >= money(booking.totalPrice)) {
      paidBookings += 1;
    } else {
      unpaidBookings += 1;
    }
  }

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;

  const stats = [
    {
      title: "Total Bookings",
      value: totalBookings.toString(),
      description: "All reservations received",
      icon: CalendarDays,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Pending Bookings",
      value: pendingBookings.toString(),
      description: "Awaiting confirmation",
      icon: Clock3,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Confirmed Bookings",
      value: confirmedBookings.toString(),
      description: "Successfully confirmed",
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Total Revenue",
      value: formatMoney(totalRevenue),
      description: "Actual recorded payments",
      icon: Banknote,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="mx-auto max-w-[1500px] space-y-8">
      {/* Page Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a47d4d]">
            Overview
          </p>

          <h1 className="mt-2 font-serif text-3xl font-semibold text-[#252a25]">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-[#777d73]">
            Welcome to your resort management dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[#eeece4] bg-white px-4 py-2.5 text-xs text-[#777d73]">
          <CalendarDays size={15} />
          {new Date().toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric",
            timeZone: "Asia/Dhaka",
          })}
        </div>
      </div>

      {/* Statistics */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#303a32]">
            Performance Overview
          </h2>

          <span className="text-xs text-[#92998f]">
            Live booking summary
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <StatCard key={item.title} item={item} />
          ))}
        </div>
      </section>
{/* Dashboard Analytics */}
<DashboardAnalytics />
      
      {/* Booking and Revenue Section */}
      <section className="grid gap-5 xl:grid-cols-3">
        {/* Recent Bookings */}
        <div className="overflow-hidden rounded-xl border border-[#eeece4] bg-white xl:col-span-2">
          <div className="flex items-center justify-between border-b border-[#eeece4] px-5 py-5">
            <div>
              <h2 className="font-semibold text-[#303a32]">
                Recent Bookings
              </h2>

              <p className="mt-1 text-xs text-[#92998f]">
                Latest guest reservations
              </p>
            </div>

            <Link
              href="/admin/bookings"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#426b55] transition hover:text-[#173729]"
            >
              View all
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-[#fafaf7]">
                <tr className="text-[11px] font-semibold uppercase tracking-wider text-[#92998f]">
                  <th className="px-5 py-4">Guest</th>
                  <th className="px-5 py-4">Stay</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Source</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentBookings.map((booking) => (
                  <tr
                    key={booking._id.toString()}
                    className="border-t border-[#f0efe9]"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-[#303a32]">
                        {booking.guestName}
                      </p>

                      <p className="mt-1 text-xs text-[#92998f]">
                        {booking.guestPhone}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-xs font-medium text-[#303a32]">
                        {booking.cottage?.name || "Cottage"}
                      </p>

                      <p className="mt-1 text-xs text-[#92998f]">
                        {formatDate(booking.checkIn)} –{" "}
                        {formatDate(booking.checkOut)}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-[#303a32]">
                      {formatMoney(booking.totalPrice)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-[#edf2ed] px-2.5 py-1 text-[10px] font-medium text-[#426b55]">
                        {booking.bookingSource === "front_desk"
                          ? "Front Desk"
                          : "Online"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1.5 text-[11px] font-medium capitalize ${getStatusStyle(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {recentBookings.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-sm text-[#92998f]"
                    >
                      No bookings have been received yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#eeece4] px-5 py-4">
            <Link
              href="/admin/bookings"
              className="flex items-center justify-center gap-2 text-xs font-semibold text-[#426b55] hover:text-[#173729]"
            >
              Go to booking management
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="rounded-xl bg-[#173729] p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white/60">
                Revenue Summary
              </p>

              <h2 className="mt-3 font-serif text-3xl font-semibold">
                {formatMoney(totalRevenue)}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#e2c18e]">
              <TrendingUp size={21} />
            </div>
          </div>

          <p className="mt-2 text-xs text-white/50">
            Total actual payments collected
          </p>

          <div className="mt-8 border-t border-white/15 pt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Paid bookings</span>
              <span className="font-semibold">{paidBookings}</span>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-white/60">Unpaid bookings</span>
              <span className="font-semibold">{unpaidBookings}</span>
            </div>

            <p className="mt-6 rounded-lg bg-white/10 px-3 py-3 text-xs leading-5 text-white/65">
              Revenue includes verified online advances, additional
              booking payments and direct restaurant payments.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-[#303a32]">
            Quick Management
          </h2>

          <p className="mt-1 text-xs text-[#92998f]">
            Access your resort management tools
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                href={action.href}
                className="group flex items-center gap-4 rounded-xl border border-[#eeece4] bg-white p-5 transition hover:border-[#c5d4c9] hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf2ed] text-[#234b3b] transition group-hover:bg-[#234b3b] group-hover:text-white">
                  <Icon size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-[#303a32]">
                    {action.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#92998f]">
                    {action.description}
                  </p>
                </div>

                <ArrowUpRight
                  size={17}
                  className="shrink-0 text-[#a4aaa0] transition group-hover:text-[#234b3b]"
                />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
