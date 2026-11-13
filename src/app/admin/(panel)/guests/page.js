
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Search,
  Users,
  LogIn,
  LogOut,
  BedDouble,
  RefreshCw,
  Wallet,
  ArrowRight,
} from "lucide-react";

const getToday = () => {
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
};

const getDateKey = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

const formatDate = (value) => {
  if (!value) return "N/A";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date(value));
};

const money = (value) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

function GuestCard({ guest, type }) {
  const payment = guest.payment || {};

  const categoryStyles = {
    arriving: "bg-blue-50 text-blue-700",
    staying: "bg-green-50 text-green-700",
    checkout: "bg-orange-50 text-orange-700",
  };

  const categoryLabels = {
    arriving: "Arriving Today",
    staying: "Staying Today",
    checkout: "Checking Out Today",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">
              {guest.guestName || "Unnamed Guest"}
            </h3>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${categoryStyles[type]}`}
            >
              {categoryLabels[type]}
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            {guest.bookingReference}
          </p>
        </div>

        <Link
          href={`/admin/bookings/${guest._id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-[#074E37] hover:underline"
        >
          View Booking <ArrowRight size={15} />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs text-gray-500">Cottage</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-gray-800">
            <BedDouble size={15} />
            {guest.cottage?.name || "Cottage unavailable"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Phone</p>
          <p className="mt-1 text-sm font-medium text-gray-800">
            {guest.guestPhone || "Not provided"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Check-in</p>
          <p className="mt-1 text-sm font-medium text-gray-800">
            {formatDate(guest.checkIn)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Check-out</p>
          <p className="mt-1 text-sm font-medium text-gray-800">
            {formatDate(guest.checkOut)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 sm:grid-cols-4">
        <div>
          <p className="text-xs text-gray-500">Booking Total</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {money(payment.totalPrice)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Payment Received</p>
          <p className="mt-1 text-sm font-semibold text-green-700">
            {money(payment.totalReceived)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Remaining</p>
          <p className="mt-1 text-sm font-semibold text-orange-700">
            {money(payment.remainingBalance)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Payment Status</p>
          <p className="mt-1 text-sm font-semibold capitalize text-gray-800">
            {payment.status || "Unpaid"}
          </p>
        </div>
      </div>

      {guest.status === "pending" && (
        <p className="mt-3 text-xs font-medium text-orange-700">
          This reservation is pending payment verification.
        </p>
      )}
    </div>
  );
}

function GuestSection({ title, icon: Icon, guests, type, emptyText }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <Icon size={19} />
          {title}
        </h2>

        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
          {guests.length}
        </span>
      </div>

      {guests.length > 0 ? (
        <div className="space-y-3">
          {guests.map((guest) => (
            <GuestCard
              key={guest._id}
              guest={guest}
              type={type}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          {emptyText}
        </div>
      )}
    </section>
  );
}

export default function GuestManagementPage() {
  const [selectedDate, setSelectedDate] = useState(getToday);
  const [search, setSearch] = useState("");
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadGuests = async () => {
    if (!selectedDate) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/guests?date=${selectedDate}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load guests.");
      }

      setGuests(data.guests || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setGuests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, [selectedDate]);

  const filteredGuests = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return guests;

    return guests.filter((guest) => {
      return [
        guest.guestName,
        guest.guestPhone,
        guest.bookingReference,
        guest.cottage?.name,
        guest.guestEmail,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(keyword)
        );
    });
  }, [guests, search]);

  const arriving = filteredGuests.filter(
    (guest) => getDateKey(guest.checkIn) === selectedDate
  );

  const checkingOut = filteredGuests.filter(
    (guest) => getDateKey(guest.checkOut) === selectedDate
  );

  const staying = filteredGuests.filter(
    (guest) =>
      getDateKey(guest.checkIn) !== selectedDate &&
      getDateKey(guest.checkOut) !== selectedDate
  );

  const totalOutstanding = filteredGuests.reduce(
    (sum, guest) =>
      sum + Number(guest.payment?.remainingBalance || 0),
    0
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Guest Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage arrivals, current guests and checkout activities.
          </p>
        </div>

        <button
          onClick={loadGuests}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users size={18} />
            Total Guests
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {filteredGuests.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <LogIn size={18} />
            Arriving Today
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-700">
            {arriving.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <LogOut size={18} />
            Checking Out Today
          </div>
          <p className="mt-2 text-2xl font-bold text-orange-700">
            {checkingOut.length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Guest Date
            </label>

            <div className="relative">
              <CalendarDays
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="date"
                value={selectedDate}
                onChange={(event) =>
                  setSelectedDate(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#074E37]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Search Guests
            </label>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, phone, cottage or booking reference"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#074E37]"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Loading guest information...
        </div>
      ) : (
        <div className="space-y-7">
          <GuestSection
            title="Arriving Today"
            icon={LogIn}
            guests={arriving}
            type="arriving"
            emptyText="No guests arriving on this date."
          />

          <GuestSection
            title="Staying Today"
            icon={BedDouble}
            guests={staying}
            type="staying"
            emptyText="No guests staying overnight on this date."
          />

          <GuestSection
            title="Checking Out Today"
            icon={LogOut}
            guests={checkingOut}
            type="checkout"
            emptyText="No guests checking out on this date."
          />
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Wallet size={18} />
          Accommodation Outstanding Balance
        </div>

        <p className="mt-2 text-2xl font-bold text-orange-700">
          {money(totalOutstanding)}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Sum of remaining accommodation balances for the displayed guests.
          Restaurant bills are tracked separately.
        </p>
      </div>
    </div>
  );
}
