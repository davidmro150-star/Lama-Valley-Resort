
"use client";

import { useState } from "react";
import CottageBookingPanel from "@/components/website/CottageBookingPanel";
import BookingCalendar from "@/components/website/BookingCalendar";

export default function CottageBookingWrapper({ cottage }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const handleDateChange = (newCheckIn, newCheckOut) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
  };

  return (
    <>
      <CottageBookingPanel
        cottage={cottage}
        checkIn={checkIn}
        checkOut={checkOut}
        onDateChange={handleDateChange}
        guests={guests}
        onGuestsChange={setGuests}
      />

      {/* Full-width calendar */}
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

        <BookingCalendar
          checkIn={checkIn}
          checkOut={checkOut}
          onDateChange={handleDateChange}
          monthCount={2}
        />
      </section>
    </>
  );
}
