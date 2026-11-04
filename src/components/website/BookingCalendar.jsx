
"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Monday-first calendar
  const startDay = (firstDay.getDay() + 6) % 7;

  return [
    ...Array(startDay).fill(null),
    ...Array.from(
      { length: totalDays },
      (_, index) => new Date(year, month, index + 1)
    ),
  ];
}

function isSameDay(date, selectedDate) {
  return date && selectedDate && formatDate(date) === selectedDate;
}

export default function BookingCalendar({
  checkIn,
  checkOut,
  onDateChange,
  monthCount = 2,
  compact = false,
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const today = formatDate(new Date());

  const changeMonth = (direction) => {
    setCurrentMonth((current) => {
      return new Date(
        current.getFullYear(),
        current.getMonth() + direction,
        1
      );
    });
  };

  const selectDate = (date) => {
    const selectedDate = formatDate(date);

    if (!checkIn || checkOut || selectedDate <= checkIn) {
      onDateChange(selectedDate, "");
    } else {
      onDateChange(checkIn, selectedDate);
    }
  };

  const months = Array.from({ length: monthCount }, (_, index) => {
    return new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + index,
      1
    );
  });

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className={compact ? "space-y-4" : "rounded-2xl border border-border bg-surface p-5 sm:p-8"}>
      {/* Calendar Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          {!compact && (
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <CalendarDays size={16} />
              Choose Your Dates
            </div>
          )}

          <h3 className="font-display text-xl text-primary-dark">
            Select Your Stay
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-primary transition hover:bg-surface-muted"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-primary transition hover:bg-surface-muted"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Selected Dates */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-surface-muted p-3">
          <p className="mb-1 text-xs text-muted">Check-in</p>
          <p className="text-sm font-semibold text-primary-dark">
            {checkIn || "Select date"}
          </p>
        </div>

        <div className="rounded-lg bg-surface-muted p-3">
          <p className="mb-1 text-xs text-muted">Check-out</p>
          <p className="text-sm font-semibold text-primary-dark">
            {checkOut || "Select date"}
          </p>
        </div>
      </div>

      {/* Calendar Months */}
      <div className={compact ? "space-y-6" : "grid gap-8 md:grid-cols-2"}>
        {months.map((month) => {
          const year = month.getFullYear();
          const monthIndex = month.getMonth();
          const days = getMonthDays(year, monthIndex);

          return (
            <div key={`${year}-${monthIndex}`}>
              <h4 className="mb-4 text-center font-semibold text-primary-dark">
                {month.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h4>

              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-xs font-medium text-muted"
                  >
                    {day}
                  </div>
                ))}

                {days.map((date, index) => {
                  if (!date) {
                    return (
                      <div key={`empty-${index}`} />
                    );
                  }

                  const dateString = formatDate(date);
                  const isPast = dateString < today;

                  const isCheckIn = isSameDay(date, checkIn);
                  const isCheckOut = isSameDay(date, checkOut);

                  const isSelected = isCheckIn || isCheckOut;

                  const isBetween =
                    checkIn &&
                    checkOut &&
                    dateString > checkIn &&
                    dateString < checkOut;

                  return (
                    <button
                      key={dateString}
                      type="button"
                      disabled={isPast}
                      onClick={() => selectDate(date)}
                      aria-label={date.toDateString()}
                      aria-pressed={isSelected}
                      className={`
                        aspect-square rounded-lg text-xs font-medium transition
                        ${isPast ? "cursor-not-allowed text-muted/40" : "hover:bg-surface-muted"}
                        ${isSelected ? "bg-primary text-white hover:bg-primary-dark" : ""}
                        ${isBetween ? "bg-surface-muted text-primary-dark" : ""}
                      `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-xs text-muted">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-primary" />
          Selected
        </span>

        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-surface-muted" />
          Stay range
        </span>

        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-border" />
          Available to select
        </span>
      </div>
    </div>
  );
}
