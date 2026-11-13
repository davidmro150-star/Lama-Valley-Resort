
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function SyncRestaurantPayments({
  bookingId,
  canSync,
  orderCount,
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function handleSync() {
    if (loading || !canSync || orderCount === 0) return;

    const confirmed = window.confirm(
      "Synchronize existing booking payments with restaurant orders? This will not record or collect any new payment."
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const response = await fetch(
        `/api/admin/bookings/${bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "sync-restaurant-payments",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Payment synchronization failed."
        );
      }

      setMessage(
        `${result.restaurantOrdersUpdated} restaurant order(s) checked. ${result.paidOrders} fully paid. Checkout allocations: ৳${Number(
          result.checkoutAllocations || 0
        ).toFixed(2)}.`
      );

      router.refresh();
    } catch (err) {
      setError(true);
      setMessage(
        err.message || "Unable to synchronize payments."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!canSync || orderCount === 0) return null;

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-blue-900">
            Restaurant Payment Reconciliation
          </p>

          <p className="mt-1 text-sm text-blue-800">
            Reconcile existing cottage checkout payments with
            linked restaurant orders. No new payment will be recorded.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSync}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />

          {loading ? "Synchronizing..." : "Synchronize Payments"}
        </button>
      </div>

      {message && (
        <p
          role="status"
          className={`mt-3 rounded-lg p-3 text-sm ${error
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
            }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
