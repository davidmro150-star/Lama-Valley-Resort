
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  Ban,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function BookingActions({
  bookingId,
  status,
  paymentStatus,
}) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const isPendingBooking = status === "pending";
  const isConfirmedBooking = status === "confirmed";
  const isPaymentSubmitted = paymentStatus === "submitted";
  const isPaymentVerified = paymentStatus === "verified";

  async function performAction(action, value = null) {
    const labels = {
      "verify-payment": "verify this payment",
      confirmed: "confirm this booking",
      rejected: "reject this booking",
      cancelled: "cancel this booking",
    };

    if (!window.confirm(`Are you sure you want to ${labels[action]}?`)) {
      return;
    }

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
            body: JSON.stringify(
              action === "verify-payment"
                ? { action }
                : { status: value }
            ),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          setMessage(result.message || "Unable to update booking.");
          return;
        }

        setMessage(result.message || "Booking updated successfully.");
        router.refresh();
      } catch (error) {
        console.error("Booking action error:", error);
        setMessage("Something went wrong. Please try again.");
      }
    });
  }

  if (!isPendingBooking && !isConfirmedBooking) {
    return (
      <span className="text-xs text-gray-400">
        No actions available
      </span>
    );
  }

  return (
    <div className="min-w-[140px] space-y-2">
      {isPendingBooking && (
        <>
          {/* Payment Verification */}
          {isPaymentSubmitted && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => performAction("verify-payment")}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <ShieldCheck size={13} />
              )}
              Verify Payment
            </button>
          )}

          {isPaymentVerified && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => performAction("confirmed", "confirmed")}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#234b3b] px-2 py-2 text-xs font-semibold text-white transition hover:bg-[#173729] disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Check size={13} />
              )}
              Confirm Booking
            </button>
          )}

          {/* Reject Booking */}
          <button
            type="button"
            disabled={isPending}
            onClick={() => performAction("reject", "rejected")}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-2 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <X size={13} />
            )}
            Reject
          </button>

          {!isPaymentSubmitted && !isPaymentVerified && (
            <p className="text-[10px] text-amber-600">
              Payment not submitted
            </p>
          )}
        </>
      )}

      {isConfirmedBooking && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => performAction("cancel", "cancelled")}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-2 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
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
        <p className="max-w-[180px] text-[10px] text-gray-500" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
