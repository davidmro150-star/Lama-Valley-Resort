
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Ban, Loader2 } from "lucide-react";

export default function BookingActions({ bookingId, status }) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const isPendingBooking = status === "pending";
  const isConfirmedBooking = status === "confirmed";

  if (!isPendingBooking && !isConfirmedBooking) {
    return (
      <span className="text-xs text-gray-400">
        No actions available
      </span>
    );
  }

  async function updateBooking(nextStatus) {
    const actionLabels = {
      confirmed: "confirm",
      rejected: "reject",
      cancelled: "cancel",
    };

    const action = actionLabels[nextStatus];

    const approved = window.confirm(
      `Are you sure you want to ${action} this booking?`
    );

    if (!approved) return;

    setMessage("");

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/admin/bookings/${bookingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: nextStatus,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          setMessage(
            result.message || "Unable to update booking."
          );
          return;
        }

        setMessage(result.message || "Booking updated.");

        router.refresh();
      } catch (error) {
        console.error("Booking action error:", error);

        setMessage("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="min-w-[150px] space-y-2">
      {/* Pending Booking Actions */}
      {isPendingBooking && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => updateBooking("confirmed")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#234b3b] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Check size={13} />
            )}
            Confirm
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => updateBooking("rejected")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={13} />
            Reject
          </button>
        </div>
      )}

      {/* Confirmed Booking Actions */}
      {isConfirmedBooking && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => updateBooking("cancelled")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Ban size={13} />
          )}
          Cancel Booking
        </button>
      )}

      {message && (
        <p className="max-w-[180px] text-xs text-gray-500" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
