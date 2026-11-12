
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  LoaderCircle,
  CreditCard,
  Smartphone,
  Building2,
  Clock,
  CalendarCheck,
  CheckCircle2,
} from "lucide-react";

const initialSettings = {
  advancePercentage: 30,
  paymentDeadlineHours: 2,
  bookingEnabled: true,
  paymentMethods: {
    bkash: {
      enabled: true,
      accountNumber: "",
      accountName: "",
      instructions: "",
    },
    nagad: {
      enabled: true,
      accountNumber: "",
      accountName: "",
      instructions: "",
    },
    bank: {
      enabled: true,
      bankName: "",
      accountName: "",
      accountNumber: "",
      branchName: "",
      routingNumber: "",
      instructions: "",
    },
  },
};

export default function BookingSettingsPage() {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/booking-settings", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load booking settings."
          );
        }

        setSettings({
          ...initialSettings,
          ...data.settings,
          paymentMethods: {
            bkash: {
              ...initialSettings.paymentMethods.bkash,
              ...data.settings.paymentMethods?.bkash,
            },
            nagad: {
              ...initialSettings.paymentMethods.nagad,
              ...data.settings.paymentMethods?.nagad,
            },
            bank: {
              ...initialSettings.paymentMethods.bank,
              ...data.settings.paymentMethods?.bank,
            },
          },
        });
      } catch (err) {
        setError(err.message || "Unable to load booking settings.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function handleGeneralChange(field, value) {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));

    setMessage("");
    setError("");
  }

  function handlePaymentChange(method, field, value) {
    setSettings((prev) => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: {
          ...prev.paymentMethods[method],
          [field]: value,
        },
      },
    }));

    setMessage("");
    setError("");
  }

  async function handleSave(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/booking-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save booking settings."
        );
      }

      setSettings({
        ...initialSettings,
        ...data.settings,
        paymentMethods: {
          bkash: {
            ...initialSettings.paymentMethods.bkash,
            ...data.settings.paymentMethods?.bkash,
          },
          nagad: {
            ...initialSettings.paymentMethods.nagad,
            ...data.settings.paymentMethods?.nagad,
          },
          bank: {
            ...initialSettings.paymentMethods.bank,
            ...data.settings.paymentMethods?.bank,
          },
        },
      });

      setMessage("Booking settings saved successfully.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <LoaderCircle
          className="animate-spin text-[#234b3b]"
          size={30}
        />
      </div>
    );
  }

  const enabledCount = Object.values(settings.paymentMethods).filter(
    (method) => method.enabled
  ).length;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin/settings"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#234b3b]"
        >
          <ArrowLeft size={16} />
          Back to Settings
        </Link>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#426b55]">
              <CreditCard size={19} />
              <span className="text-sm font-semibold">
                Reservation Preferences
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Booking Configuration
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage advance payments, payment accounts and online booking availability.
            </p>
          </div>

          <button
            type="submit"
            form="booking-settings-form"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <form
        id="booking-settings-form"
        onSubmit={handleSave}
        className="space-y-7"
      >
        {/* Booking availability */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-[#f0f5f1] p-2.5 text-[#234b3b]">
              <CalendarCheck size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Online Booking Availability
              </h2>
              <p className="text-sm text-gray-500">
                Control whether guests can submit new booking requests.
              </p>
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-gray-200 p-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Accept Online Bookings
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Turn off to temporarily stop new online reservations.
              </p>
            </div>

            <input
              type="checkbox"
              checked={settings.bookingEnabled}
              onChange={(e) =>
                handleGeneralChange("bookingEnabled", e.target.checked)
              }
              className="h-5 w-5 accent-[#234b3b]"
            />
          </label>

          <div className="mt-4 flex items-center gap-2 text-sm">
            {settings.bookingEnabled ? (
              <>
                <CheckCircle2 size={17} className="text-green-600" />
                <span className="font-medium text-green-700">
                  Online bookings are enabled
                </span>
              </>
            ) : (
              <>
                <Clock size={17} className="text-red-500" />
                <span className="font-medium text-red-600">
                  Online bookings are currently closed
                </span>
              </>
            )}
          </div>
        </section>

        {/* Advance payment */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-[#f0f5f1] p-2.5 text-[#234b3b]">
              <CreditCard size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Advance Payment Configuration
              </h2>
              <p className="text-sm text-gray-500">
                Set the advance percentage guests must pay to request a reservation.
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Required Advance Payment
            </label>

            <div className="grid grid-cols-2 gap-3">
              {[30, 50].map((percentage) => (
                <button
                  key={percentage}
                  type="button"
                  onClick={() =>
                    handleGeneralChange("advancePercentage", percentage)
                  }
                  className={`rounded-xl border p-5 text-center transition ${
                    settings.advancePercentage === percentage
                      ? "border-[#234b3b] bg-[#f0f5f1] text-[#234b3b]"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  <span className="block text-3xl font-bold">
                    {percentage}%
                  </span>
                  <span className="mt-1 block text-xs font-medium">
                    Advance payment
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-700">
              Example calculation
            </p>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">Booking total</p>
                <p className="mt-1 font-semibold text-gray-900">৳10,000</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Required advance</p>
                <p className="mt-1 font-semibold text-[#234b3b]">
                  ৳{(10000 * settings.advancePercentage) / 100}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Remaining balance</p>
                <p className="mt-1 font-semibold text-gray-900">
                  ৳{10000 - (10000 * settings.advancePercentage) / 100}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* bKash */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-pink-50 p-2.5 text-pink-600">
                <Smartphone size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">bKash</h2>
                <p className="text-sm text-gray-500">
                  Receive advance payments through bKash.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={settings.paymentMethods.bkash.enabled}
                onChange={(e) =>
                  handlePaymentChange("bkash", "enabled", e.target.checked)
                }
                className="h-4 w-4 accent-[#234b3b]"
              />
              Enable bKash
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                bKash Account Number
              </label>
              <input
                type="text"
                value={settings.paymentMethods.bkash.accountNumber}
                onChange={(e) =>
                  handlePaymentChange("bkash", "accountNumber", e.target.value)
                }
                placeholder="01XXXXXXXXX"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Account Name
              </label>
              <input
                type="text"
                value={settings.paymentMethods.bkash.accountName}
                onChange={(e) =>
                  handlePaymentChange("bkash", "accountName", e.target.value)
                }
                placeholder="Resort account name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Payment Instructions
              </label>
              <textarea
                rows={3}
                value={settings.paymentMethods.bkash.instructions}
                onChange={(e) =>
                  handlePaymentChange("bkash", "instructions", e.target.value)
                }
                placeholder="Example: Use Send Money or the payment method specified by the resort. Enter the correct amount and keep your transaction ID."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
              />
            </div>
          </div>
        </section>

        {/* Nagad */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600">
                <Smartphone size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Nagad</h2>
                <p className="text-sm text-gray-500">
                  Receive advance payments through Nagad.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={settings.paymentMethods.nagad.enabled}
                onChange={(e) =>
                  handlePaymentChange("nagad", "enabled", e.target.checked)
                }
                className="h-4 w-4 accent-[#234b3b]"
              />
              Enable Nagad
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nagad Account Number
              </label>
              <input
                type="text"
                value={settings.paymentMethods.nagad.accountNumber}
                onChange={(e) =>
                  handlePaymentChange("nagad", "accountNumber", e.target.value)
                }
                placeholder="01XXXXXXXXX"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Account Name
              </label>
              <input
                type="text"
                value={settings.paymentMethods.nagad.accountName}
                onChange={(e) =>
                  handlePaymentChange("nagad", "accountName", e.target.value)
                }
                placeholder="Resort account name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Payment Instructions
              </label>
              <textarea
                rows={3}
                value={settings.paymentMethods.nagad.instructions}
                onChange={(e) =>
                  handlePaymentChange("nagad", "instructions", e.target.value)
                }
                placeholder="Enter payment instructions for guests."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
              />
            </div>
          </div>
        </section>

        {/* Bank */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Bank Transfer</h2>
                <p className="text-sm text-gray-500">
                  Receive advance payments directly into the resort bank account.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={settings.paymentMethods.bank.enabled}
                onChange={(e) =>
                  handlePaymentChange("bank", "enabled", e.target.checked)
                }
                className="h-4 w-4 accent-[#234b3b]"
              />
              Enable Bank Transfer
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              ["bankName", "Bank Name", "Enter bank name"],
              ["accountName", "Account Name", "Resort account name"],
              ["accountNumber", "Account Number", "Enter account number"],
              ["branchName", "Branch Name", "Enter branch name"],
              ["routingNumber", "Routing Number", "Enter routing number"],
            ].map(([field, label, placeholder]) => (
              <div key={field}>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {label}
                </label>
                <input
                  type="text"
                  value={settings.paymentMethods.bank[field]}
                  onChange={(e) =>
                    handlePaymentChange("bank", field, e.target.value)
                  }
                  placeholder={placeholder}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
                />
              </div>
            ))}

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Payment Instructions
              </label>
              <textarea
                rows={3}
                value={settings.paymentMethods.bank.instructions}
                onChange={(e) =>
                  handlePaymentChange("bank", "instructions", e.target.value)
                }
                placeholder="Enter bank transfer instructions for guests."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
              />
            </div>
          </div>
        </section>

        {/* Payment deadline */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-[#f0f5f1] p-2.5 text-[#234b3b]">
              <Clock size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Payment Deadline
              </h2>
              <p className="text-sm text-gray-500">
                Set how long guests have to complete their advance payment.
              </p>
            </div>
          </div>

          <div className="max-w-sm">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Payment Time Limit
            </label>

            <select
              value={settings.paymentDeadlineHours}
              onChange={(e) =>
                handleGeneralChange(
                  "paymentDeadlineHours",
                  Number(e.target.value)
                )
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
            >
              {[1, 2, 3, 4, 6, 12, 24, 48].map((hour) => (
                <option key={hour} value={hour}>
                  {hour} {hour === 1 ? "Hour" : "Hours"}
                </option>
              ))}
            </select>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            The booking system will use this deadline when we implement payment expiry.
          </p>
        </section>

        {/* Enabled methods summary */}
        <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-800">
            Enabled Payment Methods: {enabledCount} of 3
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Guests will only see payment methods enabled here.
          </p>
        </section>

        {/* Feedback */}
        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173729] disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}
            {saving ? "Saving..." : "Save Booking Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
