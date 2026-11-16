
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  MapPin,
  Phone,
  ShoppingBag,
  UserRound,
  Wallet,
  Clock3,
  Receipt,
} from "lucide-react";

function formatMoney(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date) {
  if (!date) return "Not available";

  return new Date(date).toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  });
}

function formatMethod(method) {
  const methods = {
    cash: "Cash",
    bkash: "bKash",
    nagad: "Nagad",
    bank: "Bank Transfer",
  };

  return methods[method] || method || "Not specified";
}

function StatusBadge({ value }) {
  const isPaid = value === "paid";
  const isCancelled = value === "cancelled";

  const styles = isPaid
    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
    : isCancelled
      ? "bg-red-50 text-red-700 ring-red-600/20"
      : "bg-amber-50 text-amber-700 ring-amber-600/20";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 ring-inset ${styles}`}
    >
      {isPaid && <CheckCircle2 size={13} />}
      {(value || "unknown").replaceAll("_", " ")}
    </span>
  );
}

export default function RestaurantOrderDetails({ order }) {
  const router = useRouter();

  const [method, setMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const directPayments = order.payments || [];
  const checkoutAllocations = order.checkoutPaymentAllocations || [];

  const directPaid = directPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const checkoutPaid = checkoutAllocations.reduce(
    (sum, allocation) => sum + Number(allocation.amount || 0),
    0
  );

  const totalPaid = directPaid + checkoutPaid;
  const orderTotal = Number(order.total || 0);

  const isPaid =
    order.paymentStatus === "paid" || totalPaid >= orderTotal;

  const isCancelled = order.orderStatus === "cancelled";
  const isCottageBill = order.paymentMode === "cottage_bill";

  const canRecordPayment =
    !isCottageBill &&
    !isCancelled &&
    !isPaid &&
    directPayments.length === 0;

  const totalQuantity = (order.items || []).reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  async function handlePaymentSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/restaurant-orders/${order._id}/payments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method,
            reference,
            note,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to record payment.");
      }

      setSuccess(data.message || "Full payment recorded successfully.");
      setReference("");
      setNote("");
      router.refresh();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <a
            href="/admin/restaurant/orders"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#426b55] transition hover:text-[#173729]"
          >
            <ArrowLeft size={16} />
            Back to Restaurant Orders
          </a>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#173729]">
              Restaurant Order
            </h1>

            <span className="rounded-lg bg-[#f7f5ef] px-3 py-1.5 font-mono text-sm font-semibold text-[#426b55]">
              {order.orderNumber}
            </span>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Review customer information, order history, bill details and payment records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge value={order.orderStatus} />
          <StatusBadge value={isPaid ? "paid" : "unpaid"} />
        </div>
      </div>

      {/* Financial overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          icon={Receipt}
          label="Total Order Amount"
          value={formatMoney(orderTotal)}
          description="Final bill including charges and discount"
        />

        <SummaryCard
          icon={Wallet}
          label="Payment Received"
          value={formatMoney(totalPaid)}
          description="Recorded restaurant and checkout payments"
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Payment Status"
          value={isPaid ? "Paid" : "Unpaid"}
          description={
            isPaid
              ? "Payment is fully settled"
              : "Payment is not yet recorded"
          }
          success={isPaid}
        />
      </div>

      {/* Payment action */}
      {canRecordPayment && (
        <section className="overflow-hidden rounded-2xl border border-[#dce7df] bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 bg-[#f4f8f4] px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#234b3b] text-white">
              <CreditCard size={19} />
            </div>

            <div>
              <h2 className="font-bold text-[#173729]">
                Record Full Payment
              </h2>
              <p className="text-xs text-gray-500">
                Record the complete restaurant bill in one transaction.
              </p>
            </div>
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-5 p-5">
            <div className="flex flex-col justify-between gap-2 rounded-xl border border-[#e3eadf] bg-[#f7f8f4] p-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Full amount to collect
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  This amount is calculated from the saved order.
                </p>
              </div>

              <p className="text-3xl font-bold tracking-tight text-[#234b3b]">
                {formatMoney(orderTotal)}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Payment Method <span className="text-red-500">*</span>
                </label>

                <select
                  required
                  value={method}
                  onChange={(event) => setMethod(event.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/15"
                >
                  <option value="cash">Cash</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Transaction / Reference Number
                </label>

                <input
                  type="text"
                  maxLength={100}
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="Optional reference number"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/15"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Payment Note
              </label>

              <textarea
                rows={3}
                maxLength={500}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Optional note about this payment..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/15"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                {success}
              </p>
            )}

            <div className="flex flex-col justify-between gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center">
              <p className="text-xs text-gray-500">
                Confirm that the full amount has actually been received before recording.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#234b3b] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 size={17} />
                {loading ? "Recording..." : "Confirm Full Payment"}
              </button>
            </div>
          </form>
        </section>
      )}

      {isCottageBill && (
        <section className="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <Wallet size={21} />
          </div>

          <div>
            <h2 className="font-bold text-amber-950">
              Added to Cottage Bill
            </h2>

            <p className="mt-1 text-sm leading-6 text-amber-900/80">
              This restaurant order is included in the guest&apos;s accommodation bill. Collect the combined amount during checkout and record the payment against the booking. The existing booking payment can then be allocated to this restaurant order.
            </p>
          </div>
        </section>
      )}

      {isCancelled && (
        <Notice
          title="Order Cancelled"
          message="This order has been cancelled. No further payments can be recorded."
          tone="red"
        />
      )}

      {isPaid && !isCancelled && (
        <Notice
          title="Payment Completed"
          message="The full restaurant order amount has been received and recorded successfully."
          tone="green"
        />
      )}

      {/* Order information */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeading
          icon={ClipboardList}
          title="Order Information"
          description="Customer and order details"
        />

        <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem icon={FileText} label="Order Number" value={order.orderNumber} />
          <InfoItem
            icon={ShoppingBag}
            label="Order Type"
            value={order.orderType === "walk-in" ? "Walk-in" : "Cottage Guest"}
          />
          <InfoItem
            icon={CreditCard}
            label="Payment Mode"
            value={isCottageBill ? "Add to Cottage Bill" : "Pay Immediately"}
          />
          <InfoItem icon={UserRound} label="Customer" value={order.guestName || "Walk-in Guest"} />
          <InfoItem icon={Phone} label="Phone" value={order.guestPhone || "Not provided"} />
          <InfoItem icon={MapPin} label="Cottage" value={order.cottage?.name || "Walk-in"} />
          <InfoItem
            icon={FileText}
            label="Booking Reference"
            value={order.booking?.bookingReference || "N/A"}
          />
          <InfoItem icon={CalendarDays} label="Created At" value={formatDate(order.createdAt)} />
          <InfoItem icon={ShoppingBag} label="Total Quantity" value={totalQuantity} />
        </div>
      </section>

      {/* Food items */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeading
          icon={ShoppingBag}
          title="Food Items"
          description={`${(order.items || []).length} item types · ${totalQuantity} total quantity`}
        />

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[550px] text-left text-sm">
            <thead>
              <tr className="border-y border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 font-semibold">Food Item</th>
                <th className="px-4 py-3 font-semibold">Unit Price</th>
                <th className="px-4 py-3 font-semibold">Quantity</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {(order.items || []).map((item, index) => (
                <tr key={item._id || index} className="hover:bg-gray-50/70">
                  <td className="px-4 py-4 font-semibold text-gray-800">
                    {item.name}
                    {item.itemType === "custom" && (
                      <span className="ml-2 rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase text-gray-500">
                        Custom
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-gray-600">{formatMoney(item.price)}</td>
                  <td className="px-4 py-4 text-gray-600">{item.quantity}</td>

                  <td className="px-4 py-4 text-right font-bold text-gray-800">
                    {formatMoney(
                      item.lineTotal ??
                      Number(item.price || 0) * Number(item.quantity || 0)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bill breakdown */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeading
          icon={Receipt}
          title="Bill Breakdown"
          description="Complete calculation of this restaurant order"
        />

        <div className="mt-5 ml-auto max-w-xl space-y-4">
          <BillRow label="Food Subtotal" amount={order.subtotal} />

          {(order.extraCharges || []).length > 0 ? (
            order.extraCharges.map((charge, index) => (
              <BillRow
                key={charge._id || index}
                label={charge.name || "Additional Charge"}
                amount={charge.amount}
              />
            ))
          ) : Number(order.extraChargesTotal || 0) > 0 ? (
            <BillRow label="Additional Charges" amount={order.extraChargesTotal} />
          ) : null}

          {Number(order.discount || 0) > 0 && (
            <BillRow label="Discount" amount={order.discount} negative />
          )}

          <div className="border-t border-dashed border-gray-200 pt-4">
            <div className="flex items-center justify-between gap-4">
              <span className="font-bold text-[#173729]">Final Order Total</span>
              <span className="text-2xl font-bold text-[#234b3b]">
                {formatMoney(order.total)}
              </span>
            </div>
          </div>
        </div>

        {order.note && (
          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Order Note
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-700">{order.note}</p>
          </div>
        )}
      </section>

      {/* Payment history */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeading
          icon={Wallet}
          title="Payment Records"
          description="Recorded payments associated with this order"
        />

        {directPayments.length === 0 && checkoutAllocations.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
            <Wallet className="mx-auto text-gray-400" size={28} />
            <p className="mt-3 text-sm font-semibold text-gray-700">
              No payment recorded yet
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Payment details will appear here once recorded.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {directPayments.map((payment, index) => (
              <PaymentRecord
                key={payment._id || index}
                title={formatMethod(payment.method)}
                amount={payment.amount}
                date={payment.paidAt}
                reference={payment.reference}
                note={payment.note}
                recordedBy={payment.recordedBy?.name}
              />
            ))}

            {checkoutAllocations.map((allocation, index) => (
              <PaymentRecord
                key={allocation._id || index}
                title="Cottage Checkout Payment"
                amount={allocation.amount}
                date={allocation.allocatedAt}
                note="Allocated from an existing booking payment"
                highlighted
              />
            ))}
          </div>
        )}
      </section>

      {/* Status */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeading
          icon={Clock3}
          title="Order Status"
          description="Current order and payment state"
        />

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-500">Order:</span>
          <StatusBadge value={order.orderStatus} />
          <span className="ml-2 text-sm text-gray-500">Payment:</span>
          <StatusBadge value={isPaid ? "paid" : "unpaid"} />
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, description, success = false }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${success ? "bg-emerald-50 text-emerald-700" : "bg-[#f2f5f1] text-[#426b55]"
            }`}
        >
          <Icon size={18} />
        </span>
      </div>

      <p className={`mt-3 text-2xl font-bold tracking-tight ${success ? "text-emerald-700" : "text-[#234b3b]"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </div>
  );
}

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f2f5f1] text-[#426b55]">
        <Icon size={19} />
      </span>
      <div>
        <h2 className="font-bold text-[#173729]">{title}</h2>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-[#78917f]" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-semibold text-gray-800">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}

function BillRow({ label, amount, negative = false }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${negative ? "text-red-600" : "text-gray-800"}`}>
        {negative ? "-" : ""}
        {formatMoney(amount)}
      </span>
    </div>
  );
}

