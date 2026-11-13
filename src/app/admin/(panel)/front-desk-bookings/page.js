
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Banknote,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

function getToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return parts;
}

export default function FrontDeskBookingPage() {
  const router = useRouter();

  const [checkIn, setCheckIn] = useState(getToday());
  const [checkOut, setCheckOut] = useState("");
  const [cottages, setCottages] = useState([]);
  const [selectedCottage, setSelectedCottage] = useState(null);

  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guests, setGuests] = useState(1);

  const [amountReceived, setAmountReceived] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round(
            (new Date(`${checkOut}T00:00:00Z`).getTime() -
              new Date(`${checkIn}T00:00:00Z`).getTime()) /
              86400000
          )
        )
      : 0;

  const totalPrice = selectedCottage
    ? Number(selectedCottage.price) * nights
    : 0;

  const received = Number(amountReceived) || 0;
  const remaining = Math.max(0, totalPrice - received);

  async function checkAvailability() {
    setError("");
    setSuccessMessage("");
    setSelectedCottage(null);
    setCottages([]);
    setAvailabilityChecked(false);

    if (!checkIn || !checkOut) {
      setError("Please select check-in and check-out dates.");
      return;
    }

    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }

    setLoadingAvailability(true);

    try {
      const response = await fetch(
        `/api/admin/front-desk-bookings/availability?checkIn=${checkIn}&checkOut=${checkOut}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to check availability.");
      }

      setCottages(data.cottages || []);
      setAvailabilityChecked(true);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoadingAvailability(false);
    }
  }

  async function createBooking(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!selectedCottage) {
      setError("Please select an available cottage.");
      return;
    }

    if (received < 0 || received > totalPrice) {
      setError("Received amount cannot exceed the total booking price.");
      return;
    }

    if (received > 0 && !paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/front-desk-bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cottage: selectedCottage._id,
          guestName,
          guestEmail,
          guestPhone,
          checkIn,
          checkOut,
          guests: Number(guests),
          amountReceived: received,
          paymentMethod: received > 0 ? paymentMethod : undefined,
          paymentReference,
          paymentNote,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Booking could not be created.");
      }

      setSuccessMessage(
        `Booking created successfully! Reference: ${data.booking.bookingReference}`
      );

      router.refresh();

      // Refresh availability after successful booking.
      setSelectedCottage(null);
      await checkAvailability();

      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      setGuests(1);
      setAmountReceived("0");
      setPaymentReference("");
      setPaymentNote("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div>
        <Link
          href="/admin"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#234b3b]"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-gray-900">
          Front Desk Booking
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Create walk-in reservations and record payments received at the resort.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* Date selection */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <CalendarDays size={20} />
          Select Booking Dates
        </h2>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Check-in
            </label>
            <input
              type="date"
              min={getToday()}
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                setSelectedCottage(null);
                setAvailabilityChecked(false);
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#234b3b]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Check-out
            </label>
            <input
              type="date"
              min={checkIn || getToday()}
              value={checkOut}
              onChange={(e) => {
                setCheckOut(e.target.value);
                setSelectedCottage(null);
                setAvailabilityChecked(false);
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#234b3b]"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={checkAvailability}
              disabled={loadingAvailability}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-5 py-3 font-semibold text-white hover:bg-[#173729] disabled:opacity-60"
            >
              {loadingAvailability ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Search size={18} />
              )}
              {loadingAvailability ? "Checking..." : "Check Availability"}
            </button>
          </div>
        </div>

        {nights > 0 && (
          <p className="mt-4 text-sm text-gray-500">
            Selected stay: <strong>{nights}</strong> night(s)
          </p>
        )}
      </section>

      {/* Cottage availability */}
      {availabilityChecked && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Cottage Availability
            </h2>
            <p className="text-sm text-gray-500">
              Select one of the available cottages.
            </p>
          </div>

          {cottages.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500">
              No active cottages were found.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cottages.map((cottage) => {
                const isSelected = selectedCottage?._id === cottage._id;

                return (
                  <button
                    type="button"
                    key={cottage._id}
                    disabled={!cottage.isAvailable}
                    onClick={() => setSelectedCottage(cottage)}
                    className={`rounded-xl border p-5 text-left transition ${
                      !cottage.isAvailable
                        ? "cursor-not-allowed border-red-200 bg-red-50 opacity-70"
                        : isSelected
                          ? "border-[#234b3b] bg-green-50 ring-2 ring-[#234b3b]"
                          : "border-gray-200 bg-white hover:border-[#234b3b]"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        {cottage.name}
                      </h3>

                      {cottage.isAvailable ? (
                        <CheckCircle2 className="text-green-600" size={20} />
                      ) : (
                        <XCircle className="text-red-500" size={20} />
                      )}
                    </div>

                    <p className="text-sm text-gray-500">
                      Capacity: {cottage.capacity} guests
                    </p>

                    <p className="mt-3 text-lg font-bold text-[#234b3b]">
                      ৳{Number(cottage.price).toLocaleString("en-BD")}
                      <span className="text-sm font-normal text-gray-500">
                        {" "} / night
                      </span>
                    </p>

                    <p
                      className={`mt-3 text-sm font-semibold ${
                        cottage.isAvailable
                          ? "text-green-700"
                          : "text-red-600"
                      }`}
                    >
                      {cottage.isAvailable
                        ? isSelected
                          ? "Selected"
                          : "Available"
                        : "Booked"}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Guest and payment form */}
      {selectedCottage && (
        <form
          onSubmit={createBooking}
          className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Guest Information
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Booking cottage: {selectedCottage.name}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Guest Name *
              </label>
              <input
                required
                minLength={2}
                maxLength={100}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter guest name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#234b3b]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                required
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#234b3b]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#234b3b]"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users size={16} />
                Number of Guests *
              </label>
              <input
                type="number"
                min="1"
                max={selectedCottage.capacity}
                required
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#234b3b]"
              />
            </div>
          </div>

          {/* Payment */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Banknote size={20} />
              Payment Received
            </h2>

            <div className="grid gap-4 rounded-xl bg-[#f7f5ef] p-5 sm:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  ৳{totalPrice.toLocaleString("en-BD")}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Received</p>
                <p className="mt-1 text-xl font-bold text-green-700">
                  ৳{received.toLocaleString("en-BD")}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Remaining Balance</p>
                <p className="mt-1 text-xl font-bold text-red-600">
                  ৳{remaining.toLocaleString("en-BD")}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Amount Received (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalPrice}
                  step="0.01"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#234b3b]"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter 0 if the guest has not paid anything yet.
                </p>
              </div>

              {received > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Payment Method *
                  </label>
                  <select
                    required
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#234b3b]"
                  >
                    <option value="cash">Cash</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
              )}

              {received > 0 && paymentMethod !== "cash" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Transaction Reference (Optional)
                  </label>
                  <input
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Enter transaction reference"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#234b3b]"
                  />
                </div>
              )}

              {received > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Payment Note (Optional)
                  </label>
                  <input
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Additional payment details"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#234b3b]"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setSelectedCottage(null)}
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-6 py-3 font-semibold text-white hover:bg-[#173729] disabled:opacity-60"
            >
              {saving && <Loader2 className="animate-spin" size={18} />}
              {saving ? "Creating Booking..." : "Create Confirmed Booking"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
