
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  CalendarDays,
  Users,
  BedDouble,
  ArrowLeft,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle2,
  LoaderCircle,
  Smartphone,
  Building2,
  CreditCard,
  Upload,
  Wallet,
} from "lucide-react";
import Link from "next/link";

const defaultPaymentMethods = {
  bkash: {
    enabled: false,
    accountNumber: "",
    accountName: "",
    instructions: "",
  },
  nagad: {
    enabled: false,
    accountNumber: "",
    accountName: "",
    instructions: "",
  },
  bank: {
    enabled: false,
    bankName: "",
    accountName: "",
    accountNumber: "",
    branchName: "",
    routingNumber: "",
    instructions: "",
  },
};

function BookingContent() {
  const searchParams = useSearchParams();

  const cottageSlug = searchParams.get("cottage") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || "1";
  const nights = searchParams.get("nights") || "0";
  const estimatedTotal = searchParams.get("estimatedTotal") || "0";

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  // Load public booking and payment settings
  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetch("/api/booking-settings", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load payment information."
          );
        }

        if (!cancelled) {
          const loadedSettings = data.settings;

          const methods = {
            bkash: {
              ...defaultPaymentMethods.bkash,
              ...loadedSettings.paymentMethods?.bkash,
            },
            nagad: {
              ...defaultPaymentMethods.nagad,
              ...loadedSettings.paymentMethods?.nagad,
            },
            bank: {
              ...defaultPaymentMethods.bank,
              ...loadedSettings.paymentMethods?.bank,
            },
          };

          setSettings({
            ...loadedSettings,
            paymentMethods: methods,
          });

          const availableMethod = ["bkash", "nagad", "bank"].find(
            (method) => {
              const item = methods[method];

              if (!item.enabled) return false;

              if (method === "bank") {
                return Boolean(
                  item.bankName &&
                  item.accountName &&
                  item.accountNumber
                );
              }

              return Boolean(item.accountName && item.accountNumber);
            }
          );

          setPaymentMethod(availableMethod || "");
        }
      } catch (err) {
        if (!cancelled) {
          setSettingsError(
            err.message || "Unable to load payment settings."
          );
        }
      } finally {
        if (!cancelled) {
          setSettingsLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (date) => {
    if (!date) return "Not selected";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-BD");

  const totalAmount = Number(estimatedTotal) || 0;

  const advancePercentage = settings?.advancePercentage || 30;

  const advanceAmount = Math.round(
    (totalAmount * advancePercentage) / 100
  );

  const selectedPaymentDetails =
    settings?.paymentMethods?.[paymentMethod];

  const paymentMethodNames = {
    bkash: "bKash",
    nagad: "Nagad",
    bank: "Bank Transfer",
  };

  const handleScreenshotChange = (event) => {
    const file = event.target.files?.[0];

    setError("");
    setPaymentScreenshot(null);

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Payment screenshot must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setPaymentScreenshot(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!settings?.bookingEnabled) {
      setError("Online booking is currently unavailable.");
      return;
    }

    if (!paymentMethod || !selectedPaymentDetails?.enabled) {
      setError("Please select an available payment method.");
      return;
    }

    if (!transactionId.trim()) {
      setError("Please enter your payment transaction ID.");
      return;
    }

    if (!paymentScreenshot) {
      setError("Please upload your payment screenshot.");
      return;
    }

    if (advanceAmount <= 0) {
      setError("Unable to calculate the advance payment.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Upload payment screenshot
      const uploadData = new FormData();

      uploadData.append("file", paymentScreenshot);

      const uploadResponse = await fetch("/api/payment-proof", {
        method: "POST",
        body: uploadData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadResult.success) {
        throw new Error(
          uploadResult.message || "Unable to upload payment screenshot."
        );
      }

      // Step 2: Submit booking and payment information
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cottage: cottageSlug,
          guestName,
          guestEmail,
          guestPhone,
          checkIn,
          checkOut,
          guests: Number(guests),

          paymentMethod,
          paymentAmount: advanceAmount,
          transactionId: transactionId.trim(),
          paymentProof: uploadResult.proof,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to submit your booking."
        );
      }

      setSuccess(data.booking);
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Booking success screen
  if (success) {
    return (
      <main className="min-h-screen bg-[#f7f5ef] px-4 py-20">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm md:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f0eb]">
            <CheckCircle2 size={42} className="text-[#234b3b]" />
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[3px] text-[#c49a62]">
            Lama Valley Resort
          </p>

          <h1 className="text-3xl font-semibold text-[#173729]">
            Booking Request Submitted!
          </h1>

          <p className="mt-4 leading-7 text-[#777d73]">
            Thank you for choosing Lama Valley Resort. Your booking
            request and payment details have been received. Your
            reservation is pending manual verification by our team.
          </p>

          <div className="my-8 rounded-xl bg-[#f7f5ef] p-5 text-left">
            <p className="text-sm text-[#777d73]">
              Booking Reference
            </p>

            <p className="mt-1 break-all font-semibold text-[#173729]">
              {success.bookingReference}
            </p>

            <div className="my-4 border-t border-[#e8d6b8]" />

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-[#777d73]">Booking status</span>
              <span className="font-semibold capitalize text-[#9a692c]">
                {success.status}
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-4 text-sm">
              <span className="text-[#777d73]">Payment status</span>
              <span className="font-semibold capitalize text-[#9a692c]">
                {success.paymentStatus}
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-4 text-sm">
              <span className="text-[#777d73]">Total amount</span>
              <span className="font-semibold text-[#173729]">
                ৳{formatPrice(success.totalPrice)}
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-4 text-sm">
              <span className="text-[#777d73]">Advance submitted</span>
              <span className="font-semibold text-[#173729]">
                ৳{formatPrice(success.paymentAmount)}
              </span>
            </div>
          </div>

          <p className="mb-6 text-sm leading-6 text-[#777d73]">
            Please keep your booking reference. Your dates are
            temporarily reserved while the resort verifies your payment.
          </p>

          <Link
            href="/stays"
            className="inline-flex items-center justify-center rounded-lg bg-[#234b3b] px-7 py-3 font-semibold text-white transition hover:bg-[#173729]"
          >
            Explore More Cottages
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] py-16">
      <div className="container mx-auto max-w-5xl px-4">
        <Link
          href="/stays"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#426b55] hover:text-[#173729]"
        >
          <ArrowLeft size={17} />
          Back to cottages
        </Link>

        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[3px] text-[#c49a62]">
            Lama Valley Resort
          </p>

          <h1 className="font-serif text-4xl text-[#173729] md:text-5xl">
            Complete Your Booking
          </h1>

          <p className="mt-4 text-[#777d73]">
            Review your reservation and complete the advance payment.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          {/* Reservation Details */}
          <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-2xl font-semibold text-[#173729]">
              Your Reservation
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <BedDouble className="mt-1 text-[#c49a62]" size={22} />
                <div>
                  <p className="text-sm text-[#777d73]">Cottage</p>
                  <p className="font-medium capitalize text-[#252a25]">
                    {cottageSlug
                      ? cottageSlug.replaceAll("-", " ")
                      : "Not selected"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CalendarDays className="mt-1 text-[#c49a62]" size={22} />
                <div>
                  <p className="text-sm text-[#777d73]">Check-in</p>
                  <p className="font-medium text-[#252a25]">
                    {formatDate(checkIn)}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-[#426b55]">
                    <Clock size={15} />
                    <span>From 1:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CalendarDays className="mt-1 text-[#c49a62]" size={22} />
                <div>
                  <p className="text-sm text-[#777d73]">Check-out</p>
                  <p className="font-medium text-[#252a25]">
                    {formatDate(checkOut)}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-[#426b55]">
                    <Clock size={15} />
                    <span>Until 11:00 AM</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Users className="mt-1 text-[#c49a62]" size={22} />
                <div>
                  <p className="text-sm text-[#777d73]">Guests</p>
                  <p className="font-medium text-[#252a25]">
                    {guests} guests
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Price Summary */}
          <section className="h-fit rounded-2xl bg-[#173729] p-6 text-white md:p-8">
            <h2 className="mb-6 text-2xl font-semibold">
              Price Summary
            </h2>

            <div className="space-y-4 border-b border-white/20 pb-6">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-white/70">Number of nights</span>
                <span>{nights}</span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-white/70">Number of guests</span>
                <span>{guests}</span>
              </div>
            </div>

            <div className="flex justify-between gap-4 pt-6">
              <span className="text-lg">Estimated total</span>
              <span className="text-2xl font-semibold text-[#e8d6b8]">
                ৳{formatPrice(estimatedTotal)}
              </span>
            </div>

            {settings && (
              <>
                <div className="mt-5 flex justify-between gap-4 border-t border-white/20 pt-5">
                  <span className="text-sm text-white/70">
                    Advance ({advancePercentage}%)
                  </span>
                  <span className="text-xl font-semibold text-[#e8d6b8]">
                    ৳{formatPrice(advanceAmount)}
                  </span>
                </div>

                <p className="mt-3 text-xs leading-6 text-white/60">
                  Remaining amount: ৳
                  {formatPrice(totalAmount - advanceAmount)}.
                  Payable according to the resort's payment policy.
                </p>
              </>
            )}

            <p className="mt-5 text-xs leading-6 text-white/60">
              The final total and required advance are recalculated
              by the booking server before your request is accepted.
            </p>
          </section>
        </div>

        {/* Guest and Payment Form */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <div className="mb-7">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#c49a62]">
              Guest Details
            </p>
            <h2 className="text-2xl font-semibold text-[#173729]">
              Your Information
            </h2>
            <p className="mt-2 text-sm text-[#777d73]">
              Provide your contact details and advance payment information.
            </p>
          </div>

          {settingsLoading ? (
            <div className="flex items-center justify-center gap-3 py-12 text-[#426b55]">
              <LoaderCircle size={22} className="animate-spin" />
              Loading payment information...
            </div>
          ) : settingsError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {settingsError}
            </div>
          ) : !settings?.bookingEnabled ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
              Online booking is currently unavailable. Please contact
              Lama Valley Resort for reservation assistance.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Guest Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="guestName"
                    className="mb-2 block text-sm font-medium text-[#252a25]"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute top-1/2 left-4 -translate-y-1/2 text-[#777d73]"
                    />
                    <input
                      id="guestName"
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      minLength={2}
                      maxLength={100}
                      autoComplete="name"
                      className="w-full rounded-lg border border-[#e5e3da] bg-[#fffdf8] py-3 pr-4 pl-11 text-sm text-[#252a25] outline-none transition focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="guestEmail"
                    className="mb-2 block text-sm font-medium text-[#252a25]"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute top-1/2 left-4 -translate-y-1/2 text-[#777d73]"
                    />
                    <input
                      id="guestEmail"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="example@email.com"
                      required
                      autoComplete="email"
                      className="w-full rounded-lg border border-[#e5e3da] bg-[#fffdf8] py-3 pr-4 pl-11 text-sm text-[#252a25] outline-none transition focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="guestPhone"
                    className="mb-2 block text-sm font-medium text-[#252a25]"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute top-1/2 left-4 -translate-y-1/2 text-[#777d73]"
                    />
                    <input
                      id="guestPhone"
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+880 1XXXXXXXXX"
                      required
                      maxLength={25}
                      autoComplete="tel"
                      className="w-full rounded-lg border border-[#e5e3da] bg-[#fffdf8] py-3 pr-4 pl-11 text-sm text-[#252a25] outline-none transition focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="border-t border-[#eee9df] pt-8">
                <div className="mb-6">
                  <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#c49a62]">
                    Advance Payment
                  </p>
                  <h2 className="text-2xl font-semibold text-[#173729]">
                    Complete Your Payment
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#777d73]">
                    Pay the required advance using one of the payment
                    methods provided by the resort.
                  </p>
                </div>

                <div className="mb-7 rounded-xl border border-[#e8d6b8] bg-[#fffdf8] p-5">
                  <p className="text-sm text-[#777d73]">
                    Required advance payment ({advancePercentage}%)
                  </p>
                  <p className="mt-1 text-3xl font-bold text-[#173729]">
                    ৳{formatPrice(advanceAmount)}
                  </p>
                  <p className="mt-2 text-xs text-[#777d73]">
                    Please send exactly this amount and enter the
                    transaction ID below.
                  </p>
                </div>

                {/* Payment Method Selection */}
                <h3 className="mb-4 font-semibold text-[#173729]">
                  Select Payment Method
                </h3>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      id: "bkash",
                      name: "bKash",
                      icon: Smartphone,
                    },
                    {
                      id: "nagad",
                      name: "Nagad",
                      icon: Wallet,
                    },
                    {
                      id: "bank",
                      name: "Bank Transfer",
                      icon: Building2,
                    },
                  ].map((method) => {
                    const details = settings.paymentMethods[method.id];

                    const configured =
                      method.id === "bank"
                        ? Boolean(
                            details?.bankName &&
                            details?.accountName &&
                            details?.accountNumber
                          )
                        : Boolean(
                            details?.accountName &&
                            details?.accountNumber
                          );

                    const available = details?.enabled && configured;
                    const Icon = method.icon;

                    return (
                      <button
                        key={method.id}
                        type="button"
                        disabled={!available}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`rounded-xl border p-4 text-left transition ${
                          paymentMethod === method.id
                            ? "border-[#234b3b] bg-[#eaf1ec] ring-2 ring-[#234b3b]/10"
                            : "border-[#e5e3da] bg-white hover:border-[#426b55]"
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        <Icon size={24} className="mb-3 text-[#234b3b]" />
                        <span className="block font-semibold text-[#173729]">
                          {method.name}
                        </span>
                        <span className="mt-1 block text-xs text-[#777d73]">
                          {available ? "Available" : "Unavailable"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Account Details */}
                {selectedPaymentDetails && (
                  <div className="mt-6 rounded-xl border border-[#e5e3da] bg-[#fffdf8] p-5">
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#173729]">
                      <CreditCard size={19} className="text-[#c49a62]" />
                      {paymentMethodNames[paymentMethod]} Payment Details
                    </h3>

                    {paymentMethod === "bank" ? (
                      <div className="space-y-3 text-sm">
                        <p>
                          <span className="text-[#777d73]">Bank Name: </span>
                          <strong className="text-[#173729]">
                            {selectedPaymentDetails.bankName}
                          </strong>
                        </p>
                        <p>
                          <span className="text-[#777d73]">Account Name: </span>
                          <strong className="text-[#173729]">
                            {selectedPaymentDetails.accountName}
                          </strong>
                        </p>
                        <p>
                          <span className="text-[#777d73]">Account Number: </span>
                          <strong className="select-all text-[#173729]">
                            {selectedPaymentDetails.accountNumber}
                          </strong>
                        </p>
                        {selectedPaymentDetails.branchName && (
                          <p>
                            <span className="text-[#777d73]">Branch: </span>
                            <strong className="text-[#173729]">
                              {selectedPaymentDetails.branchName}
                            </strong>
                          </p>
                        )}
                        {selectedPaymentDetails.routingNumber && (
                          <p>
                            <span className="text-[#777d73]">Routing Number: </span>
                            <strong className="text-[#173729]">
                              {selectedPaymentDetails.routingNumber}
                            </strong>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3 text-sm">
                        <p>
                          <span className="text-[#777d73]">Account Name: </span>
                          <strong className="text-[#173729]">
                            {selectedPaymentDetails.accountName}
                          </strong>
                        </p>
                        <p>
                          <span className="text-[#777d73]">Account Number: </span>
                          <strong className="select-all text-[#173729]">
                            {selectedPaymentDetails.accountNumber}
                          </strong>
                        </p>
                      </div>
                    )}

                    {selectedPaymentDetails.instructions && (
                      <div className="mt-4 border-t border-[#e5e3da] pt-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#777d73]">
                          Payment Instructions
                        </p>
                        <p className="whitespace-pre-line text-sm leading-6 text-[#426b55]">
                          {selectedPaymentDetails.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Transaction ID */}
                <div className="mt-7">
                  <label
                    htmlFor="transactionId"
                    className="mb-2 block text-sm font-medium text-[#252a25]"
                  >
                    Transaction ID
                  </label>
                  <input
                    id="transactionId"
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter your payment transaction ID"
                    required
                    minLength={4}
                    maxLength={100}
                    className="w-full rounded-lg border border-[#e5e3da] bg-[#fffdf8] px-4 py-3 text-sm text-[#252a25] outline-none transition focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
                  />
                </div>

                {/* Screenshot Upload */}
                <div className="mt-7">
                  <label
                    htmlFor="paymentScreenshot"
                    className="mb-2 block text-sm font-medium text-[#252a25]"
                  >
                    Payment Screenshot
                  </label>

                  <label
                    htmlFor="paymentScreenshot"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d8d8ca] bg-[#fffdf8] px-5 py-8 text-center transition hover:border-[#426b55]"
                  >
                    <Upload size={30} className="mb-3 text-[#426b55]" />

                    <span className="font-medium text-[#173729]">
                      {paymentScreenshot
                        ? paymentScreenshot.name
                        : "Choose your payment screenshot"}
                    </span>

                    <span className="mt-2 text-xs text-[#777d73]">
                      JPG, PNG or WebP · Maximum 5 MB
                    </span>

                    <input
                      id="paymentScreenshot"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleScreenshotChange}
                      className="sr-only"
                    />
                  </label>

                  {paymentScreenshot && (
                    <p className="mt-2 text-sm text-[#426b55]">
                      Screenshot selected successfully.
                    </p>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  loading ||
                  !cottageSlug ||
                  !checkIn ||
                  !checkOut ||
                  !paymentMethod ||
                  !paymentScreenshot
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-6 py-4 font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={19} className="animate-spin" />
                    Uploading & Submitting...
                  </>
                ) : (
                  "Submit Booking & Payment Details"
                )}
              </button>

              <p className="text-center text-xs leading-6 text-[#777d73]">
                Your booking will remain pending until the resort
                manually verifies your payment. Uploading a screenshot
                does not automatically confirm your reservation.
              </p>
            </form>
          )}
        </section>

        {/* Booking Information */}
        <div className="mt-8 rounded-xl border border-[#e8d6b8] bg-[#fffdf8] p-5">
          <h3 className="mb-2 font-semibold text-[#173729]">
            Check-in & Check-out Policy
          </h3>

          <div className="space-y-2 text-sm text-[#777d73]">
            <p>
              Check-in time:{" "}
              <strong className="text-[#173729]">1:00 PM</strong>
            </p>
            <p>
              Check-out time:{" "}
              <strong className="text-[#173729]">11:00 AM</strong>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-[#777d73]">
          Loading booking details...
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
