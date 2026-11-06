
"use client";

import { useState } from "react";
import {
  Search,
  CalendarDays,
  Users,
  Moon,
  House,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
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

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-700",
  };

  const icons = {
    pending: Clock,
    confirmed: CheckCircle2,
    rejected: XCircle,
    cancelled: XCircle,
  };

  const Icon = icons[status] || AlertCircle;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold capitalize ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      <Icon size={16} />
      {status}
    </span>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[#f7f5ef] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#234b3b]">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-gray-800">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function BookingStatusPage() {
  const [bookingReference, setBookingReference] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setBooking(null);
    setLoading(true);

    try {
      const response = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingReference,
          guestEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to find your booking."
        );
      }

      setBooking(data.booking);
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-4 py-16 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-4xl">

        {/* Page Heading */}
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#c49a62]">
            Lama Valley Resort
          </p>

          <h1 className="text-3xl font-bold text-[#173729] sm:text-4xl">
            Check Your Booking
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">
            Enter your booking reference and email address
            to view your reservation details and current status.
          </p>
        </div>

        {/* Lookup Form */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-[#173729]">
            Find Your Reservation
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Use the booking reference provided when you submitted
            your reservation.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">

            <div>
              <label
                htmlFor="bookingReference"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Booking Reference
              </label>

              <input
                id="bookingReference"
                type="text"
                required
                maxLength={17}
                placeholder="LV-2026-XXXXXXXX"
                value={bookingReference}
                onChange={(event) =>
                  setBookingReference(event.target.value.toUpperCase())
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#234b3b] focus:ring-2 focus:ring-[#234b3b]/10"
              />
            </div>

            <div>
              <label
                htmlFor="guestEmail"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email Address
              </label>

              <input
                id="guestEmail"
                type="email"
                required
                placeholder="Enter the email used for booking"
                value={guestEmail}
                onChange={(event) => setGuestEmail(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#234b3b] focus:ring-2 focus:ring-[#234b3b]/10"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#234b3b] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search size={18} />
              {loading ? "Checking Booking..." : "Check Booking Status"}
            </button>
          </form>
        </section>

        {/* Booking Result */}
        {booking && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* Result Header */}
            <div className="border-b border-gray-200 bg-[#173729] p-6 text-white sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white/70">
                    Booking Reference
                  </p>

                  <h2 className="mt-1 text-xl font-bold tracking-wide sm:text-2xl">
                    {booking.bookingReference}
                  </h2>
                </div>

                <StatusBadge status={booking.status} />
              </div>

              <p className="mt-5 text-sm text-white/80">
                Thank you, {booking.guestName}. Here are your reservation
                details.
              </p>
            </div>

            {/* Booking Information */}
            <div className="space-y-7 p-6 sm:p-8">
              <div>
                <h3 className="mb-4 text-lg font-semibold text-[#173729]">
                  Reservation Details
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailItem
                    icon={House}
                    label="Accommodation"
                    value={booking.cottage}
                  />

                  <DetailItem
                    icon={Users}
                    label="Number of Guests"
                    value={`${booking.guests} Guest(s)`}
                  />

                  <DetailItem
                    icon={CalendarDays}
                    label="Check-in"
                    value={formatDate(booking.checkIn)}
                  />

                  <DetailItem
                    icon={CalendarDays}
                    label="Check-out"
                    value={formatDate(booking.checkOut)}
                  />

                  <DetailItem
                    icon={Moon}
                    label="Duration"
                    value={`${booking.nights} Night(s)`}
                  />

                  <DetailItem
                    icon={CreditCard}
                    label="Payment Status"
                    value={booking.paymentStatus}
                  />
                </div>
              </div>

              {/* Total Price */}
              <div className="rounded-xl border border-[#c49a62]/30 bg-[#c49a62]/10 p-5">
                <p className="text-sm font-medium text-gray-600">
                  Total Reservation Amount
                </p>

                <p className="mt-2 text-3xl font-bold text-[#173729]">
                  {formatPrice(booking.totalPrice)}
                </p>
              </div>

              {/* Status Messages */}
              {booking.status === "pending" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                  Your reservation request is awaiting confirmation.
                  Our resort administration will review your booking
                  and update its status.
                </div>
              )}

              {booking.status === "confirmed" && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800">
                  Your reservation has been confirmed!
                  Please keep your booking reference for future
                  communication with the resort.
                </div>
              )}

              {booking.status === "rejected" && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
                  Unfortunately, this reservation was not approved.
                  Please contact the resort for more information.
                </div>
              )}

              {booking.status === "cancelled" && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                  This reservation has been cancelled.
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
