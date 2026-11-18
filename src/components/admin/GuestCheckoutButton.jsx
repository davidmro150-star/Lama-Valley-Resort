
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function GuestCheckoutButton({
  bookingId,
  canCheckout,
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    if (!canCheckout || loading) return;

    const confirmed = window.confirm(
      "Are you sure you want to complete checkout for this guest? This action will record the checkout date and admin."
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/bookings/${bookingId}/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Could not complete guest checkout."
        );
      }

      // Navigate to the invoice after successful checkout.
      router.push(
        `/admin/bookings/${bookingId}/invoice?print=true`
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-green-50 p-2">
          <CheckCircle2 className="h-5 w-5 text-green-700" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900">
            Guest Checkout
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Complete the guest&apos;s checkout after confirming that
            all cottage and restaurant bills have been paid.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={!canCheckout || loading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing Checkout...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Complete Guest Checkout
          </>
        )}
      </button>

      {!canCheckout && (
        <p className="mt-3 text-xs text-gray-500">
          Checkout is available only for confirmed bookings
          with a zero outstanding balance that have not
          already been checked out.
        </p>
      )}
    </div>
  );
}
