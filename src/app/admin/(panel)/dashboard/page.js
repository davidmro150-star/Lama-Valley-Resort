
import Link from "next/link";
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
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Total Bookings",
    value: "2",
    description: "All reservations received",
    icon: CalendarDays,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "Pending Bookings",
    value: "2",
    description: "Awaiting confirmation",
    icon: Clock3,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    title: "Confirmed Bookings",
    value: "0",
    description: "Successfully confirmed",
    icon: CheckCircle2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Total Revenue",
    value: "৳0",
    description: "From paid reservations",
    icon: Banknote,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
];

const recentBookings = [
  {
    id: "DEMO-001",
    guest: "David Mro",
    email: "davidmro150@gmail.com",
    cottage: "Cottage reservation",
    date: "Nov 05 – Nov 07, 2026",
    amount: "৳10,000",
    status: "Pending",
  },
  {
    id: "DEMO-002",
    guest: "David Mro",
    email: "davidmro150@gmail.com",
    cottage: "Cottage reservation",
    date: "Nov 04 – Nov 05, 2026",
    amount: "৳5,000",
    status: "Pending",
  },
];

const quickActions = [
  {
    title: "Manage Bookings",
    description: "Review and manage guest reservations",
    icon: CalendarDays,
    href: "/admin/bookings",
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

export default function AdminDashboardPage() {
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
          November 2026
        </div>
      </div>

      {/* Statistics */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#303a32]">
            Performance Overview
          </h2>

          <span className="text-xs text-[#92998f]">
            Booking summary
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <StatCard key={item.title} item={item} />
          ))}
        </div>
      </section>

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
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-t border-[#f0efe9]"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-[#303a32]">
                        {booking.guest}
                      </p>

                      <p className="mt-1 text-xs text-[#92998f]">
                        {booking.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-xs font-medium text-[#303a32]">
                        {booking.cottage}
                      </p>

                      <p className="mt-1 text-xs text-[#92998f]">
                        {booking.date}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-[#303a32]">
                      {booking.amount}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-700">
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
                ৳0
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#e2c18e]">
              <TrendingUp size={21} />
            </div>
          </div>

          <p className="mt-2 text-xs text-white/50">
            Collected payment total
          </p>

          <div className="mt-8 border-t border-white/15 pt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Paid bookings</span>
              <span className="font-semibold">0</span>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-white/60">Unpaid bookings</span>
              <span className="font-semibold">2</span>
            </div>

            <p className="mt-6 rounded-lg bg-white/10 px-3 py-3 text-xs leading-5 text-white/65">
              Revenue will be calculated from actual payment records
              once the dashboard is connected to MongoDB.
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
