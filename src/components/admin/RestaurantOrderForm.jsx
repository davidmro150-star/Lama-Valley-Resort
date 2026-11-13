
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
  return new Date(value).toISOString().slice(0, 10);
}

function getGuestCategory(guest, date) {
  const checkIn = getDateKey(guest.checkIn);
  const checkOut = getDateKey(guest.checkOut);

  if (checkIn === date) return "Checking In";
  if (checkOut === date) return "Checking Out";
  return "Staying";
}

export default function RestaurantOrderForm({ menuItems }) {
  const router = useRouter();

  const [orderType, setOrderType] = useState("walk-in");
  const [bookingId, setBookingId] = useState("");
  const [paymentMode, setPaymentMode] = useState("pay_now");
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

  // Fetch guests whenever the selected date changes.
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
          `/api/admin/guests?date=${selectedDate}`,
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
      .filter((item) => cart[item.id] > 0)
      .map((item) => ({
        ...item,
        quantity: cart[item.id],
        lineTotal: item.price * cart[item.id],
      }));
  }, [menuItems, cart]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.lineTotal,
    0
  );

  const extraChargesTotal = extraCharges.reduce(
    (sum, charge) => sum + charge.amount,
    0
  );

  const safeDiscount = Math.max(0, Number(discount) || 0);
  const billBeforeDiscount = subtotal + extraChargesTotal;
  const total = Math.max(0, billBeforeDiscount - safeDiscount);

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
      { name, amount: Math.round(amount * 100) / 100 },
    ]);
    setChargeAmount("");
    if (chargeType === "Other") setCustomChargeName("");
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
    setPaymentMode("pay_now");
    setGuestName("");
    setGuestPhone("");
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

    if (cartItems.length === 0) {
      setError("Please add at least one food item.");
      return;
    }

    if (safeDiscount > billBeforeDiscount) {
      setError("Discount cannot exceed the subtotal plus extra charges.");
      return;
    }

    if (orderType === "cottage" && !bookingId) {
      setError("Please select a guest for the selected date.");
      return;
    }

    if (orderType === "cottage" && !selectedDate) {
      setError("Please select a guest date.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/restaurant-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderType,
          bookingId: orderType === "cottage" ? bookingId : undefined,

          // Important: send the selected Bangladesh calendar date.
          selectedDate: orderType === "cottage" ? selectedDate : undefined,

          items: cartItems.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
          })),
          extraCharges,
          discount: safeDiscount,
          paymentMode,
          guestName,
          guestPhone,
          note,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not create the order.");
      }

      setSuccess(
        `Order ${data.order.orderNumber} created successfully.`
      );

      setCart({});
      setExtraCharges([]);
      setDiscount("0");
      setChargeType("Service Charge");
      setCustomChargeName("");
      setChargeAmount("");
      setNote("");

      if (orderType === "walk-in") {
        setGuestName("");
        setGuestPhone("");
      }

      router.refresh();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer type */}
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
                        {booking.guestName} — {booking.cottage?.name || "Cottage"} (
                        {category}) — {booking.bookingReference}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {!loadingGuests && !guestError && bookings.length === 0 && (
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
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {item.category}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#234b3b]">
                    ৳{item.price.toLocaleString("en-BD")}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, -1)}
                    disabled={!cart[item.id]}
                    className="h-9 w-9 rounded-lg border border-gray-300 text-lg disabled:opacity-30"
                  >
                    −
                  </button>

                  <span className="w-5 text-center text-sm font-semibold">
                    {cart[item.id] || 0}
                  </span>

                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, 1)}
                    disabled={(cart[item.id] || 0) >= 100}
                    className="h-9 w-9 rounded-lg border border-gray-300 text-lg disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Payment and discount */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="font-bold text-gray-900">Payment & Discount</h2>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Payment Mode
          </label>

          <select
            value={paymentMode}
            onChange={(event) => setPaymentMode(event.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
          >
            <option value="pay_now">Pay Immediately</option>

            {orderType === "cottage" && (
              <option value="cottage_bill">Add to Cottage Bill</option>
            )}
          </select>
        </div>

        {/* Extra charges */}
        <div className="mt-6 rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Extra Charges</h3>
              <p className="mt-1 text-xs text-gray-500">
                Add service, delivery, packaging, or other charges.
              </p>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              ৳{extraChargesTotal.toLocaleString("en-BD")}
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
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
              >
                <option value="Service Charge">Service Charge</option>
                <option value="Room Service Charge">Room Service Charge</option>
                <option value="Delivery Charge">Delivery Charge</option>
                <option value="Food Packaging Charge">Food Packaging Charge</option>
                <option value="Special Arrangement Charge">Special Arrangement Charge</option>
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
                onChange={(event) => setCustomChargeName(event.target.value)}
                maxLength={100}
                placeholder="e.g. Birthday decoration"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
              />
            </div>
          )}

          <button
            type="button"
            onClick={addExtraCharge}
            className="mt-3 rounded-lg bg-[#234b3b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173729]"
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
                      ৳{charge.amount.toLocaleString("en-BD")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExtraCharge(index)}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    aria-label={`Remove ${charge.name}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
          />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Order Note (Optional)
          </label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Special instructions..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
          />
        </div>

        <div className="mt-5 space-y-2 rounded-xl bg-gray-50 p-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>৳{subtotal.toLocaleString("en-BD")}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Extra Charges</span>
            <span>+ ৳{extraChargesTotal.toLocaleString("en-BD")}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Discount</span>
            <span>− ৳{safeDiscount.toLocaleString("en-BD")}</span>
          </div>

          <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>৳{total.toLocaleString("en-BD")}</span>
          </div>
        </div>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={
          loading ||
          cartItems.length === 0 ||
          (orderType === "cottage" && (!bookingId || loadingGuests))
        }
        className="w-full rounded-xl bg-[#234b3b] px-5 py-4 font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Creating Order..." : "Create Restaurant Order"}
      </button>

      <p className="text-xs leading-5 text-gray-500">
        Creating an order does not record a payment yet. Payment collection
        will be handled separately.
      </p>
    </form>
  );
}
