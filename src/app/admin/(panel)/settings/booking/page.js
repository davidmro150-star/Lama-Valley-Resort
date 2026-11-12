
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
          throw new Error(data.message || "Unable to load booking settings.");
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
        setError(err.message || "Unable to load settings.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function handleGeneralChange(field, value) {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handlePaymentChange(method, field, value) {
    setSettings((previous) => ({
      ...previous,
      paymentMethods: {
        ...previous.paymentMethods,
        [method]: {
          ...previous.paymentMethods[method],
          [field]: value,
        },
      },
    }));
  }

  async function handleSave() {
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
        throw new Error(data.message || "Unable to save booking settings.");
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
      setError(err.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  const enabledMethods = Object.values(settings.paymentMethods).filter(
    (method) => method.enabled
  ).length;

  const exampleTotal = 10000;
  const exampleAdvance = Math.round(
    (exampleTotal * settings.advancePercentage) / 100
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoaderCircle className="animate-spin text-[#234b3b]" size={30} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/admin/settings"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#234b3b]"
          >
            <ArrowLeft size={16} />
            Back to Settings
          </Link>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a805d]">
            Reservation Management
          </p>

          <h1 className="mt-2 font-serif text-3xl font-semibold text-[#173729]">
            Booking Configuration
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Configure advance payments, payment methods and booking availability.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Booking availability */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf2ed] text-[#234b3b]">
            <CalendarCheck size={23} />
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[#173729]">
              Booking Availability
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Control whether guests can submit new reservation requests.
            </p>

            <label className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-gray-50 p-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Accept Online Bookings
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Turn this off to temporarily stop new online bookings.
                </p>
              </div>

              <input
                type="checkbox"
                checked={settings.bookingEnabled}
                onChange={(event) =>
                  handleGeneralChange("bookingEnabled", event.target.checked)
                }
                className="h-5 w-5 accent-[#234b3b]"
              />
            </label>
          </div>
        </div>
      </section>

      {/* Advance payment */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf2ed] text-[#234b3b]">
            <CreditCard size={23} />
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[#173729]">
              Advance Payment
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose how much guests must pay in advance to submit a booking request.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[30, 50].map((percentage) => (
                <button
                  key={percentage}
                  type="button"
                  onClick={() =>
                    handleGeneralChange("advancePercentage", percentage)
                  }
                  className={`rounded-xl border p-5 text-left transition ${
                    settings.advancePercentage === percentage
                      ? "border-[#234b3b] bg-[#edf2ed]"
                      : "border-gray-200 hover:border-[#9aab9d]"
                  }`}
                >
                  <p className="text-2xl font-bold text-[#234b3b]">
                    {percentage}%
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {percentage === 30
                      ? "30% advance payment"
                      : "50% advance payment"}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-xl bg-[#f7f5ef] p-4">
              <p className="text-sm font-semibold text-[#173729]">
                Example payment calculation
              </p>

              <div className="mt-3 flex justify-between text-sm text-gray-600">
                <span>Example booking total</span>
                <span>৳{exampleTotal.toLocaleString("en-BD")}</span>
              </div>

              <div className="mt-2 flex justify-between text-sm font-semibold text-[#234b3b]">
                <span>Required advance ({settings.advancePercentage}%)</span>
                <span>৳{exampleAdvance.toLocaleString("en-BD")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* bKash */}
      <PaymentMethodCard
        title="bKash"
        description="Configure the resort's bKash payment account."
        icon={<Smartphone size={23} />}
        enabled={settings.paymentMethods.bkash.enabled}
        onToggle={(value) =>
          handlePaymentChange("bkash", "enabled", value)
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            label="bKash Account Number"
            value={settings.paymentMethods.bkash.accountNumber}
            onChange={(value) =>
              handlePaymentChange("bkash", "accountNumber", value)
            }
            placeholder="01XXXXXXXXX"
          />

          <InputField
            label="Account Name"
            value={settings.paymentMethods.bkash.accountName}
            onChange={(value) =>
              handlePaymentChange("bkash", "accountName", value)
            }
            placeholder="Resort account holder name"
          />
        </div>

        <InputField
          label="Payment Instructions (Optional)"
          value={settings.paymentMethods.bkash.instructions}
          onChange={(value) =>
            handlePaymentChange("bkash", "instructions", value)
          }
          placeholder="Example: Send Money to this number."
        />
      </PaymentMethodCard>

      {/* Nagad */}
      <PaymentMethodCard
        title="Nagad"
        description="Configure the resort's Nagad payment account."
        icon={<Smartphone size={23} />}
        enabled={settings.paymentMethods.nagad.enabled}
        onToggle={(value) =>
          handlePaymentChange("nagad", "enabled", value)
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            label="Nagad Account Number"
            value={settings.paymentMethods.nagad.accountNumber}
            onChange={(value) =>
              handlePaymentChange("nagad", "accountNumber", value)
            }
            placeholder="01XXXXXXXXX"
          />

          <InputField
            label="Account Name"
            value={settings.paymentMethods.nagad.accountName}
            onChange={(value) =>
              handlePaymentChange("nagad", "accountName", value)
            }
            placeholder="Resort account holder name"
          />
        </div>

        <InputField
          label="Payment Instructions (Optional)"
          value={settings.paymentMethods.nagad.instructions}
          onChange={(value) =>
            handlePaymentChange("nagad", "instructions", value)
          }
          placeholder="Example: Send Money to this number."
        />
      </PaymentMethodCard>

      {/* Bank transfer */}
      <PaymentMethodCard
        title="Bank Transfer"
        description="Configure the resort's bank account for direct transfers."
        icon={<Building2 size={23} />}
        enabled={settings.paymentMethods.bank.enabled}
        onToggle={(value) =>
          handlePaymentChange("bank", "enabled", value)
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            label="Bank Name"
            value={settings.paymentMethods.bank.bankName}
            onChange={(value) =>
              handlePaymentChange("bank", "bankName", value)
            }
            placeholder="Bank name"
          />

          <InputField
            label="Account Name"
            value={settings.paymentMethods.bank.accountName}
            onChange={(value) =>
              handlePaymentChange("bank", "accountName", value)
            }
            placeholder="Account holder name"
          />

          <InputField
            label="Account Number"
            value={settings.paymentMethods.bank.accountNumber}
            onChange={(value) =>
              handlePaymentChange("bank", "accountNumber", value)
            }
            placeholder="Bank account number"
          />

          <InputField
            label="Branch Name"
            value={settings.paymentMethods.bank.branchName}
            onChange={(value) =>
              handlePaymentChange("bank", "branchName", value)
            }
            placeholder="Branch name"
          />

          <InputField
            label="Routing Number"
            value={settings.paymentMethods.bank.routingNumber}
            onChange={(value) =>
              handlePaymentChange("bank", "routingNumber", value)
            }
            placeholder="Routing number"
          />
        </div>

        <InputField
          label="Payment Instructions (Optional)"
          value={settings.paymentMethods.bank.instructions}
          onChange={(value) =>
            handlePaymentChange("bank", "instructions", value)
          }
          placeholder="Additional bank transfer instructions."
        />
      </PaymentMethodCard>

      {/* Payment deadline */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf2ed] text-[#234b3b]">
            <Clock size={23} />
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[#173729]">
              Payment Deadline
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Set how long a guest has to complete payment before their pending reservation expires.
            </p>

            <div className="mt-5 max-w-xs">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Payment deadline (hours)
              </label>

              <input
                type="number"
                min="1"
                max="48"
                value={settings.paymentDeadlineHours}
                onChange={(event) =>
                  handleGeneralChange(
                    "paymentDeadlineHours",
                    Number(event.target.value)
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
              />

              <p className="mt-2 text-xs text-gray-400">
                Minimum 1 hour and maximum 48 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="rounded-2xl border border-[#dce7dc] bg-[#f3f7f2] p-6">
        <h2 className="font-semibold text-[#173729]">
          Configuration Summary
        </h2>

        <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
          <p>
            Advance payment:{" "}
            <strong className="text-[#234b3b]">
              {settings.advancePercentage}%
            </strong>
          </p>

          <p>
            Enabled payment methods:{" "}
            <strong className="text-[#234b3b]">{enabledMethods}</strong>
          </p>

          <p>
            Online bookings:{" "}
            <strong className="text-[#234b3b]">
              {settings.bookingEnabled ? "Enabled" : "Disabled"}
            </strong>
          </p>
        </div>
      </section>

      <div className="flex justify-end pb-8">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}
          {saving ? "Saving..." : "Save Booking Settings"}
        </button>
      </div>
    </div>
  );
}

function PaymentMethodCard({
  title,
  description,
  icon,
  enabled,
  onToggle,
  children,
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf2ed] text-[#234b3b]">
            {icon}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#173729]">
              {title}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-600">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => onToggle(event.target.checked)}
            className="h-5 w-5 accent-[#234b3b]"
          />
          Enabled
        </label>
      </div>

      {enabled && (
        <div className="mt-6 space-y-5 border-t border-gray-100 pt-6">
          {children}
        </div>
      )}
    </section>
  );
}

function InputField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type="text"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
      />
    </div>
  );
}
