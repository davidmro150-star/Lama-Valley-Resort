
"use client";

import { useState } from "react";
import { Eye, X, Loader2, AlertCircle } from "lucide-react";

export default function PaymentProofViewer({ bookingId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openScreenshot() {
    setIsOpen(true);
    setLoading(true);
    setError("");
    setImageUrl("");

    try {
      const response = await fetch(
        `/api/admin/bookings/${bookingId}/payment-proof`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || !data.success || !data.imageUrl) {
        throw new Error(data.message || "Unable to load screenshot.");
      }

      setImageUrl(data.imageUrl);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openScreenshot}
        className="mt-2 inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1.5 text-[10px] font-semibold text-blue-700 transition hover:bg-blue-100"
      >
        <Eye size={13} />
        View Screenshot
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900">
                  Payment Screenshot
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Review the guest's payment evidence.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close screenshot"
              >
                <X size={20} />
              </button>
            </div>

            {loading && (
              <div className="flex min-h-60 items-center justify-center gap-2 text-sm text-gray-500">
                <Loader2 size={20} className="animate-spin" />
                Loading screenshot...
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {imageUrl && (
              <img
                src={imageUrl}
                alt="Guest payment screenshot"
                className="mx-auto max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
              />
            )}

            <p className="mt-4 text-center text-[11px] text-gray-400">
              Always verify the transaction in the actual payment account
              before approving it.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
