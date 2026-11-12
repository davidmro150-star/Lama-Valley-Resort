
"use client";

import { useEffect, useState } from "react";
import CottageBookingPanel from "@/components/website/CottageBookingPanel";
import BookingCalendar from "@/components/website/BookingCalendar";

export default function CottageBookingWrapper({ cottage }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");

  const handleDateChange = (newCheckIn, newCheckOut) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
  };

  useEffect(() => {
    if (!cottage?.slug) return;

    let isMounted = true;
    let isFetching = false;
    let controller = null;

    async function fetchAvailability(isInitial = false) {
      // Prevent overlapping requests.
      if (isFetching) return;

      isFetching = true;
      controller = new AbortController();

      try {
        const response = await fetch(
          `/api/bookings/availability?slug=${encodeURIComponent(
            cottage.slug
          )}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load cottage availability."
          );
        }

        if (isMounted) {
          setUnavailableDates(data.unavailableDates || []);
          setAvailabilityError("");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Availability fetch error:", error);

          if (isMounted && isInitial) {
            setAvailabilityError(
              "Unable to load availability. Please refresh the page."
            );
          }
        }
      } finally {
        isFetching = false;

        if (isMounted && isInitial) {
          setLoadingAvailability(false);
        }
      }
    }

    // Initial availability request.
    fetchAvailability(true);

    // Refresh availability every 15 seconds.
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchAvailability();
      }
    }, 15000);

    // Refresh immediately when the guest returns to the tab.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAvailability();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      isMounted = false;

      clearInterval(interval);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      controller?.abort();
    };
  }, [cottage?.slug]);

  return (
    <>
      {/* Booking Panel */}
      <CottageBookingPanel
        cottage={cottage}
        checkIn={checkIn}
        checkOut={checkOut}
        onDateChange={handleDateChange}
        guests={guests}
        onGuestsChange={setGuests}
        unavailableDates={unavailableDates}
      />

      {/* Full-width Calendar */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#c49a62]">
            Plan Your Stay
          </p>

          <h2 className="mt-2 text-3xl font-semibold text-[#234b3b]">
            Select Your Dates
          </h2>

          <p className="mt-2 text-gray-600">
            Choose your check-in and check-out dates.
          </p>
        </div>

        {loadingAvailability ? (
          <p className="rounded-xl bg-gray-50 p-6 text-center text-gray-600">
            Loading availability...
          </p>
        ) : availabilityError ? (
          <p className="rounded-xl bg-red-50 p-6 text-center text-red-700">
            {availabilityError}
          </p>
        ) : (
          <BookingCalendar
            checkIn={checkIn}
            checkOut={checkOut}
            onDateChange={handleDateChange}
            monthCount={2}
            unavailableDates={unavailableDates}
          />
        )}
      </section>
    </>
  );
}