function PaymentRecord({ title, amount, date, reference, note, recordedBy, highlighted = false }) {
  return (
    <div
      className={`flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${highlighted ? "border-amber-200 bg-amber-50/60" : "border-gray-200 bg-white"
        }`}
    >
      <div className="flex gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${highlighted ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700"
            }`}
        >
          <Wallet size={18} />
        </span>

        <div>
          <p className="text-sm font-bold capitalize text-gray-800">{title}</p>
          <p className="mt-1 text-xs text-gray-500">{formatDate(date)}</p>

          {reference && (
            <p className="mt-1 text-xs text-gray-500">Reference: {reference}</p>
          )}

          {recordedBy && (
            <p className="mt-1 text-xs text-gray-500">Recorded by: {recordedBy}</p>
          )}

          {note && <p className="mt-1 text-xs text-gray-500">Note: {note}</p>}
        </div>
      </div>

      <p className="text-lg font-bold text-emerald-700">{formatMoney(amount)}</p>
    </div>
  );
}

function Notice({ title, message, tone }) {
  const green = tone === "green";

  return (
    <div
      className={`flex gap-3 rounded-2xl border p-5 ${green
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
        }`}
    >
      <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
      <div>
        <p className="font-bold">{title}</p>
        <p className="mt-1 text-sm">{message}</p>
      </div>
    </div>
  );
}
