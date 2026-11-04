
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  CalendarDays,
  Users,
  BedDouble,
  ArrowLeft,
  Clock,
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
            Review your reservation details before continuing.
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
                <BedDouble
                  className="mt-1 text-[#c49a62]"
                  size={22}
                />

                <div>
                  <p className="text-sm text-[#777d73]">
                    Cottage
                  </p>

                  <p className="font-medium capitalize text-[#252a25]">
                    {cottageSlug
                      ? cottageSlug.replaceAll("-", " ")
                      : "Not selected"}
                  </p>
                </div>
              </div>

              {/* Check-in */}
              <div className="flex items-start gap-4">
                <CalendarDays
                  className="mt-1 text-[#c49a62]"
                  size={22}
                />

                <div>
                  <p className="text-sm text-[#777d73]">
                    Check-in
                  </p>

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
                <CalendarDays
                  className="mt-1 text-[#c49a62]"
                  size={22}
                />

                <div>
                  <p className="text-sm text-[#777d73]">
                    Check-out
                  </p>

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
                <Users
                  className="mt-1 text-[#c49a62]"
                  size={22}
                />

                <div>
                  <p className="text-sm text-[#777d73]">
                    Guests
                  </p>

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
                <span className="text-white/70">
                  Number of nights
                </span>

                <span>{nights}</span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-white/70">
                  Number of guests
                </span>

                <span>{guests}</span>
              </div>
            </div>

            <div className="flex justify-between gap-4 pt-6">
              <span className="text-lg">
                Estimated total
              </span>

              <span className="text-2xl font-semibold text-[#e8d6b8]">
                ৳{formatPrice(estimatedTotal)}
              </span>
            </div>

            <p className="mt-5 text-xs leading-6 text-white/60">
              This is an estimated amount. Your reservation will be
              subject to availability and confirmation by the resort.
            </p>
          </section>
        </div>

        {/* Booking Information */}
        <div className="mt-8 rounded-xl border border-[#e8d6b8] bg-[#fffdf8] p-5">
          <h3 className="mb-2 font-semibold text-[#173729]">
            Check-in & Check-out Policy
          </h3>

          <div className="space-y-2 text-sm text-[#777d73]">
            <p>
              Check-in time: <strong className="text-[#173729]">1:00 PM</strong>
            </p>

            <p>
              Check-out time: <strong className="text-[#173729]">11:00 AM</strong>
            </p>
          </div>

          <p className="mt-4 border-t border-[#e8d6b8] pt-4 text-sm leading-6 text-[#777d73]">
            Your booking has not been submitted yet. Please review
            your reservation details before continuing.
          </p>
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
