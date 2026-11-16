
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, AlertCircle, CheckCircle2 } from "lucide-react";

function getDhakaToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function getDateKey(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getGuestCategory(guest, date) {
  const checkIn = getDateKey(guest.checkIn);
  const checkOut = getDateKey(guest.checkOut);

  if (checkIn === date) return "Checking In";
  if (checkOut === date) return "Checking Out";

  return "Staying";
}

function formatMoney(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function RestaurantOrderForm({ menuItems = [] }) {
  const router = useRouter();

  const [orderType, setOrderType] = useState("walk-in");
  const [bookingId, setBookingId] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const [cottagePaymentChoice, setCottagePaymentChoice] =
    useState("cottage_bill");

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const [discount, setDiscount] = useState("0");
  const [extraCharges, setExtraCharges] = useState([]);
  const [chargeType, setChargeType] = useState("Service Charge");
  const [customChargeName, setCustomChargeName] = useState("");
  const [chargeAmount, setChargeAmount] = useState("");
  const [note, setNote] = useState("");

  const [cart, setCart] = useState({});

  const [selectedDate, setSelectedDate] = useState(getDhakaToday());
  const [bookings, setBookings] = useState([]);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [guestError, setGuestError] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentRecoveryUrl, setPaymentRecoveryUrl] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchGuests() {
      setLoadingGuests(true);
      setGuestError("");
      setBookings([]);
      setBookingId("");
      setGuestName("");
      setGuestPhone("");

      try {
        const response = await fetch(
          `/api/admin/guests?date=${encodeURIComponent(selectedDate)}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Could not load guests.");
        }

        if (!cancelled) {
          setBookings(data.guests || []);
        }
      } catch (err) {
        if (!cancelled) {
          setGuestError(err.message || "Could not load guests.");
        }
      } finally {
        if (!cancelled) {
          setLoadingGuests(false);
        }
      }
    }

    if (selectedDate) {
      fetchGuests();
    }

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const selectedBooking = bookings.find(
    (booking) => booking._id === bookingId
  );

  const cartItems = useMemo(() => {
    return menuItems
      .filter((item) => Number(cart[item.id]) > 0)
      .map((item) => ({
        ...item,
        quantity: Number(cart[item.id]),
        lineTotal: Number(item.price) * Number(cart[item.id]),
      }));
  }, [menuItems, cart]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.lineTotal,
    0
  );

  const extraChargesTotal = extraCharges.reduce(
    (sum, charge) => sum + Number(charge.amount || 0),
    0
  );

  const safeDiscount = Math.max(0, Number(discount) || 0);
  const billBeforeDiscount = subtotal + extraChargesTotal;
  const total = Math.max(0, billBeforeDiscount - safeDiscount);

  const isImmediatePayment =
    orderType === "walk-in" || cottagePaymentChoice === "pay_now";

  function addExtraCharge() {
    const name =
      chargeType === "Other"
        ? customChargeName.trim()
        : chargeType;

    const amount = Number(chargeAmount);

    if (!name) {
      setError("Please enter a name for the custom charge.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Please enter a valid extra charge amount.");
      return;
    }

    if (
      chargeType !== "Other" &&
      extraCharges.some((charge) => charge.name === name)
    ) {
      setError("This charge has already been added.");
      return;
    }

    setError("");

    setExtraCharges((current) => [
      ...current,
      {
        name,
        amount: Math.round(amount * 100) / 100,
      },
    ]);

    setChargeAmount("");

    if (chargeType === "Other") {
      setCustomChargeName("");
    }
  }

  function removeExtraCharge(indexToRemove) {
    setExtraCharges((current) =>
      current.filter((_, index) => index !== indexToRemove)
    );
  }

  function updateQuantity(itemId, change) {
    setCart((current) => {
      const nextQuantity = (current[itemId] || 0) + change;

      if (nextQuantity <= 0) {
        const updated = { ...current };
        delete updated[itemId];
        return updated;
      }

      return {
        ...current,
        [itemId]: Math.min(nextQuantity, 100),
      };
    });
  }

  function handleOrderTypeChange(value) {
    setOrderType(value);
    setBookingId("");
    setGuestName("");
    setGuestPhone("");

    setPaymentMethod("cash");
    setPaymentReference("");
    setPaymentNote("");
    setCottagePaymentChoice("cottage_bill");

    setError("");
    setSuccess("");
    setPaymentRecoveryUrl("");
  }

  function handleBookingChange(value) {
    setBookingId(value);

    const booking = bookings.find((item) => item._id === value);

    setGuestName(booking?.guestName || "");
    setGuestPhone(booking?.guestPhone || "");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setPaymentRecoveryUrl("");

    if (cartItems.length === 0) {
      setError("Please add at least one food item.");
      return;
    }

    if (!Number.isFinite(total) || total <= 0) {
      setError("The order total must be greater than zero.");
      return;
    }

    if (safeDiscount > billBeforeDiscount) {
      setError("Discount cannot exceed the subtotal plus extra charges.");
      return;
    }

    if (orderType === "cottage" && !selectedDate) {
      setError("Please select a guest date.");
      return;
    }

    if (orderType === "cottage" && !bookingId) {
      setError("Please select a guest for the selected date.");
      return;
    }

    if (orderType === "cottage" && loadingGuests) {
      setError("Please wait until the guest list finishes loading.");
      return;
    }

    setLoading(true);

    let createdOrderId = null;
    let createdOrderNumber = "";

    try {
      // STEP 1: Create the restaurant order.
      const response = await fetch("/api/admin/restaurant-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderType,
          bookingId:
            orderType === "cottage" ? bookingId : undefined,
          selectedDate:
            orderType === "cottage" ? selectedDate : undefined,
          items: cartItems.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
          })),
          extraCharges,
          discount: safeDiscount,
          paymentMode:
            orderType === "walk-in"
              ? "pay_now"
              : cottagePaymentChoice,
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
          note: note.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.order?._id) {
        throw new Error(data.message || "Could not create the order.");
      }

      createdOrderId = data.order._id;
      createdOrderNumber = data.order.orderNumber || "";

      // STEP 2: Cottage bill orders are saved without immediate payment.
      // Use a full browser navigation to avoid client-side routing issues.
      if (
        orderType === "cottage" &&
        cottagePaymentChoice === "cottage_bill"
      ) {
        window.location.href = "/admin/restaurant/orders";
        return;
      }

      // STEP 3: Record the full payment for pay_now orders.
      const paymentResponse = await fetch(
        `/api/admin/restaurant-orders/${createdOrderId}/payments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            method: paymentMethod,
            reference: paymentReference.trim(),
            note: paymentNote.trim(),
          }),
        }
      );

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentData.success) {
        setPaymentRecoveryUrl(
          `/admin/restaurant/orders/${createdOrderId}`
        );

        throw new Error(
          `Order ${createdOrderNumber} was created, but payment was not recorded. ${paymentData.message ||
          "Please complete payment recording from Order Details."
          }`
        );
      }

      // STEP 4: Open the separate paid restaurant receipt.
      window.location.href =
        `/admin/restaurant/orders/${createdOrderId}/receipt`;
    } catch (err) {
      setError(err.message || "Something went wrong.");

      if (createdOrderId && isImmediatePayment) {
        setPaymentRecoveryUrl(
          `/admin/restaurant/orders/${createdOrderId}`
        );
      }

      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Type */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="font-bold text-gray-900">Customer Type</h2>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            { value: "walk-in", label: "Walk-in Customer" },
            { value: "cottage", label: "Cottage Guest" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOrderTypeChange(option.value)}
              disabled={loading}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${orderType === option.value
                  ? "border-[#234b3b] bg-[#234b3b] text-white"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {orderType === "cottage" ? (
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Guest Date
              </label>

              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
              />

              <p className="mt-2 text-xs text-gray-500">
                Guests checking in, staying, or checking out on this date
                will be displayed.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Cottage Guest
              </label>

              {loadingGuests ? (
                <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                  Loading guests for this date...
                </p>
              ) : guestError ? (
                <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                  {guestError}
                </p>
              ) : (
                <select
                  value={bookingId}
                  onChange={(event) =>
                    handleBookingChange(event.target.value)
                  }
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
                >
                  <option value="">Select a guest</option>

                  {bookings.map((booking) => {
                    const category = getGuestCategory(
                      booking,
                      selectedDate
                    );

                    return (
                      <option key={booking._id} value={booking._id}>
                        {booking.guestName} —{" "}
                        {booking.cottage?.name || "Cottage"} (
                        {category}) — {booking.bookingReference}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {!loadingGuests &&
              !guestError &&
              bookings.length === 0 && (
                <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                  No guests found for this date. Try another date.
                </p>
              )}

            {selectedBooking && (
              <div className="rounded-xl border border-[#234b3b]/15 bg-[#234b3b]/5 p-4">
                <p className="text-sm font-semibold text-[#234b3b]">
                  Selected Guest
                </p>

                <p className="mt-2 text-sm text-gray-800">
                  {selectedBooking.guestName}
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  {selectedBooking.cottage?.name} ·{" "}
                  {selectedBooking.bookingReference}
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  {getGuestCategory(selectedBooking, selectedDate)}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Customer Name (Optional)
              </label>

              <input
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                disabled={loading}
                maxLength={100}
                placeholder="Customer name"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone Number (Optional)
              </label>

              <input
                value={guestPhone}
                onChange={(event) => setGuestPhone(event.target.value)}
                disabled={loading}
                maxLength={30}
                placeholder="Phone number"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
              />
            </div>
          </div>
        )}
      </section>

      {/* Menu */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-gray-900">Select Food Items</h2>

          <span className="text-xs text-gray-500">
            {cartItems.length} selected
          </span>
        </div>

        {menuItems.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No available food items found. Add food items in Restaurant
            management first.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-gray-100">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 py-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">
                    {item.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {item.category}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#234b3b]">
                    {formatMoney(item.price)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, -1)}
                    disabled={loading || !cart[item.id]}
                    className="h-9 w-9 rounded-lg border border-gray-300 text-lg disabled:opacity-30"
                    aria-label={`Decrease ${item.name}`}
                  >
                    −
                  </button>

                  <span className="w-5 text-center text-sm font-semibold">
                    {cart[item.id] || 0}
                  </span>

                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, 1)}
                    disabled={loading || (cart[item.id] || 0) >= 100}
                    className="h-9 w-9 rounded-lg border border-gray-300 text-lg disabled:opacity-30"
                    aria-label={`Increase ${item.name}`}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Payment, Charges and Discount */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="font-bold text-gray-900">
          Payment & Discount
        </h2>

        {orderType === "cottage" && (
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              Cottage Guest Payment Option
            </h3>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50">
              <input
                type="radio"
                name="cottagePaymentChoice"
                value="pay_now"
                checked={cottagePaymentChoice === "pay_now"}
                onChange={() => setCottagePaymentChoice("pay_now")}
                disabled={loading}
                className="mt-1 accent-[#234b3b]"
              />

              <span>
                <span className="block text-sm font-semibold text-gray-900">
                  Pay Now
                </span>

                <span className="mt-1 block text-xs leading-5 text-gray-500">
                  Collect the full restaurant payment now and print a
                  separate restaurant receipt. This payment will not be
                  charged again at accommodation checkout.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50">
              <input
                type="radio"
                name="cottagePaymentChoice"
                value="cottage_bill"
                checked={cottagePaymentChoice === "cottage_bill"}
                onChange={() => setCottagePaymentChoice("cottage_bill")}
                disabled={loading}
                className="mt-1 accent-[#234b3b]"
              />

              <span>
                <span className="block text-sm font-semibold text-gray-900">
                  Add to Cottage Bill
                </span>

                <span className="mt-1 block text-xs leading-5 text-gray-500">
                  Add the restaurant charges to the guest's accommodation
                  bill for payment at final checkout.
                </span>
              </span>
            </label>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-[#234b3b]/15 bg-[#234b3b]/5 p-4">
          <p className="text-sm font-semibold text-[#234b3b]">
            {orderType === "walk-in"
              ? "Immediate Full Payment"
              : cottagePaymentChoice === "pay_now"
                ? "Immediate Restaurant Payment"
                : "Add to Cottage Bill"}
          </p>

          <p className="mt-1 text-sm leading-6 text-gray-600">
            {orderType === "walk-in"
              ? "Record the customer's full restaurant payment before opening the receipt."
              : cottagePaymentChoice === "pay_now"
                ? "Collect the full restaurant payment separately. This order will not be charged again at accommodation checkout."
                : "The complete restaurant order will be added to the guest's cottage bill and settled at final checkout."}
          </p>
        </div>

        {isImmediatePayment && (
          <div className="mt-4 space-y-4 rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900">
              Payment Information
            </h3>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                disabled={loading}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
              >
                <option value="cash">Cash</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            {paymentMethod !== "cash" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Transaction / Reference Number (Optional)
                </label>

                <input
                  value={paymentReference}
                  onChange={(event) =>
                    setPaymentReference(event.target.value)
                  }
                  disabled={loading}
                  maxLength={100}
                  placeholder="Enter transaction or reference number"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Payment Note (Optional)
              </label>

              <textarea
                value={paymentNote}
                onChange={(event) => setPaymentNote(event.target.value)}
                disabled={loading}
                maxLength={500}
                rows={2}
                placeholder="Additional payment information..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
              />
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">
                Full payment to be recorded
              </p>

              <p className="mt-1 text-lg font-bold text-[#234b3b]">
                {formatMoney(total)}
              </p>
            </div>
          </div>
        )}

        {/* Extra Charges */}
        <div className="mt-6 rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Extra Charges
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Add service, delivery, packaging, or other charges.
              </p>
            </div>

            <span className="text-sm font-semibold text-gray-700">
              {formatMoney(extraChargesTotal)}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Charge Type
              </label>

              <select
                value={chargeType}
                onChange={(event) => setChargeType(event.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
              >
                <option value="Service Charge">Service Charge</option>
                <option value="Room Service Charge">
                  Room Service Charge
                </option>
                <option value="Delivery Charge">Delivery Charge</option>
                <option value="Food Packaging Charge">
                  Food Packaging Charge
                </option>
                <option value="Special Arrangement Charge">
                  Special Arrangement Charge
                </option>
                <option value="Other">Other (Custom)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Amount (৳)
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={chargeAmount}
                onChange={(event) => setChargeAmount(event.target.value)}
                disabled={loading}
                placeholder="Enter amount"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
              />
            </div>
          </div>

          {chargeType === "Other" && (
            <div className="mt-3">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Custom Charge Name
              </label>

              <input
                value={customChargeName}
                onChange={(event) =>
                  setCustomChargeName(event.target.value)
                }
                disabled={loading}
                maxLength={100}
                placeholder="e.g. Birthday decoration"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
              />
            </div>
          )}

          <button
            type="button"
            onClick={addExtraCharge}
            disabled={loading}
            className="mt-3 rounded-lg bg-[#234b3b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173729] disabled:opacity-50"
          >
            + Add Charge
          </button>

          {extraCharges.length > 0 && (
            <div className="mt-4 divide-y divide-gray-100 rounded-lg border border-gray-100">
              {extraCharges.map((charge, index) => (
                <div
                  key={`${charge.name}-${index}`}
                  className="flex items-center justify-between gap-3 px-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {charge.name}
                    </p>

                    <p className="text-sm text-gray-600">
                      {formatMoney(charge.amount)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeExtraCharge(index)}
                    disabled={loading}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    aria-label={`Remove ${charge.name}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discount */}
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Discount Amount (৳)
          </label>

          <input
            type="number"
            min="0"
            max={billBeforeDiscount}
            step="0.01"
            value={discount}
            onChange={(event) => setDiscount(event.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
          />
        </div>

        {/* Note */}
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Order Note (Optional)
          </label>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={loading}
            maxLength={500}
            rows={3}
            placeholder="Special instructions..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
          />
        </div>

        {/* Bill Summary */}
        <div className="mt-5 space-y-2 rounded-xl bg-gray-50 p-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Extra Charges</span>
            <span>+ {formatMoney(extraChargesTotal)}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Discount</span>
            <span>− {formatMoney(safeDiscount)}</span>
          </div>

          <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>
      </section>

      {/* Errors and status */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {paymentRecoveryUrl && (
        <a
          href={paymentRecoveryUrl}
          className="block rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
        >
          Open Order Details to Complete Payment
        </a>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={
          loading ||
          cartItems.length === 0 ||
          total <= 0 ||
          (orderType === "cottage" &&
            (!bookingId || loadingGuests || Boolean(guestError)))
        }
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#234b3b] px-5 py-4 font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          "Processing Order..."
        ) : isImmediatePayment ? (
          <>
            <Printer size={18} />
            Create Order & Print Receipt
          </>
        ) : (
          "Add Order to Cottage Bill"
        )}
      </button>

      <p className="text-center text-xs leading-5 text-gray-500">
        {orderType === "walk-in"
          ? "The full payment will be recorded before the receipt is opened automatically."
          : cottagePaymentChoice === "pay_now"
            ? "The full restaurant payment will be recorded separately and a restaurant receipt will open automatically."
            : "The restaurant order will be added to the guest's accommodation bill and settled at checkout."}
      </p>
    </form>
  );
}
