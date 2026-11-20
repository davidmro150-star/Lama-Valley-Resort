
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  Check,
  X,
  Ban,
  Loader2,
  ShieldCheck,
  Trash2,
} from "lucide-react";

export default function BookingActions({
  bookingId,
  status,
  paymentStatus,
  hasAdditionalPayments = false,
}) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const isPendingBooking = status === "pending";
  const isConfirmedBooking = status === "confirmed";

  const isPaymentSubmitted = paymentStatus === "submitted";
  const isPaymentVerified = paymentStatus === "verified";

  const deletableStatuses = [
    "pending",
    "cancelled",
    "rejected",
    "expired",
  ];

  const canAttemptDelete =
    deletableStatuses.includes(status) &&
    !["submitted", "verified", "refunded"].includes(paymentStatus) &&
    !hasAdditionalPayments;

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

  async function deleteBooking() {
    const confirmed = window.confirm(
      "PERMANENT DELETE WARNING\n\n" +
      "This will permanently remove this booking from MongoDB.\n\n" +
      "This action cannot be undone.\n\n" +
      "Are you sure you want to continue?"
    );

    if (!confirmed) return;

    setMessage("");

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/admin/bookings/${bookingId}`,
          {
            method: "DELETE",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          setMessage(result.message || "Unable to delete booking.");
          return;
        }

        setMessage(result.message || "Booking deleted successfully.");
        router.refresh();
      } catch (error) {
        console.error("Booking deletion error:", error);
        setMessage("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="min-w-[140px] space-y-2">
      {isPendingBooking && (
        <>
          {isPaymentSubmitted && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => performAction("verify-payment")}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-2 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
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
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#234b3b] px-2 py-2 text-xs font-semibold text-white hover:bg-[#173729] disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Check size={13} />
              )}
              Confirm Booking
            </button>
          )}

          <button
            type="button"
            disabled={isPending}
            onClick={() => performAction("rejected", "rejected")}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
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
          onClick={() => performAction("cancelled", "cancelled")}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Ban size={13} />
          )}
          Cancel Booking
        </button>
      )}

      {canAttemptDelete && (
        <button
          type="button"
          disabled={isPending}
          onClick={deleteBooking}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-2 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Trash2 size={13} />
          )}
          Delete Booking
        </button>
      )}

      {message && (
        <p
          className="max-w-[200px] text-[10px] text-gray-600"
          role="status"
        >
          {message}
        </p>
      )}
    </div>
  );
}
