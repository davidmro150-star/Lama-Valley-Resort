
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, CheckCircle2, AlertCircle } from "lucide-react";

function formatCurrency(value) {
  return `৳${Number(value || 0).toLocaleString("en-BD")}`;
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  });
}

export default function RestaurantReceiptPrint({ order, settings }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const items = order?.items || [];
  const payments = order?.payments || [];
  const allocations = order?.checkoutPaymentAllocations || [];

  const subtotal = Number(order?.subtotal || 0);
  const extraCharges = Number(order?.extraCharges || 0);
  const discount = Number(order?.discount || 0);
  const total = Number(order?.totalAmount || order?.total || 0);

  const directPaid = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const checkoutPaid = allocations.reduce(
    (sum, allocation) => sum + Number(allocation.amount || 0),
    0
  );

  const paidAmount = directPaid + checkoutPaid;
  const balance = Math.max(0, total - paidAmount);

  const isPaid =
    order?.paymentStatus === "paid" ||
    (total > 0 && balance === 0);

  const orderNumber =
    order?.orderNumber ||
    order?.orderReference ||
    String(order?._id || "").slice(-8).toUpperCase();

  const customerName =
    order?.guestName ||
    order?.booking?.guestName ||
    order?.customerName ||
    "Walk-in Customer";

  const isCottageOrder =
    order?.orderType === "cottage" ||
    order?.paymentMode === "cottage_bill" ||
    Boolean(order?.booking);

  const paymentRows = [
    ...payments.map((payment) => ({
      label: payment.method || "Payment",
      amount: Number(payment.amount || 0),
      reference: payment.reference || payment.transactionId || "",
      date: payment.paidAt || payment.createdAt,
    })),
    ...allocations.map((allocation) => ({
      label: "Cottage checkout",
      amount: Number(allocation.amount || 0),
      reference: allocation.bookingReference || "",
      date: allocation.allocatedAt || allocation.createdAt,
    })),
  ];

  return (
    <main className="min-h-screen bg-[#f3f4f1] px-4 py-8">
      <div className="restaurant-order-screen mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/restaurant/orders"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Back to Orders
        </Link>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#234b3b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#173729]"
        >
          <Printer size={16} />
          Print Receipt
        </button>
      </div>

      <div className="restaurant-receipt mx-auto w-full max-w-[320px] bg-white px-4 py-5 text-gray-900 shadow-sm">
        <header className="border-b border-dashed border-gray-400 pb-4 text-center">
          {settings?.logoUrl && (
            <img
              src={settings.logoUrl}
              alt={settings.resortName || "Resort logo"}
              className="mx-auto mb-2 max-h-16 max-w-[130px] object-contain"
            />
          )}

          <h1 className="text-lg font-extrabold tracking-wide text-[#234b3b]">
            {settings?.resortName || "Lama Valley Resort & Restaurant"}
          </h1>

          {settings?.address && (
            <p className="mt-1 text-xs text-gray-600">
              {settings.address}
            </p>
          )}

          {settings?.phone && (
            <p className="mt-1 text-xs text-gray-600">
              Phone: {settings.phone}
            </p>
          )}

          {settings?.email && (
            <p className="text-xs text-gray-600">{settings.email}</p>
          )}

          <p className="mt-3 text-sm font-bold uppercase tracking-[0.15em]">
            Restaurant Receipt
          </p>
        </header>

        <section className="space-y-1 border-b border-dashed border-gray-400 py-3 text-xs">
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Order No.</span>
            <strong>{orderNumber}</strong>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Date</span>
            <strong>{formatDateTime(order?.createdAt)}</strong>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Customer</span>
            <strong className="text-right">{customerName}</strong>
          </div>

          {isCottageOrder && (
            <>
              <div className="flex justify-between gap-2">
                <span className="text-gray-500">Order Type</span>
                <strong>Cottage Guest</strong>
              </div>

              {order?.booking?.bookingReference && (
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Booking</span>
                  <strong>{order.booking.bookingReference}</strong>
                </div>
              )}

              {order?.cottage?.name && (
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Cottage</span>
                  <strong>{order.cottage.name}</strong>
                </div>
              )}
            </>
          )}
        </section>

        <section className="border-b border-dashed border-gray-400 py-3">
          <div className="mb-2 grid grid-cols-[1fr_auto] gap-2 text-[10px] font-bold uppercase text-gray-500">
            <span>Item</span>
            <span className="text-right">Amount</span>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const quantity = Number(item.quantity || 0);
              const price = Number(item.price || 0);
              const lineTotal = Number(
                item.lineTotal ?? item.total ?? quantity * price
              );

              return (
                <div
                  key={item._id || `${item.name}-${index}`}
                  className="grid grid-cols-[1fr_auto] gap-2 text-xs"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      {quantity} × {formatCurrency(price)}
                    </p>
                  </div>

                  <strong className="text-right">
                    {formatCurrency(lineTotal)}
                  </strong>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-1 border-b border-dashed border-gray-400 py-3 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {extraCharges > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Extra charges</span>
              <span>{formatCurrency(extraCharges)}</span>
            </div>
          )}

          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}

          <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-extrabold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </section>

        <section className="space-y-2 border-b border-dashed border-gray-400 py-3 text-xs">
          <div className="flex items-center justify-between">
            <strong>Payment Summary</strong>

            {isPaid ? (
              <span className="font-bold text-green-700">PAID</span>
            ) : isCottageOrder ? (
              <span className="font-bold text-amber-700">COTTAGE BILL</span>
            ) : (
              <span className="font-bold text-red-700">UNPAID</span>
            )}
          </div>

          {paymentRows.length > 0 ? (
            paymentRows.map((payment, index) => (
              <div
                key={`${payment.label}-${index}`}
                className="flex justify-between gap-2"
              >
                <div>
                  <p className="font-medium">{payment.label}</p>
                  {payment.reference && (
                    <p className="text-[10px] text-gray-500">
                      Ref: {payment.reference}
                    </p>
                  )}
                  {payment.date && (
                    <p className="text-[10px] text-gray-500">
                      {formatDate(payment.date)}
                    </p>
                  )}
                </div>

                <strong>{formatCurrency(payment.amount)}</strong>
              </div>
            ))
          ) : isCottageOrder ? (
            <p className="text-gray-500">
                This order will be settled with the guest&apos;s cottage bill at
                checkout.
            </p>
          ) : (
            <p className="text-gray-500">No payment recorded.</p>
          )}

          <div className="flex justify-between border-t border-gray-200 pt-2 font-bold">
            <span>Total recorded</span>
            <span>{formatCurrency(paidAmount)}</span>
          </div>

          {balance > 0 && (
            <div className="flex justify-between font-bold text-red-700">
              <span>Remaining</span>
              <span>{formatCurrency(balance)}</span>
            </div>
          )}
        </section>

        {order?.note && (
          <section className="border-b border-dashed border-gray-400 py-3 text-xs">
            <p className="font-bold">Note</p>
            <p className="mt-1 text-gray-600">{order.note}</p>
          </section>
        )}

        <footer className="pt-4 text-center">
          <p className="text-sm font-bold text-[#234b3b]">
            Thank You!
          </p>
          <p className="mt-1 text-[10px] text-gray-500">
            We appreciate your visit.
          </p>
          <p className="mt-3 text-[9px] text-gray-400">
            {formatDate(new Date())}
          </p>
        </footer>
      </div>

      <div className="restaurant-order-screen mx-auto mt-5 flex max-w-[320px] items-center justify-center gap-2 text-xs text-gray-500">
        {isPaid ? (
          <>
            <CheckCircle2 size={14} className="text-green-600" />
            Payment recorded
          </>
        ) : (
          <>
            <AlertCircle size={14} className="text-amber-600" />
            {isCottageOrder
              ? "Payment will be settled at cottage checkout"
              : "Payment is not yet recorded"}
          </>
        )}
      </div>
    </main>
  );
}
