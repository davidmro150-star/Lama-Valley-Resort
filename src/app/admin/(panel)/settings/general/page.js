
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, LoaderCircle } from "lucide-react";

const initialSettings = {
  resortName: "",
  phone: "",
  email: "",
  address: "",
  mapLink: "",
  shortDescription: "",
};

const inputClass =
  "w-full rounded-lg border border-[#e8e4da] bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10";

const fields = [
  {
    name: "resortName",
    label: "Resort Name",
    placeholder: "Lama Valley Resort & Restaurant",
    required: true,
  },
  {
    name: "phone",
    label: "Contact Number",
    placeholder: "+880 1XXXXXXXXX",
  },
  {
    name: "email",
    label: "Email Address",
    placeholder: "info@lamavalleyresort.com",
    type: "email",
  },
  {
    name: "address",
    label: "Resort Address",
    placeholder: "Lama, Bandarban, Bangladesh",
  },
  {
    name: "mapLink",
    label: "Google Maps Link",
    placeholder: "https://maps.google.com/...",
    type: "url",
  },
];

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/admin/site-settings");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load settings.");
        }

        setSettings({
          ...initialSettings,
          ...data.settings,
        });
      } catch (error) {
        setMessage(error.message);
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save settings.");
      }

      setSettings({
        ...initialSettings,
        ...data.settings,
      });

      setMessage("General information updated successfully.");
      setMessageType("success");
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoaderCircle className="animate-spin text-[#426b55]" size={30} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <Link
          href="/admin/settings"
          className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#426b55]"
        >
          <ArrowLeft size={16} />
          Back to Settings
        </Link>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a805d]">
          System Configuration
        </p>

        <h1 className="mt-2 font-serif text-3xl font-semibold text-[#173729]">
          General Information
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage your resort's basic information and contact details.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-7 rounded-xl border border-[#e8e4da] bg-white p-6 sm:p-8"
      >
        <div>
          <h2 className="text-lg font-semibold text-[#173729]">
            Resort Information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            These details identify your resort across the website.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-700"
              >
                {field.label}
                {field.required && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </label>

              <input
                id={field.name}
                name={field.name}
                type={field.type || "text"}
                value={settings[field.name] || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                className={inputClass}
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="shortDescription"
            className="block text-sm font-medium text-gray-700"
          >
            Short Resort Description
          </label>

          <textarea
            id="shortDescription"
            name="shortDescription"
            rows={4}
            value={settings.shortDescription || ""}
            onChange={handleChange}
            placeholder="Write a short introduction about Lama Valley Resort..."
            className={`${inputClass} resize-y`}
          />

          <p className="text-xs text-gray-400">
            A short description of your resort for general website information.
          </p>
        </div>

        {message && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              messageType === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex justify-end border-t border-[#eeeae2] pt-6">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#234b3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
