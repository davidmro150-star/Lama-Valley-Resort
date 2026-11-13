
"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
  Ban,
  Banknote,
  TrendingUp,
  Users,
  Smartphone,
  Wallet,
  RefreshCw,
} from "lucide-react";

function money(value) {
  return `৳${(Number(value) || 0).toLocaleString("en-BD", {
    maximumFractionDigits: 2,
  })}`;
}

function getToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
  }).format(new Date());
}

function StatCard({ title, value, description, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-[#eeece4] bg-white p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#777d73]">
            {title}
          </p>

          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#252a25]">
            {value}
          </h3>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>

      <p className="mt-4 text-xs text-[#92998f]">
        {description}
      </p>
    </div>
  );
}

function TrendChart({ title, description, data, dataKey, formatter }) {
  const maximum = Math.max(
    1,
    ...data.map((item) => Number(item[dataKey]) || 0)
  );

  const labelStep = Math.max(1, Math.ceil(data.length / 8));

  return (
    <div className="rounded-xl border border-[#eeece4] bg-white p-5">
      <div className="mb-6">
        <h3 className="font-semibold text-[#303a32]">
          {title}
        </h3>

        <p className="mt-1 text-xs text-[#92998f]">
          {description}
        </p>
      </div>

      <div className="flex h-48 items-end gap-1 border-b border-l border-[#eeece4] px-2">
        {data.map((item, index) => {
          const value = Number(item[dataKey]) || 0;
          const height = value > 0 ? Math.max(3, (value / maximum) * 100) : 0;

          return (
            <div
              key={item.date}
              className="group relative flex h-full min-w-0 flex-1 flex-col justify-end"
              title={`${item.date}: ${formatter(value)}`}
            >
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#173729] px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                <p className="font-semibold">{item.date}</p>
                <p>{formatter(value)}</p>
              </div>

              <div
                className="w-full rounded-t-sm bg-[#426b55] transition hover:bg-[#234b3b]"
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex justify-between gap-1 text-[9px] text-[#92998f]">
        {data.map((item, index) => (
          index % labelStep === 0 || index === data.length - 1 ? (
            <span key={item.date} className="truncate">
              {item.date.slice(5)}
            </span>
          ) : null
        ))}
      </div>
    </div>
  );
}

export default function DashboardAnalytics() {
  const [period, setPeriod] = useState("month");
  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics(selectedPeriod = period) {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        period: selectedPeriod,
      });

      if (selectedPeriod === "custom") {
        params.set("startDate", startDate);
        params.set("endDate", endDate);
      }

      const response = await fetch(
        `/api/admin/dashboard/analytics?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load dashboard reports."
        );
      }

      setData(result);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics("month");
  }, []);

  function handlePeriodChange(value) {
    setPeriod(value);

    if (value !== "custom") {
      loadAnalytics(value);
    }
  }

  const bookings = data?.bookings;
  const revenue = data?.revenue;

  return (
    <section className="space-y-6">
      {/* Section heading and filters */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a47d4d]">
            Reports & Analytics
          </p>

          <h2 className="mt-2 text-xl font-semibold text-[#303a32]">
            Resort Performance
          </h2>

          <p className="mt-1 text-sm text-[#92998f]">
            Track bookings, payments and revenue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "Today", value: "today" },
            { label: "This Week", value: "week" },
            { label: "This Month", value: "month" },
            { label: "This Year", value: "year" },
            { label: "Custom", value: "custom" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handlePeriodChange(option.value)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${period === option.value
                  ? "bg-[#234b3b] text-white"
                  : "border border-[#eeece4] bg-white text-[#777d73] hover:border-[#b7c9bb]"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date range */}
      {period === "custom" && (
        <div className="flex flex-col gap-3 rounded-xl border border-[#eeece4] bg-white p-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-xs font-medium text-[#777d73]">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-lg border border-[#e5e4dc] px-3 py-2.5 text-sm outline-none focus:border-[#426b55]"
            />
          </div>

          <div className="flex-1">
            <label className="mb-2 block text-xs font-medium text-[#777d73]">
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-lg border border-[#e5e4dc] px-3 py-2.5 text-sm outline-none focus:border-[#426b55]"
            />
          </div>

          <button
            type="button"
            onClick={() => loadAnalytics("custom")}
            disabled={!startDate || !endDate || startDate > endDate || loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CalendarDays size={16} />
            Apply Dates
          </button>
        </div>
      )}

      {data && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#92998f]">
          <span>
            Reporting period: {data.dateRange.start} to {data.dateRange.end}
          </span>

          <span>Timezone: Asia/Dhaka</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="flex items-center justify-center rounded-xl border border-[#eeece4] bg-white py-16 text-sm text-[#777d73]">
          <RefreshCw size={17} className="mr-2 animate-spin" />
          Loading resort analytics...
        </div>
      ) : data ? (
        <>
          {/* Booking statistics */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#303a32]">
                Booking Statistics
              </h3>

              <span className="text-xs text-[#92998f]">
                Based on booking creation date
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Bookings"
                value={bookings.total}
                description="All bookings received"
                icon={CalendarDays}
                color="bg-blue-50 text-blue-600"
              />

              <StatCard
                title="Confirmed"
                value={bookings.confirmed}
                description="Confirmed reservations"
                icon={CheckCircle2}
                color="bg-emerald-50 text-emerald-600"
              />

              <StatCard
                title="Pending"
                value={bookings.pending}
                description="Awaiting action"
                icon={Clock3}
                color="bg-amber-50 text-amber-600"
              />

              <StatCard
                title="Rejected"
                value={bookings.rejected}
                description="Rejected reservations"
                icon={XCircle}
                color="bg-red-50 text-red-600"
              />

              <StatCard
                title="Cancelled"
                value={bookings.cancelled}
                description="Cancelled reservations"
                icon={Ban}
                color="bg-gray-100 text-gray-600"
              />

              <StatCard
                title="Other Status"
                value={bookings.other}
                description="Other or legacy statuses"
                icon={Users}
                color="bg-purple-50 text-purple-600"
              />

              <StatCard
                title="Online Bookings"
                value={bookings.online}
                description="Reservations through website"
                icon={Smartphone}
                color="bg-indigo-50 text-indigo-600"
              />

              <StatCard
                title="Front Desk"
                value={bookings.frontDesk}
                description="Reservations made at resort"
                icon={Users}
                color="bg-orange-50 text-orange-600"
              />
            </div>
          </div>

          {/* Revenue statistics */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#303a32]">
                Payment & Revenue
              </h3>

              <span className="text-xs text-[#92998f]">
                Based on actual payment dates
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Collected"
                value={money(revenue.total)}
                description={`${revenue.transactions} payment transactions`}
                icon={Banknote}
                color="bg-emerald-50 text-emerald-600"
              />

              <StatCard
                title="Accommodation"
                value={money(revenue.accommodation)}
                description="Cottage booking payments"
                icon={Wallet}
                color="bg-blue-50 text-blue-600"
              />

              <StatCard
                title="Restaurant"
                value={money(revenue.restaurant)}
                description="Direct restaurant payments"
                icon={TrendingUp}
                color="bg-purple-50 text-purple-600"
              />

              <StatCard
                title="Outstanding"
                value={money(bookings.outstanding)}
                description="Active bookings created in this period"
                icon={Clock3}
                color="bg-amber-50 text-amber-600"
              />
            </div>
          </div>

          {/* Payment methods */}
          <div className="rounded-xl border border-[#eeece4] bg-white p-5">
            <h3 className="font-semibold text-[#303a32]">
              Payment Method Breakdown
            </h3>

            <p className="mt-1 text-xs text-[#92998f]">
              Actual money received through each payment method
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Cash", value: revenue.methods.cash },
                { label: "bKash", value: revenue.methods.bkash },
                { label: "Nagad", value: revenue.methods.nagad },
                { label: "Bank", value: revenue.methods.bank },
              ].map((method) => {
                const percentage =
                  revenue.total > 0
                    ? (method.value / revenue.total) * 100
                    : 0;

                return (
                  <div key={method.label}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[#777d73]">
                        {method.label}
                      </span>

                      <span className="text-sm font-semibold text-[#303a32]">
                        {money(method.value)}
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#f0efe9]">
                      <div
                        className="h-full rounded-full bg-[#426b55]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-[#92998f]">
                      {percentage.toFixed(1)}% of collected revenue
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Paid and unpaid accommodation */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#eeece4] bg-white p-5">
              <p className="text-sm text-[#777d73]">
                Fully Paid Bookings
              </p>

              <h3 className="mt-2 text-2xl font-semibold text-emerald-700">
                {bookings.paid}
              </h3>
            </div>

            <div className="rounded-xl border border-[#eeece4] bg-white p-5">
              <p className="text-sm text-[#777d73]">
                Unpaid / Partially Paid Bookings
              </p>

              <h3 className="mt-2 text-2xl font-semibold text-amber-700">
                {bookings.unpaid}
              </h3>
            </div>
          </div>

          {/* Charts */}
          <div>
            <div className="mb-4">
              <h3 className="text-base font-semibold text-[#303a32]">
                Performance Trends
              </h3>

              <p className="mt-1 text-xs text-[#92998f]">
                Booking creation and actual payment collection trends
              </p>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <TrendChart
                title="Booking Trend"
                description="Number of bookings created"
                data={data.series}
                dataKey="bookings"
                formatter={(value) => `${value} bookings`}
              />

              <TrendChart
                title="Revenue Trend"
                description="Actual payments received"
                data={data.series}
                dataKey="revenue"
                formatter={money}
              />
            </div>
          </div>
        </>
      ) : null}

      {loading && data && (
        <p className="text-right text-xs text-[#92998f]">
          Updating reports...
        </p>
      )}
    </section>
  );
}
