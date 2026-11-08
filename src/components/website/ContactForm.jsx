
"use client";

import { useState } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to send your message.");
      }

      setForm(initialForm);

      setFeedback({
        type: "success",
        message: data.message,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.message ||
          "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#e5e0d6] bg-[#fdfcf9] px-4 py-3.5 text-sm text-[#173729] outline-none transition placeholder:text-gray-400 focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10";

  return (
    <div className="rounded-2xl border border-[#e9e3d8] bg-white p-6 shadow-sm sm:p-9">
      <div className="mb-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#a9804d]">
          Send Us a Message
        </p>

        <h2 className="font-serif text-3xl font-bold text-[#173729]">
          We'd Love to Hear From You
        </h2>

        <p className="mt-3 text-sm leading-7 text-gray-500">
          Fill out the form below and our team will get back to you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name and Email */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="contact-name"
              className="text-sm font-semibold text-[#234b3b]"
            >
              Full Name *
            </label>

            <input
              id="contact-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              maxLength={100}
              autoComplete="name"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="contact-email"
              className="text-sm font-semibold text-[#234b3b]"
            >
              Email Address *
            </label>

            <input
              id="contact-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
              maxLength={150}
              autoComplete="email"
              required
              className={inputClass}
            />
          </div>
        </div>

        {/* Phone and Subject */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="contact-phone"
              className="text-sm font-semibold text-[#234b3b]"
            >
              Phone Number
            </label>

            <input
              id="contact-phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              maxLength={30}
              autoComplete="tel"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="contact-subject"
              className="text-sm font-semibold text-[#234b3b]"
            >
              Subject *
            </label>

            <input
              id="contact-subject"
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="What is your enquiry about?"
              maxLength={150}
              required
              className={inputClass}
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="contact-message"
            className="text-sm font-semibold text-[#234b3b]"
          >
            Your Message *
          </label>

          <textarea
            id="contact-message"
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Write your message here..."
            rows={6}
            maxLength={3000}
            required
            className={`${inputClass} resize-y`}
          />

          <p className="mt-2 text-right text-xs text-gray-400">
            {form.message.length}/3000 characters
          </p>
        </div>

        {/* Success or Error Message */}
        {feedback.message && (
          <div
            role="status"
            aria-live="polite"
            className={`flex items-start gap-3 rounded-xl p-4 text-sm leading-6 ${feedback.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-700"
              }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle className="mt-0.5 shrink-0" size={19} />
            ) : (
              <AlertCircle className="mt-0.5 shrink-0" size={19} />
            )}

            <p>{feedback.message}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#234b3b] px-8 py-4 font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {loading ? (
            "Sending Message..."
          ) : (
            <>
              Send Message
              <Send size={17} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
