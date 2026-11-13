
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  UserRound,
  House,
  Phone,
  Mail,
  Utensils,
  CreditCard,
  Receipt,
  Wallet,
  CheckCircle2,
  Clock3,
  Hash,
  FileImage,
  ShieldCheck,
  RefreshCw,
  Banknote,
} from "lucide-react";

import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";
import RestaurantOrder from "@/models/RestaurantOrder";

import PaymentProofViewer from "@/components/admin/PaymentProofViewer";
import BookingActions from "@/components/admin/BookingActions";
import RecordPayment from "@/components/admin/RecordPayment";
import SyncRestaurantPayments from "@/components/admin/SyncRestaurantPayments";

export const dynamic = "force-dynamic";

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date(date));
}

function formatDateTime(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  }).format(new Date(date));
}

function formatPrice(amount) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function StatusBadge({ status }) {
  const value = String(status || "unknown").toLowerCase();

  const styles = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    rejected: "bg-red-50 text-red-700 ring-red-200",
    cancelled: "bg-gray-100 text-gray-600 ring-gray-200",
    submitted: "bg-blue-50 text-blue-700 ring-blue-200",
    verified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    unpaid: "bg-amber-50 text-amber-700 ring-amber-200",
    partially_paid: "bg-blue-50 text-blue-700 ring-blue-200",
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    refunded: "bg-purple-50 text-purple-700 ring-purple-200",
    recorded: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    open: "bg-amber-50 text-amber-700 ring-amber-200",
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    "fully paid": "bg-emerald-50 text-emerald-700 ring-emerald-200",
    "payment incomplete": "bg-amber-50 text-amber-700 ring-amber-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
        styles[value] || "bg-gray-100 text-gray-600 ring-gray-200"
      }`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}

function SectionHeading({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#234b3b]/10 text-[#234b3b]">
          <Icon size={19} />
        </div>

        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-5 text-gray-500">
              {description}
            </p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
        {Icon && <Icon size={13} />}
        {label}
      </div>
      <p className="mt-1.5 break-words text-sm font-semibold text-gray-900">
        {value || "—"}
      </p>
    </div>
  );
}

function SummaryCard({ label, amount, icon: Icon, type = "default", note }) {
  const styles = {
    default: "bg-white border-gray-200 text-gray-900",
    received: "bg-emerald-50 border-emerald-100 text-emerald-800",
    due: "bg-amber-50 border-amber-100 text-amber-800",
  };

  const iconStyles = {
    default: "bg-gray-100 text-gray-600",
    received: "bg-emerald-100 text-emerald-700",
    due: "bg-amber-100 text-amber-700",
  };

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${styles[type]}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium opacity-80">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconStyles[type]}`}>
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
        {formatPrice(amount)}
      </p>

      {note && <p className="mt-1 text-xs opacity-70">{note}</p>}
    </div>
  );
}

function DetailRow({ label, amount, muted = false, bold = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span
        className={`text-sm ${
          bold ? "font-bold text-gray-900" : "text-gray-500"
        }`}
      >
        {label}
      </span>

      <span
        className={`shrink-0 text-right text-sm ${
          bold ? "font-bold text-gray-900" : "font-semibold text-gray-800"
        } ${muted ? "text-emerald-700" : ""}`}
      >
        {formatPrice(amount)}
      </span>
    </div>
  );
}

