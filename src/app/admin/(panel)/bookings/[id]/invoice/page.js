
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import Image from "next/image";

import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";
import RestaurantOrder from "@/models/RestaurantOrder";
import SiteSettings from "@/models/SiteSettings";

import InvoicePrintButton from "@/components/admin/InvoicePrintButton";

export const dynamic = "force-dynamic";

const money = (value) => {
  const number = Number(value || 0);
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : 0;
};

const formatCurrency = (value) =>
  `৳${money(value).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date(value));
};

const safeColor = (value, fallback) =>
  typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)
    ? value
    : fallback;

const methodLabel = (method) => {
  const labels = {
    cash: "Cash",
    bkash: "bKash",
    nagad: "Nagad",
    bank: "Bank",
  };

  return labels[method] || method || "—";
};

function SectionTitle({ children }) {
  return (
    <h2 className="mb-2 border-b border-stone-300 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-700">
      {children}
    </h2>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div
      className={`flex items-start justify-between gap-2 py-1.5 text-xs ${
        strong ? "font-bold text-stone-900" : "text-stone-600"
      }`}
    >
      <span>{label}</span>
      <span className="text-right tabular-nums">{value}</span>
    </div>
  );
}

export default async function BookingInvoicePage({ params }) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  await connectDB();

  const [booking, settings] = await Promise.all([
    Booking.findById(id).populate("cottage").lean(),
    SiteSettings.findOne().lean(),
  ]);

  if (!booking) {
    notFound();
  }

  const restaurantOrders = await RestaurantOrder.find({
    booking: booking._id,
    orderStatus: { $ne: "cancelled" },
  })
    .sort({ createdAt: 1 })
    .lean();

  const cottage = booking.cottage;

  const cottageTotal = money(booking.totalPrice);

  const restaurantTotal = money(
    restaurantOrders.reduce((sum, order) => sum + money(order.total), 0)
  );

  const grandTotal = money(cottageTotal + restaurantTotal);

  // Only a verified online advance counts as received.
  const verifiedAdvance =
    booking.paymentStatus === "verified"
      ? money(booking.paymentAmount)
      : 0;

  const bookingPayments = Array.isArray(booking.payments)
    ? booking.payments
    : [];

  // Direct restaurant payments count as received.
  // Checkout allocations are references to booking payments,
  // so they must not be counted a second time.
  const restaurantPayments = restaurantOrders.flatMap((order) =>
    (order.payments || []).map((payment) => ({
      ...payment,
      orderNumber: order.orderNumber || "Restaurant Order",
    }))
  );

  const bookingPaymentsTotal = money(
    bookingPayments.reduce((sum, payment) => sum + money(payment.amount), 0)
  );

  const restaurantPaymentsTotal = money(
    restaurantPayments.reduce(
      (sum, payment) => sum + money(payment.amount),
      0
    )
  );

  const totalReceived = money(
    verifiedAdvance + bookingPaymentsTotal + restaurantPaymentsTotal
  );

  const balanceDue = money(Math.max(grandTotal - totalReceived, 0));
  const credit = money(Math.max(totalReceived - grandTotal, 0));

  const isCancelled = booking.status === "cancelled";

  const invoiceStatus = isCancelled
    ? "CANCELLED"
    : balanceDue === 0
      ? "PAID"
      : "BALANCE DUE";

  const invoiceNumber = `INV-${booking.bookingReference || booking._id}`;

  const resortName =
    settings?.general?.resortName ||
    settings?.resortName ||
    "Lama Valley Resort & Restaurant";

  const phone =
    settings?.general?.phone ||
    settings?.phone ||
    "";

  const email =
    settings?.general?.email ||
    settings?.email ||
    "";

  const address =
    settings?.general?.address ||
    settings?.address ||
    "Lama, Bandarban, Bangladesh";

  const logoUrl =
    settings?.branding?.logoUrl ||
    settings?.logoUrl ||
    "";

  const primaryColor = safeColor(
    settings?.branding?.primaryColor || settings?.primaryColor,
    "#234b3b"
  );

  const accentColor = safeColor(
    settings?.branding?.accentColor || settings?.accentColor,
    "#c49a62"
  );

  // Build actual payment history.
  const paymentHistory = [];

  if (verifiedAdvance > 0) {
    paymentHistory.push({
      id: "verified-advance",
      date: booking.paymentVerifiedAt || booking.updatedAt,
      description: "Online booking advance",
      method: methodLabel(booking.paymentMethod),
      reference: booking.transactionId || "",
      amount: verifiedAdvance,
    });
  }

  bookingPayments.forEach((payment, index) => {
    paymentHistory.push({
      id: `booking-payment-${index}`,
      date: payment.paidAt,
      description: "Accommodation payment",
      method: methodLabel(payment.method),
      reference: payment.reference || "",
      amount: money(payment.amount),
    });
  });

  restaurantPayments.forEach((payment, index) => {
    paymentHistory.push({
      id: `restaurant-payment-${index}`,
      date: payment.paidAt,
      description: payment.orderNumber,
      method: methodLabel(payment.method),
      reference: payment.reference || "",
      amount: money(payment.amount),
    });
  });

  paymentHistory.sort(
    (a, b) =>
      new Date(a.date || 0).getTime() -
      new Date(b.date || 0).getTime()
  );

  const hasUnverifiedAdvance =
    money(booking.paymentAmount) > 0 &&
    booking.paymentStatus !== "verified";

  return (
    <main
      className="min-h-screen bg-stone-100 px-2 py-5"
      style={{
        "--invoice-primary": primaryColor,
        "--invoice-accent": accentColor,
      }}
    >
      <style>{`
        @page {
          margin: 0;
        }

        .invoice-sheet {
          box-sizing: border-box;
          overflow-wrap: anywhere;
        }
      @media print {
    @page {
  size: 80mm 400mm;
  margin: 0;
    }

  html,
  body {
    width: 80mm !important;
    height: auto !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }

  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .no-print {
    display: none !important;
  }

  .invoice-sheet {
    box-sizing: border-box !important;
    display: block !important;
    width: 80mm !important;
    max-width: 80mm !important;
    min-height: 0 !important;
    height: auto !important;
    margin: 0 !important;
    padding: 3mm !important;
    border: 0 !important;
    box-shadow: none !important;
    overflow: visible !important;
    break-after: auto !important;
    page-break-after: auto !important;
  }

  .invoice-section,
  .invoice-table tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  img {
    max-width: 100% !important;
  }
}
      `}</style>

      {/* Print button */}
      <div className="no-print mx-auto mb-4 flex max-w-[80mm] items-center justify-between gap-2">
        <p className="text-xs text-stone-500">
          Booking invoice
        </p>
        <InvoicePrintButton />
      </div>

      {/* 80mm Receipt */}
      <article className="invoice-sheet mx-auto w-full max-w-[80mm] bg-white px-4 py-5 shadow-xl">
        {/* Resort header */}
        <header className="border-b-2 pb-4 text-center"
          style={{ borderColor: "var(--invoice-primary)" }}
        >
          {logoUrl && (
            <div className="mb-2 flex justify-center">
              <Image
                src={logoUrl}
                alt={resortName}
                width={100}
                height={65}
                unoptimized
                className="h-12 w-20 object-contain"
              />
            </div>
          )}

          <h1
            className="text-base font-bold leading-tight"
            style={{ color: "var(--invoice-primary)" }}
          >
            {resortName}
          </h1>

          <p className="mt-1 text-[10px] text-stone-600">
            {address}
          </p>

          {phone && (
            <p className="text-[10px] text-stone-600">
              Phone: {phone}
            </p>
          )}

          {email && (
            <p className="break-all text-[10px] text-stone-600">
              {email}
            </p>
          )}

          <p className="mt-3 text-lg font-bold tracking-[0.15em] text-stone-800">
            INVOICE
          </p>

          <p className="mt-1 break-all text-[10px] text-stone-600">
            {invoiceNumber}
          </p>

          <p className="mt-1 text-[10px] text-stone-500">
            Issued: {formatDate(new Date())}
          </p>

          <span
            className={`mt-2 inline-block rounded px-2 py-1 text-[10px] font-bold ${
              invoiceStatus === "PAID"
                ? "bg-green-100 text-green-800"
                : invoiceStatus === "CANCELLED"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-800"
            }`}
          >
            {invoiceStatus}
          </span>
        </header>

        {/* Guest information */}
        <section className="invoice-section py-4">
          <SectionTitle>Guest Information</SectionTitle>

          <p className="text-sm font-bold text-stone-900">
            {booking.guestName}
          </p>

          <p className="mt-1 text-xs text-stone-600">
            Phone: {booking.guestPhone}
          </p>

          {booking.guestEmail && (
            <p className="break-all text-xs text-stone-600">
              Email: {booking.guestEmail}
            </p>
          )}

          <div className="mt-3 border-t border-dashed border-stone-300 pt-2">
            <p className="break-all text-xs text-stone-600">
              Booking Ref:{" "}
              <strong className="text-stone-900">
                {booking.bookingReference}
              </strong>
            </p>

            <p className="mt-1 text-xs text-stone-600">
              Booking Type:{" "}
              <strong className="text-stone-900">
                {booking.bookingSource === "front_desk"
                  ? "Front Desk"
                  : "Online"}
              </strong>
            </p>

            <p className="mt-1 text-xs text-stone-600">
              Guests:{" "}
              <strong className="text-stone-900">
                {booking.guests}
              </strong>
            </p>
          </div>
        </section>

        {/* Stay details */}
        <section className="invoice-section border-y border-dashed border-stone-300 py-3">
          <SectionTitle>Stay Details</SectionTitle>

          <p className="text-xs text-stone-500">Accommodation</p>
          <p className="text-sm font-bold text-stone-900">
            {cottage?.name || "Accommodation"}
          </p>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] text-stone-500">CHECK-IN</p>
              <p className="text-xs font-semibold text-stone-800">
                {formatDate(booking.checkIn)}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-stone-500">CHECK-OUT</p>
              <p className="text-xs font-semibold text-stone-800">
                {formatDate(booking.checkOut)}
              </p>
            </div>
          </div>
        </section>

        {/* Accommodation charge */}
        <section className="invoice-section py-4">
          <SectionTitle>Accommodation Charge</SectionTitle>

          <div className="flex items-start justify-between gap-2 text-xs">
            <div className="min-w-0">
              <p className="font-semibold text-stone-800">
                {cottage?.name || "Accommodation"}
              </p>
              <p className="mt-1 text-[10px] text-stone-500">
                {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
              </p>
            </div>

            <p className="shrink-0 font-semibold tabular-nums text-stone-900">
              {formatCurrency(cottageTotal)}
            </p>
          </div>
        </section>

        {/* Restaurant charges */}
        {restaurantOrders.length > 0 && (
          <section className="invoice-section border-t border-dashed border-stone-300 py-4">
            <SectionTitle>Restaurant Charges</SectionTitle>

            {restaurantOrders.map((order, orderIndex) => (
              <div
                key={String(order._id)}
                className="mb-4 last:mb-0"
              >
                <div className="mb-2">
                  <p className="break-all text-xs font-bold text-stone-800">
                    {order.orderNumber || `Restaurant Order ${orderIndex + 1}`}
                  </p>
                  <p className="text-[10px] text-stone-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <table className="invoice-table w-full text-xs">
                  <tbody>
                    {(order.items || []).map((item, index) => (
                      <tr key={`${order._id}-item-${index}`}>
                        <td className="py-1 pr-2 text-stone-700">
                          {item.name}
                          <span className="ml-1 text-[10px] text-stone-500">
                            ×{item.quantity}
                          </span>
                        </td>

                        <td className="whitespace-nowrap py-1 text-right tabular-nums text-stone-800">
                          {formatCurrency(
                            item.lineTotal ??
                              money(item.price) * Number(item.quantity || 0)
                          )}
                        </td>
                      </tr>
                    ))}

                    {(order.extraCharges || []).map((charge, index) => (
                      <tr key={`${order._id}-charge-${index}`}>
                        <td className="py-1 text-stone-600">
                          {charge.name || "Additional charge"}
                        </td>
                        <td className="whitespace-nowrap py-1 text-right text-stone-700">
                          {formatCurrency(charge.amount)}
                        </td>
                      </tr>
                    ))}

                    {money(order.discount) > 0 && (
                      <tr>
                        <td className="py-1 text-stone-600">Discount</td>
                        <td className="whitespace-nowrap py-1 text-right text-stone-700">
                          -{formatCurrency(order.discount)}
                        </td>
                      </tr>
                    )}

                    <tr className="border-t border-stone-300">
                      <td className="py-2 font-bold text-stone-800">
                        Order Total
                      </td>
                      <td className="whitespace-nowrap py-2 text-right font-bold text-stone-900">
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </section>
        )}

        {/* Bill summary */}
        <section className="invoice-section border-y border-stone-300 py-4">
          <SectionTitle>Bill Summary</SectionTitle>

          <SummaryRow
            label="Accommodation"
            value={formatCurrency(cottageTotal)}
          />

          <SummaryRow
            label="Restaurant"
            value={formatCurrency(restaurantTotal)}
          />

          <div className="my-2 border-t border-dashed border-stone-300" />

          <SummaryRow
            label="TOTAL BILL"
            value={formatCurrency(grandTotal)}
            strong
          />

          <SummaryRow
            label="Total Received"
            value={formatCurrency(totalReceived)}
          />

          <div
            className="mt-3 rounded-lg p-3"
            style={{ backgroundColor: "#f7f5ef" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-600">
              {credit > 0 ? "Credit Balance" : "Balance Due"}
            </p>

            <p
              className="mt-1 text-xl font-bold tabular-nums"
              style={{ color: "var(--invoice-primary)" }}
            >
              {formatCurrency(credit > 0 ? credit : balanceDue)}
            </p>
          </div>
        </section>

        {/* Payment history */}
        <section className="invoice-section py-4">
          <SectionTitle>Payment History</SectionTitle>

          {paymentHistory.length > 0 ? (
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="border-b border-dashed border-stone-200 pb-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-800">
                        {payment.description}
                      </p>

                      <p className="mt-0.5 text-[10px] text-stone-500">
                        {formatDate(payment.date)}
                      </p>

                      <p className="mt-0.5 text-[10px] text-stone-500">
                        {payment.method}
                      </p>

                      {payment.reference && (
                        <p className="break-all text-[10px] text-stone-500">
                          Ref: {payment.reference}
                        </p>
                      )}
                    </div>

                    <p className="shrink-0 text-xs font-bold tabular-nums text-stone-900">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-2 text-xs text-stone-500">
              No payments have been recorded yet.
            </p>
          )}

          {hasUnverifiedAdvance && (
            <div className="mt-3 rounded-lg bg-amber-50 p-3">
              <p className="text-[10px] font-semibold text-amber-800">
                Advance payment awaiting verification
              </p>
              <p className="mt-1 text-xs text-amber-800">
                {formatCurrency(booking.paymentAmount)} submitted but not yet
                verified. This amount is not included in Total Received.
              </p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer
          className="mt-2 border-t-2 pt-4 text-center"
          style={{ borderColor: "var(--invoice-accent)" }}
        >
          <p
            className="text-xs font-bold"
            style={{ color: "var(--invoice-primary)" }}
          >
            Thank you for choosing
          </p>

          <p className="mt-1 text-sm font-bold text-stone-800">
            {resortName}
          </p>

          <p className="mt-2 text-[10px] text-stone-500">
            We look forward to welcoming you again.
          </p>

          <p className="mt-3 break-all text-[9px] text-stone-400">
            {invoiceNumber}
          </p>
        </footer>
      </article>
    </main>
  );
}
