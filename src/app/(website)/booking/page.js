
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  CalendarDays,
  Users,
  BedDouble,
  ArrowLeft,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import Link from "next/link";

function BookingContent() {
  const searchParams = useSearchParams();

  const cottageSlug = searchParams.get("cottage") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || "1";
  const nights = searchParams.get("nights") || "0";
  const estimatedTotal = searchParams.get("estimatedTotal") || "0";

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const formatDate = (date) => {
    if (!date) return "Not selected";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (price) =>
    Number(price).toLocaleString("en-BD");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cottage: cottageSlug,
          guestName,
          guestEmail,
          guestPhone,
          checkIn,
          checkOut,
          guests: Number(guests),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to submit your booking."
        );
      }

      setSuccess(data.booking);
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Booking success screen
  if (success) {
    return (
      <main className="min-h-screen bg-[#f7f5ef] px-4 py-20">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm md:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f0eb]">
            <CheckCircle2 size={42} className="text-[#234b3b]" />
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[3px] text-[#c49a62]">
            Lama Valley Resort
          </p>

          <h1 className="text-3xl font-semibold text-[#173729]">
            Booking Request Submitted!
          </h1>

          <p className="mt-4 leading-7 text-[#777d73]">
            Thank you for choosing Lama Valley Resort.
            Your booking request has been received and is
            currently pending confirmation.
          </p>

          <div className="my-8 rounded-xl bg-[#f7f5ef] p-5 text-left">
            <p className="text-sm text-[#777d73]">
              Booking Reference
            </p>

            <p className="mt-1 break-all font-semibold text-[#173729]">
              {success.id}
            </p>

            <div className="my-4 border-t border-[#e8d6b8]" />

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-[#777d73]">Status</span>
              <span className="font-semibold capitalize text-[#9a692c]">
                {success.status}
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-4 text-sm">
              <span className="text-[#777d73]">Total amount</span>
              <span className="font-semibold text-[#173729]">
                ৳{formatPrice(success.totalPrice)}
              </span>
            </div>
          </div>

          <p className="mb-6 text-sm leading-6 text-[#777d73]">
            The resort team will need to confirm your reservation.
            Please keep your booking reference for future communication.
          </p>

          <Link
            href="/stays"
            className="inline-flex items-center justify-center rounded-lg bg-[#234b3b] px-7 py-3 font-semibold text-white transition hover:bg-[#173729]"
          >
            Explore More Cottages
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] py-16">
      <div className="container mx-auto max-w-5xl px-4">
        <Link
          href="/stays"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#426b55] hover:text-[#173729]"
        >
          <ArrowLeft size={17} />
          Back to cottages
        </Link>

        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[3px] text-[#c49a62]">
            Lama Valley Resort
          </p>

          <h1 className="font-serif text-4xl text-[#173729] md:text-5xl">
            Complete Your Booking
          </h1>

          <p className="mt-4 text-[#777d73]">
            Review your reservation and provide your contact information.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          {/* Reservation Details */}
          <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-2xl font-semibold text-[#173729]">
              Your Reservation
            </h2>

            <div className="space-y-6">
              {/* Cottage */}
              <div className="flex items-start gap-4">
                <BedDouble className="mt-1 text-[#c49a62]" size={22} />

                <div>
                  <p className="text-sm text-[#777d73]">Cottage</p>

                  <p className="font-medium capitalize text-[#252a25]">
                    {cottageSlug
                      ? cottageSlug.replaceAll("-", " ")
                      : "Not selected"}
                  </p>
                </div>
              </div>

              {/* Check-in */}
              <div className="flex items-start gap-4">
                <CalendarDays className="mt-1 text-[#c49a62]" size={22} />

                <div>
                  <p className="text-sm text-[#777d73]">Check-in</p>

                  <p className="font-medium text-[#252a25]">
                    {formatDate(checkIn)}
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-sm text-[#426b55]">
                    <Clock size={15} />
                    <span>From 1:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Check-out */}
              <div className="flex items-start gap-4">
                <CalendarDays className="mt-1 text-[#c49a62]" size={22} />

                <div>
                  <p className="text-sm text-[#777d73]">Check-out</p>

                  <p className="font-medium text-[#252a25]">
                    {formatDate(checkOut)}
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-sm text-[#426b55]">
                    <Clock size={15} />
                    <span>Until 11:00 AM</span>
                  </div>
                </div>
              </div>

              {/* Guests */}
              <div className="flex items-start gap-4">
                <Users className="mt-1 text-[#c49a62]" size={22} />

                <div>
                  <p className="text-sm text-[#777d73]">Guests</p>

                  <p className="font-medium text-[#252a25]">
                    {guests} guests
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Price Summary */}
          <section className="h-fit rounded-2xl bg-[#173729] p-6 text-white md:p-8">
            <h2 className="mb-6 text-2xl font-semibold">
              Price Summary
            </h2>

            <div className="space-y-4 border-b border-white/20 pb-6">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-white/70">Number of nights</span>
                <span>{nights}</span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-white/70">Number of guests</span>
                <span>{guests}</span>
              </div>
            </div>

            <div className="flex justify-between gap-4 pt-6">
              <span className="text-lg">Estimated total</span>

              <span className="text-2xl font-semibold text-[#e8d6b8]">
                ৳{formatPrice(estimatedTotal)}
              </span>
            </div>

            <p className="mt-5 text-xs leading-6 text-white/60">
              This is an estimated amount. The final amount is
              calculated and verified by the resort booking system.
            </p>
          </section>
        </div>

        {/* Guest Information Form */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <div className="mb-7">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#c49a62]">
              Guest Details
            </p>

            <h2 className="text-2xl font-semibold text-[#173729]">
              Your Information
            </h2>

            <p className="mt-2 text-sm text-[#777d73]">
              Please provide your contact details to submit your reservation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Guest Name */}
            <div>
              <label
                htmlFor="guestName"
                className="mb-2 block text-sm font-medium text-[#252a25]"
              >
                Full Name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-[#777d73]"
                />

                <input
                  id="guestName"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  className="w-full rounded-lg border border-[#e5e3da] bg-[#fffdf8] py-3 pr-4 pl-11 text-sm text-[#252a25] outline-none transition focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="guestEmail"
                className="mb-2 block text-sm font-medium text-[#252a25]"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-[#777d73]"
                />

                <input
                  id="guestEmail"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-[#e5e3da] bg-[#fffdf8] py-3 pr-4 pl-11 text-sm text-[#252a25] outline-none transition focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="guestPhone"
                className="mb-2 block text-sm font-medium text-[#252a25]"
              >
                Phone Number
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-[#777d73]"
                />

                <input
                  id="guestPhone"
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+880 1XXXXXXXXX"
                  required
                  maxLength={25}
                  autoComplete="tel"
                  className="w-full rounded-lg border border-[#e5e3da] bg-[#fffdf8] py-3 pr-4 pl-11 text-sm text-[#252a25] outline-none transition focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                loading ||
                !cottageSlug ||
                !checkIn ||
                !checkOut
              }
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-6 py-4 font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  Submitting Booking...
                </>
              ) : (
                "Submit Booking Request"
              )}
            </button>

            <p className="text-center text-xs leading-6 text-[#777d73]">
              Submitting this request does not mean your booking is confirmed.
              The resort must review and confirm your reservation.
            </p>
          </form>
        </section>

        {/* Booking Information */}
        <div className="mt-8 rounded-xl border border-[#e8d6b8] bg-[#fffdf8] p-5">
          <h3 className="mb-2 font-semibold text-[#173729]">
            Check-in & Check-out Policy
          </h3>

          <div className="space-y-2 text-sm text-[#777d73]">
            <p>
              Check-in time:{" "}
              <strong className="text-[#173729]">1:00 PM</strong>
            </p>

            <p>
              Check-out time:{" "}
              <strong className="text-[#173729]">11:00 AM</strong>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-[#777d73]">
          Loading booking details...
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