export default async function BookingDetailsPage({ params }) {
  const { id } = await params;

  let booking;
  let restaurantOrders = [];

  try {
    await connectDB();

    booking = await Booking.findById(id)
      .populate("cottage", "name")
      .populate("payments.recordedBy", "name email")
      .lean();

    if (!booking) notFound();

    restaurantOrders = await RestaurantOrder.find({
      booking: booking._id,
      orderStatus: { $ne: "cancelled" },
    })
      .sort({ createdAt: -1 })
      .lean();
  } catch (error) {
    console.error("Booking details error:", error);
    notFound();
  }

  if (!booking) notFound();

  // --------------------------------------------------
  // PAYMENT CALCULATIONS
  // --------------------------------------------------

  const cottageTotal = Number(booking.totalPrice) || 0;

  const verifiedAdvance =
    booking.paymentStatus === "verified"
      ? Number(booking.paymentAmount) || 0
      : 0;

  const bookingAdditionalPayments = Array.isArray(booking.payments)
    ? booking.payments.reduce(
        (sum, payment) => sum + (Number(payment.amount) || 0),
        0
      )
    : 0;

  const bookingPaymentsReceived =
    verifiedAdvance + bookingAdditionalPayments;

  const restaurantTotal = restaurantOrders.reduce(
    (sum, order) => sum + (Number(order.total) || 0),
    0
  );

  const restaurantPayments = restaurantOrders.reduce(
    (allPayments, order) => {
      const payments = Array.isArray(order.payments) ? order.payments : [];

      return allPayments.concat(
        payments.map((payment) => ({
          ...payment,
          orderNumber: order.orderNumber,
        }))
      );
    },
    []
  );

  const restaurantPaymentsReceived = restaurantPayments.reduce(
    (sum, payment) => sum + (Number(payment.amount) || 0),
    0
  );

  const restaurantCheckoutAllocations = restaurantOrders.reduce(
    (sum, order) => {
      const allocations = Array.isArray(order.checkoutPaymentAllocations)
        ? order.checkoutPaymentAllocations
        : [];

      return (
        sum +
        allocations.reduce(
          (allocationSum, allocation) =>
            allocationSum + (Number(allocation.amount) || 0),
          0
        )
      );
    },
    0
  );

  const grandTotal = cottageTotal + restaurantTotal;

  // Allocations are references to booking payments.
  // They must not be added again here.
  const totalReceived =
    bookingPaymentsReceived + restaurantPaymentsReceived;

  const remaining = Math.max(grandTotal - totalReceived, 0);
  const isFullyPaid = remaining <= 0;

  const canSynchronize =
    booking.status === "confirmed" &&
    booking.paymentStatus === "verified" &&
    restaurantOrders.length > 0;

  // --------------------------------------------------
  // PAYMENT HISTORY
  // --------------------------------------------------

  const paymentRecords = [];

  if (Number(booking.paymentAmount) > 0) {
    const advanceStatus =
      booking.paymentStatus === "verified"
        ? "Verified"
        : booking.paymentStatus === "submitted"
          ? "Submitted"
          : booking.paymentStatus === "rejected"
            ? "Rejected"
            : booking.paymentStatus === "refunded"
              ? "Refunded"
              : "Unpaid";

    paymentRecords.push({
      id: "advance",
      type: "Initial Cottage Advance",
      amount: Number(booking.paymentAmount),
      method: booking.paymentMethod || "—",
      reference: booking.transactionId || "—",
      note: "Original booking advance payment",
      paidAt: booking.paymentVerifiedAt || booking.createdAt,
      recordedBy: "Guest submission",
      status: advanceStatus,
    });
  }

  if (Array.isArray(booking.payments)) {
    booking.payments.forEach((payment, index) => {
      const recordedBy =
        payment.recordedBy &&
        typeof payment.recordedBy === "object"
          ? payment.recordedBy.name ||
            payment.recordedBy.email ||
            "Administrator"
          : "Administrator";

      paymentRecords.push({
        id: payment._id?.toString() || `payment-${index}`,
        type: "Additional Booking Payment",
        amount: Number(payment.amount) || 0,
        method: payment.method || "—",
        reference: payment.reference || "—",
        note: payment.note || "—",
        paidAt: payment.paidAt,
        recordedBy,
        status: "Recorded",
      });
    });
  }

  paymentRecords.sort(
    (a, b) =>
      new Date(a.paidAt || 0).getTime() -
      new Date(b.paidAt || 0).getTime()
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      {/* PAGE HEADER */}
      <div>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#234b3b]"
        >
          <ArrowLeft size={16} />
          Back to bookings
        </Link>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Booking Details
              </h1>

              <StatusBadge status={booking.status} />
              <StatusBadge status={booking.paymentStatus} />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <Hash size={15} />
              <span>Booking reference:</span>
              <span className="font-semibold text-gray-800">
                {booking.bookingReference || "—"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            {isFullyPaid ? (
              <CheckCircle2 className="text-emerald-600" size={20} />
            ) : (
              <Clock3 className="text-amber-600" size={20} />
            )}

            <div>
              <p className="text-xs text-gray-500">Guest account</p>
              <p className={`text-sm font-bold ${isFullyPaid ? "text-emerald-700" : "text-amber-700"}`}>
                {isFullyPaid ? "Fully settled" : "Payment outstanding"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FINANCIAL OVERVIEW */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Total Bill"
          amount={grandTotal}
          icon={Receipt}
          note="Cottage + restaurant charges"
        />

        <SummaryCard
          label="Amount Received"
          amount={totalReceived}
          icon={Wallet}
          type="received"
          note="Verified and recorded payments"
        />

        <SummaryCard
          label="Outstanding Balance"
          amount={remaining}
          icon={Banknote}
          type={isFullyPaid ? "received" : "due"}
          note={isFullyPaid ? "No payment due" : "Amount to collect"}
        />
      </div>

      {/* MAIN TWO COLUMN LAYOUT */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* LEFT COLUMN */}
        <div className="min-w-0 space-y-6">
          {/* GUEST INFORMATION */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeading
              icon={UserRound}
              title="Guest Information"
              description="Personal and contact details of the guest."
            />

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <InfoItem icon={UserRound} label="Guest Name" value={booking.guestName} />
              <InfoItem icon={Mail} label="Email Address" value={booking.guestEmail} />
              <InfoItem icon={Phone} label="Phone Number" value={booking.guestPhone} />
              <InfoItem icon={UserRound} label="Number of Guests" value={booking.guests} />
            </div>
          </section>

          {/* STAY INFORMATION */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeading
              icon={House}
              title="Stay Information"
              description="Accommodation and reservation schedule."
            />

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <InfoItem
                icon={House}
                label="Cottage"
                value={booking.cottage?.name || "Cottage unavailable"}
              />
              <InfoItem
                icon={CalendarDays}
                label="Booking Created"
                value={formatDate(booking.createdAt)}
              />
              <InfoItem
                icon={CalendarDays}
                label="Check-in"
                value={formatDate(booking.checkIn)}
              />
              <InfoItem
                icon={CalendarDays}
                label="Check-out"
                value={formatDate(booking.checkOut)}
              />
            </div>
          </section>

          {/* RESTAURANT ORDERS */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeading
              icon={Utensils}
              title="Restaurant Orders"
              description="Food orders and charges linked to this cottage booking."
              action={
                <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  {restaurantOrders.length} {restaurantOrders.length === 1 ? "Order" : "Orders"}
                </span>
              }
            />

            {restaurantOrders.length > 0 ? (
              <div className="mt-6 space-y-4">
                {restaurantOrders.map((order) => {
                  const directReceived = (order.payments || []).reduce(
                    (sum, payment) =>
                      sum + (Number(payment.amount) || 0),
                    0
                  );

                  const checkoutReceived = (
                    order.checkoutPaymentAllocations || []
                  ).reduce(
                    (sum, allocation) =>
                      sum + (Number(allocation.amount) || 0),
                    0
                  );

                  const orderReceived = directReceived + checkoutReceived;

                  const orderRemaining = Math.max(
                    (Number(order.total) || 0) - orderReceived,
                    0
                  );

                  return (
                    <div
                      key={order._id.toString()}
                      className="overflow-hidden rounded-xl border border-gray-200"
                    >
                      <div className="flex flex-col gap-3 bg-gray-50/80 p-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="break-all font-bold text-gray-900">
                            {order.orderNumber || "Restaurant Order"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatDateTime(order.createdAt)}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <StatusBadge status={order.orderStatus} />
                            <StatusBadge status={order.paymentStatus} />
                          </div>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-xs text-gray-500">Order total</p>
                          <p className="mt-1 text-xl font-bold text-gray-900">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Ordered items
                        </p>

                        <div className="space-y-3">
                          {(order.items || []).map((item, index) => (
                            <div
                              key={item._id?.toString() || index}
                              className="flex items-start justify-between gap-3 text-sm"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-gray-800">
                                  {item.name}
                                </p>
                                <p className="mt-0.5 text-xs text-gray-500">
                                  Quantity: {item.quantity}
                                </p>
                              </div>

                              <p className="shrink-0 font-semibold text-gray-800">
                                {formatPrice(item.lineTotal)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {(order.extraCharges || []).length > 0 && (
                          <div className="mt-4 border-t border-dashed border-gray-200 pt-3">
                            <p className="mb-2 text-xs font-semibold text-gray-500">
                              Additional charges
                            </p>

                            {order.extraCharges.map((charge, index) => (
                              <div
                                key={charge._id?.toString() || index}
                                className="flex justify-between gap-3 py-1 text-sm"
                              >
                                <span className="text-gray-600">{charge.name}</span>
                                <span className="font-medium text-gray-800">
                                  {formatPrice(charge.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 space-y-1 border-t border-gray-100 pt-3">
                          <DetailRow label="Food subtotal" amount={order.subtotal} />
                          <DetailRow label="Discount" amount={-(Number(order.discount) || 0)} muted />
                          <div className="mt-2 border-t border-gray-100 pt-2">
                            <DetailRow label="Order total" amount={order.total} bold />
                          </div>
                        </div>

                        {directReceived > 0 && (
                          <div className="mt-4 rounded-xl bg-emerald-50 p-3">
                            <p className="mb-2 text-xs font-bold text-emerald-800">
                              Direct restaurant payments
                            </p>

                            {(order.payments || []).map((payment, index) => (
                              <div
                                key={payment._id?.toString() || index}
                                className="flex flex-wrap justify-between gap-2 py-1 text-sm text-emerald-800"
                              >
                                <span className="capitalize">
                                  {payment.method} · {formatDate(payment.paidAt)}
                                </span>
                                <span className="font-semibold">
                                  {formatPrice(payment.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {checkoutReceived > 0 && (
                          <div className="mt-3 rounded-xl bg-blue-50 p-3">
                            <div className="flex items-center gap-2 text-blue-800">
                              <CreditCard size={15} />
                              <p className="text-xs font-bold">
                                Covered by cottage checkout payments
                              </p>
                            </div>

                            <p className="mt-2 text-lg font-bold text-blue-900">
                              {formatPrice(checkoutReceived)}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-blue-700">
                              Allocated from existing booking payments. This amount is not counted twice.
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
                          <span>
                            {order.paymentMode === "cottage_bill"
                              ? "Added to cottage bill"
                              : "Immediate payment"}
                          </span>
                          <span>
                            Received:{" "}
                            <strong className="text-gray-800">
                              {formatPrice(orderReceived)}
                            </strong>
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                          <span className="text-sm font-medium text-gray-600">
                            Order balance
                          </span>
                          <span className={`text-sm font-bold ${orderRemaining <= 0 ? "text-emerald-700" : "text-amber-700"}`}>
                            {formatPrice(orderRemaining)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <Utensils className="mx-auto text-gray-300" size={28} />
                <p className="mt-3 text-sm font-semibold text-gray-700">
                  No restaurant orders yet
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Restaurant orders linked to this booking will appear here.
                </p>
              </div>
            )}

            {/* RESTAURANT TOTALS */}
            <div className="mt-5 rounded-xl bg-[#234b3b]/5 p-4">
              <DetailRow label="Total restaurant charges" amount={restaurantTotal} bold />
              <DetailRow label="Direct restaurant payments" amount={restaurantPaymentsReceived} muted />
              <DetailRow label="Covered by cottage checkout payments" amount={restaurantCheckoutAllocations} muted />
            </div>
          </section>

          {/* PAYMENT HISTORY */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeading
              icon={CreditCard}
              title="Payment History"
              description="A record of advance and additional cottage payments."
              action={
                <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  {paymentRecords.length} Records
                </span>
              }
            />

            {paymentRecords.length > 0 ? (
              <div className="mt-6">
                <div className="relative space-y-5 before:absolute before:bottom-5 before:left-[15px] before:top-5 before:w-px before:bg-gray-200">
                  {paymentRecords.map((payment, index) => (
                    <div key={payment.id || index} className="relative flex gap-4">
                      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700">
                        <CreditCard size={15} />
                      </div>

                      <div className="min-w-0 flex-1 rounded-xl border border-gray-200 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {payment.type}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {formatDateTime(payment.paidAt)}
                            </p>
                          </div>

                          <div className="sm:text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {formatPrice(payment.amount)}
                            </p>
                            <div className="mt-1">
                              <StatusBadge status={payment.status} />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 border-t border-gray-100 pt-3 sm:grid-cols-2">
                          <InfoItem
                            label="Payment method"
                            value={payment.method}
                          />
                          <InfoItem
                            label="Reference / Transaction ID"
                            value={payment.reference}
                          />
                          <InfoItem
                            label="Recorded by"
                            value={payment.recordedBy}
                          />
                          <InfoItem
                            label="Note"
                            value={payment.note}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-5 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                No cottage payment records found.
              </p>
            )}
          </section>

          {/* ADVANCE PAYMENT PROOF */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeading
              icon={ShieldCheck}
              title="Advance Payment Verification"
              description="Original advance submitted by the guest."
            />

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <InfoItem
                label="Advance percentage"
                value={`${booking.advancePercentage || 0}%`}
              />
              <InfoItem
                label="Advance amount"
                value={formatPrice(booking.paymentAmount)}
              />
              <InfoItem
                label="Payment method"
                value={booking.paymentMethod}
              />
              <InfoItem
                label="Transaction ID"
                value={booking.transactionId}
              />
              <InfoItem
                label="Verified at"
                value={formatDateTime(booking.paymentVerifiedAt)}
              />
              <InfoItem
                label="Payment deadline"
                value={formatDateTime(booking.paymentDeadline)}
              />
            </div>

            {booking.paymentRejectionReason && (
              <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-800">
                  Payment rejection reason
                </p>
                <p className="mt-1 text-sm text-red-700">
                  {booking.paymentRejectionReason}
                </p>
              </div>
            )}

            {booking.paymentProof?.publicId && (
              <div className="mt-5 border-t border-gray-100 pt-5">
                <div className="mb-3 flex items-center gap-2">
                  <FileImage size={17} className="text-gray-500" />
                  <p className="text-sm font-semibold text-gray-800">
                    Guest payment screenshot
                  </p>
                </div>

                <PaymentProofViewer bookingId={booking._id.toString()} />
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <aside className="min-w-0 space-y-6 xl:sticky xl:top-6">
          {/* FINANCIAL SUMMARY */}
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="bg-[#234b3b] p-5 text-white">
              <div className="flex items-center gap-2">
                <Receipt size={19} />
                <h2 className="font-bold">Guest Account Statement</h2>
              </div>
              <p className="mt-1 text-xs text-white/70">
                Complete cottage and restaurant bill.
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Charges
              </p>

              <div className="mt-2">
                <DetailRow label="Cottage accommodation" amount={cottageTotal} />
                <DetailRow label="Restaurant orders" amount={restaurantTotal} />
              </div>

              <div className="mt-2 border-t border-gray-200 pt-3">
                <DetailRow label="Total bill" amount={grandTotal} bold />
              </div>

              <div className="my-4 border-t border-dashed border-gray-200" />

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Payments received
              </p>

              <div className="mt-2">
                <DetailRow label="Verified advance" amount={verifiedAdvance} muted />
                <DetailRow label="Additional booking payments" amount={bookingAdditionalPayments} muted />
                <DetailRow label="Direct restaurant payments" amount={restaurantPaymentsReceived} muted />
              </div>

              <div className="mt-2 border-t border-gray-200 pt-3">
                <DetailRow label="Total received" amount={totalReceived} bold />
              </div>

              <div className={`mt-5 rounded-xl p-4 ${isFullyPaid ? "bg-emerald-50" : "bg-amber-50"}`}>
                <p className={`text-xs font-semibold ${isFullyPaid ? "text-emerald-700" : "text-amber-700"}`}>
                  {isFullyPaid ? "ACCOUNT FULLY SETTLED" : "OUTSTANDING BALANCE"}
                </p>

                <p className={`mt-2 text-2xl font-bold tracking-tight ${isFullyPaid ? "text-emerald-800" : "text-amber-800"}`}>
                  {formatPrice(remaining)}
                </p>

                <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${isFullyPaid ? "text-emerald-700" : "text-amber-700"}`}>
                  {isFullyPaid ? (
                    <>
                      <CheckCircle2 size={14} />
                      No further payment is due
                    </>
                  ) : (
                    <>
                      <Clock3 size={14} />
                      Payment needs to be collected
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* COLLECT PAYMENT */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Wallet size={19} className="text-[#234b3b]" />
              <h2 className="font-bold text-gray-900">
                Collect Payment
              </h2>
            </div>

            <p className="mt-2 text-sm leading-5 text-gray-500">
              Record cash, bKash, Nagad or bank payments received from this guest.
            </p>

            {isFullyPaid ? (
              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <CheckCircle2 size={22} className="text-emerald-600" />
                <p className="mt-2 text-sm font-bold text-emerald-800">
                  This booking is fully paid.
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  No additional payment is currently outstanding.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-4 rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Amount outstanding</p>
                  <p className="mt-1 text-xl font-bold text-amber-700">
                    {formatPrice(remaining)}
                  </p>
                </div>

                <div className="mt-4">
                  <RecordPayment
                    bookingId={booking._id.toString()}
                    outstandingAmount={remaining}
                    canRecord={
                      booking.status === "confirmed" &&
                      booking.paymentStatus === "verified" &&
                      remaining > 0
                    }
                  />
                </div>
              </>
            )}
          </section>

          {/* RECONCILIATION */}
          {canSynchronize && (
            <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
              <div className="flex items-center gap-2">
                <RefreshCw size={18} className="text-blue-700" />
                <h2 className="font-bold text-gray-900">
                  Payment Reconciliation
                </h2>
              </div>

              <p className="mt-2 text-xs leading-5 text-gray-600">
                Match existing cottage checkout payments against restaurant orders. This does not record a new payment.
              </p>

              <div className="mt-4">
                <SyncRestaurantPayments
                  bookingId={booking._id.toString()}
                  canSync={canSynchronize}
                  orderCount={restaurantOrders.length}
                />
              </div>
            </section>
          )}

          {/* BOOKING ACTIONS */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-gray-900">Booking Actions</h2>
            <p className="mt-1 text-xs text-gray-500">
              Manage this reservation.
            </p>

            <div className="mt-4">
              <BookingActions
                bookingId={booking._id.toString()}
                status={booking.status}
                paymentStatus={booking.paymentStatus}
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
