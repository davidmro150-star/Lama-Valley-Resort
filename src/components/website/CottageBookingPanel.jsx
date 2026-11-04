
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Users, Minus, Plus, ArrowUpRight } from "lucide-react";
import BookingCalendar from "./BookingCalendar";

export default function CottageBookingPanel({
  cottage,
  checkIn,
  checkOut,
  onDateChange,
  guests,
  onGuestsChange,
  unavailableDates = [],
}) {
  const router = useRouter();

  const maxGuests =
    cottage.occupancy?.maxGuests || cottage.capacity || 1;

  const nightlyPrice =
    cottage.pricing?.discountedPrice ?? cottage.price ?? 0;

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);

    const difference = end.getTime() - start.getTime();

    return difference > 0
      ? Math.round(difference / (1000 * 60 * 60 * 24))
      : 0;
  }, [checkIn, checkOut]);

  const total = nights * nightlyPrice;

  const handleBooking = () => {
    if (!checkIn || !checkOut || nights < 1) return;

    const query = new URLSearchParams({
      cottage: cottage.slug,
      checkIn,
      checkOut,
      guests: String(guests),
      nights: String(nights),
      estimatedTotal: String(total),
    });

    router.push(`/booking?${query.toString()}`);
  };

  return (
    <aside className="rounded-2xl border border-border bg-surface p-5 shadow-soft sm:p-6 lg:sticky lg:top-28">
      {/* Price */}
      <div className="mb-5">
        <p className="text-sm text-muted">Starting from</p>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-primary-dark">
            ৳{nightlyPrice.toLocaleString("en-BD")}
          </span>

          <span className="text-sm text-muted">/ night</span>
        </div>

        {cottage.pricing?.regularPrice > nightlyPrice && (
          <p className="mt-1 text-sm text-muted">
            <span className="line-through">
              ৳{cottage.pricing.regularPrice.toLocaleString("en-BD")}
            </span>

            <span className="ml-2 text-primary">
              Special price
            </span>
          </p>
        )}
      </div>

      {/* Compact Calendar */}
      <div className="border-y border-border py-5">
        <BookingCalendar
          checkIn={checkIn}
          checkOut={checkOut}
          onDateChange={onDateChange}
          monthCount={1}
          compact
          unavailableDates={unavailableDates}
        />
      </div>

      {/* Guests */}
      <div className="py-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Users size={17} className="text-primary" />
          Number of Guests
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              {guests} {guests === 1 ? "Guest" : "Guests"}
            </p>

            <p className="text-xs text-muted">
              Maximum {maxGuests} guests
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                onGuestsChange(Math.max(1, guests - 1))
              }
              disabled={guests <= 1}
              aria-label="Remove one guest"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-primary transition hover:bg-surface-muted disabled:opacity-40"
            >
              <Minus size={15} />
            </button>

            <span className="w-4 text-center text-sm font-semibold">
              {guests}
            </span>

            <button
              type="button"
              onClick={() =>
                onGuestsChange(Math.min(maxGuests, guests + 1))
              }
              disabled={guests >= maxGuests}
              aria-label="Add one guest"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-primary transition hover:bg-surface-muted disabled:opacity-40"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Price Calculation */}
      {nights > 0 && (
        <div className="space-y-3 border-y border-border py-5 text-sm">
          <div className="flex justify-between text-muted">
            <span>
              ৳{nightlyPrice.toLocaleString("en-BD")} × {nights}{" "}
              {nights === 1 ? "night" : "nights"}
            </span>

            <span>৳{total.toLocaleString("en-BD")}</span>
          </div>

          <div className="flex justify-between font-semibold text-primary-dark">
            <span>Estimated Total</span>

            <span>৳{total.toLocaleString("en-BD")}</span>
          </div>
        </div>
      )}

      {/* Booking Button */}
      <button
        type="button"
        onClick={handleBooking}
        disabled={!checkIn || !checkOut || nights < 1}
        className="btn btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continue to Booking
        <ArrowUpRight size={17} />
      </button>

      <p className="mt-4 text-center text-xs leading-6 text-muted">
        Your booking request will be submitted for availability confirmation.
      </p>
    </aside>
  );
}
