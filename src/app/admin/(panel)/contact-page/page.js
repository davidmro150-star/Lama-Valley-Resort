
"use client";

import { useEffect, useState } from "react";
import {
  Save,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Clock,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const initialForm = {
  heroTitle: "",
  heroSubtitle: "",
  heroImage: "",
  introTitle: "",
  introDescription: "",
  phone: "",
  email: "",
  address: "",
  openingHours: "",
  mapEmbedUrl: "",
  locationDescription: "",
};

export default function ContactPageEditor() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setFeedback({ type: "", message: "" });

      const response = await fetch("/api/admin/contact-page");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load settings");
      }

      setForm({
        ...initialForm,
        ...data.settings,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Failed to load Contact Page settings.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setFeedback({ type: "", message: "" });

      const response = await fetch("/api/admin/contact-page", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save settings");
      }

      setForm({
        ...initialForm,
        ...data.settings,
      });

      setFeedback({
        type: "success",
        message: "Contact Page settings saved successfully!",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Something went wrong.",
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#e5e0d7] bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10";

  const labelClass = "text-sm font-semibold text-[#234b3b]";

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center text-gray-500">
        <RefreshCw className="mr-3 animate-spin" size={20} />
        Loading Contact Page settings...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a9804d]">
            Website Content
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#234b3b]">
            Contact Page Settings
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Customize the information displayed on your public Contact Page.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e5e0d7] bg-white px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Reload
        </button>
      </div>

      {/* Feedback */}
      {feedback.message && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 text-sm ${
            feedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle size={19} />
          ) : (
            <AlertCircle size={19} />
          )}

          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Hero Section */}
        <section className="rounded-2xl border border-[#e9e3d8] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#234b3b]">
              Hero Section
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Main heading and banner information.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className={labelClass}>Hero Title</label>
              <input
                name="heroTitle"
                value={form.heroTitle}
                onChange={handleChange}
                className={inputClass}
                placeholder="Get in Touch"
                required
              />
            </div>

            <div>
              <label className={labelClass}>Hero Subtitle</label>
              <textarea
                name="heroSubtitle"
                value={form.heroSubtitle}
                onChange={handleChange}
                rows={3}
                className={inputClass}
                placeholder="Enter your hero description"
              />
            </div>

            <div>
              <label className={labelClass}>
                <ImageIcon size={16} className="mr-2 inline" />
                Hero Image URL
              </label>

              <input
                name="heroImage"
                value={form.heroImage}
                onChange={handleChange}
                className={inputClass}
                placeholder="Paste Cloudinary image URL"
              />

              {form.heroImage && (
                <div className="mt-4">
                  <img
                    src={form.heroImage}
                    alt="Contact page hero preview"
                    className="h-48 w-full rounded-xl object-cover"
                  />
                </div>
              )}

              <p className="mt-2 text-xs text-gray-400">
                Image upload through Cloudinary will be connected in the next step.
              </p>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="rounded-2xl border border-[#e9e3d8] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-[#234b3b]">
            Introduction Section
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <label className={labelClass}>Introduction Title</label>
              <input
                name="introTitle"
                value={form.introTitle}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Introduction Description</label>
              <textarea
                name="introDescription"
                value={form.introDescription}
                onChange={handleChange}
                rows={4}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="rounded-2xl border border-[#e9e3d8] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-[#234b3b]">
            Contact Information
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                <Phone size={15} className="mr-2 inline" />
                Phone Number
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
                placeholder="+880..."
              />
            </div>

            <div>
              <label className={labelClass}>
                <Mail size={15} className="mr-2 inline" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="info@example.com"
              />
            </div>

            <div>
              <label className={labelClass}>
                <MapPin size={15} className="mr-2 inline" />
                Resort Address
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className={inputClass}
                placeholder="Lama, Bandarban, Bangladesh"
              />
            </div>

            <div>
              <label className={labelClass}>
                <Clock size={15} className="mr-2 inline" />
                Opening Hours
              </label>
              <input
                name="openingHours"
                value={form.openingHours}
                onChange={handleChange}
                className={inputClass}
                placeholder="Every day: 9 AM - 10 PM"
              />
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="rounded-2xl border border-[#e9e3d8] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-[#234b3b]">
            Location & Map
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <label className={labelClass}>Location Description</label>
              <textarea
                name="locationDescription"
                value={form.locationDescription}
                onChange={handleChange}
                rows={3}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Google Maps Embed URL
              </label>
              <textarea
                name="mapEmbedUrl"
                value={form.mapEmbedUrl}
                onChange={handleChange}
                rows={3}
                className={inputClass}
                placeholder="Paste the Google Maps embed URL"
              />
              <p className="mt-2 text-xs text-gray-400">
                Use the embed URL from Google Maps, not the ordinary sharing link.
              </p>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#234b3b] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Saving Changes..." : "Save Contact Page"}
          </button>
        </div>
      </form>
    </div>
  );
}
