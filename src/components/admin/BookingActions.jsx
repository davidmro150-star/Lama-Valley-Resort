
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
  canDelete = false,
}) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const isPendingBooking = status === "pending";
  const isConfirmedBooking = status === "confirmed";

  const isPaymentSubmitted = paymentStatus === "submitted";
  const isPaymentVerified = paymentStatus === "verified";

  // Admin can delete bookings regardless of status or payment history.
  // Manager cannot delete because canDelete is false.
  const canAttemptDelete = canDelete === true;

  function showMessage(text, type = "error") {
    setMessage(text);
    setMessageType(type);
  }

  async function readResponse(response) {
    try {
      return await response.json();
    } catch {
      return {
        success: false,
        message: "The server returned an invalid response.",
      };
    }
  }

  async function performAction(action, value = null) {
    if (isPending) return;

    const labels = {
      "verify-payment": "verify this payment",
      confirmed: "confirm this booking",
      rejected: "reject this booking",
      cancelled: "cancel this booking",
    };

    const actionLabel = labels[action];

    if (!actionLabel) return;

    if (!window.confirm(`Are you sure you want to ${actionLabel}?`)) {
      return;
    }

    setMessage("");
    setMessageType("");

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

        const result = await readResponse(response);

        if (!response.ok || result.success === false) {
          showMessage(
            result.message || "Unable to update booking."
          );
          return;
        }

        showMessage(
          result.message || "Booking updated successfully.",
          "success"
        );

        router.refresh();
      } catch (error) {
        console.error("Booking action error:", error);

        showMessage(
          "Unable to connect to the server. Please try again."
        );
      }
    });
  }

  async function deleteBooking() {
    if (isPending) return;

    if (!canAttemptDelete) {
      showMessage("You are not allowed to delete this booking.");
      return;
    }

    const confirmed = window.confirm(
      "PERMANENT DELETE WARNING\n\n" +
      "You are about to permanently delete this booking.\n\n" +
      "This includes its booking information and payment history.\n\n" +
      "This action cannot be undone.\n\n" +
      "Are you absolutely sure you want to continue?"
    );

    if (!confirmed) return;

    setMessage("");
    setMessageType("");

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/admin/bookings/${bookingId}`,
          {
            method: "DELETE",
          }
        );

        const result = await readResponse(response);

        // Confirm successful deletion from the API.
        if (!response.ok || result.success !== true) {
          showMessage(
            result.message || "Unable to delete booking."
          );
          return;
        }

        showMessage(
          result.message || "Booking deleted successfully.",
          "success"
        );

        // Refresh the server-rendered booking list.
        router.refresh();
      } catch (error) {
        console.error("Booking deletion error:", error);

        showMessage(
          "Unable to connect to the server. Please try again."
        );
      }
    });
  }

  return (
    <div className="min-w-[140px] space-y-2">
      {/* Pending booking actions */}
      {isPendingBooking && (
        <>
          {isPaymentSubmitted && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => performAction("verify-payment")}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
              onClick={() =>
                performAction("confirmed", "confirmed")
              }
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#234b3b] px-2 py-2 text-xs font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-50"
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
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-2 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* Confirmed booking action */}
      {isConfirmedBooking && (
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            performAction("cancelled", "cancelled")
          }
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-2 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Ban size={13} />
          )}
          Cancel Booking
        </button>
      )}

      {/* Admin-only permanent deletion */}
      {canAttemptDelete && (
        <button
          type="button"
          disabled={isPending}
          onClick={deleteBooking}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-2 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Trash2 size={13} />
          )}
          Delete Booking
        </button>
      )}

      {/* Feedback */}
      {message && (
        <p
          className={`max-w-[200px] text-[10px] ${messageType === "success"
              ? "text-green-700"
              : "text-red-600"
            }`}
          role="status"
        >
          {message}
        </p>
      )}
    </div>
  );
}
