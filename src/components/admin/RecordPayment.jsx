
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Loader2, PlusCircle } from "lucide-react";

export default function RecordPayment({
  bookingId,
  outstandingAmount,
  canRecord,
}) {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    if (paymentAmount > outstandingAmount) {
      setError("Payment cannot exceed the remaining balance.");
      return;
    }

    if (method !== "cash" && !reference.trim()) {
      setError("Please enter the transaction or reference ID.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/bookings/${bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "record-payment",
            amount: paymentAmount,
            method,
            reference: reference.trim(),
            note: note.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to record payment."
        );
      }

      setMessage(data.message);
      setAmount("");
      setMethod("cash");
      setReference("");
      setNote("");

      router.refresh();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!canRecord || outstandingAmount <= 0) {
    return (
      <div className="rounded-xl bg-green-50 p-4">
        <p className="text-sm font-semibold text-green-800">
          {outstandingAmount <= 0
            ? "This booking is fully paid."
            : "Additional payments can be recorded after the booking is confirmed and its advance payment is verified."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:p-5"
    >
      <div className="flex items-center gap-2">
        <Banknote className="h-5 w-5 text-[#234b3b]" />

        <h3 className="font-bold text-gray-900">
          Record Additional Payment
        </h3>
      </div>

      <div className="rounded-lg bg-white p-4">
        <p className="text-xs font-medium text-gray-500">
          Outstanding Balance
        </p>

        <p className="mt-1 text-2xl font-bold text-[#234b3b]">
          ৳{outstandingAmount.toLocaleString("en-BD")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="paymentAmount"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Payment Amount (৳) *
          </label>

          <input
            id="paymentAmount"
            type="number"
            min="0.01"
            max={outstandingAmount}
            step="0.01"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Enter amount"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
          />
        </div>

        <div>
          <label
            htmlFor="paymentMethod"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Payment Method *
          </label>

          <select
            id="paymentMethod"
            value={method}
            onChange={(event) => setMethod(event.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
          >
            <option value="cash">Cash</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>
      </div>

      {method !== "cash" && (
        <div>
          <label
            htmlFor="paymentReference"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Transaction / Reference ID *
          </label>

          <input
            id="paymentReference"
            type="text"
            required
            maxLength={100}
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="Enter transaction ID"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="paymentNote"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Note (Optional)
        </label>

        <textarea
          id="paymentNote"
          rows={3}
          maxLength={500}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add any payment details..."
          className="w-full resize-y rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Recording...
          </>
        ) : (
          <>
            <PlusCircle className="h-4 w-4" />
            Record Payment
          </>
        )}
      </button>
    </form>
  );
}
