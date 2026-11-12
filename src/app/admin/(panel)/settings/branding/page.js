
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  LoaderCircle,
  Palette,
  Image as ImageIcon,
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

const initialSettings = {
  logoUrl: "",
  logoAlt: "Lama Valley Resort & Restaurant",
  faviconUrl: "",
  primaryColor: "#234b3b",
  accentColor: "#c49a62",
};

const isValidHex = (value) => /^#[0-9A-Fa-f]{6}$/.test(value);

export default function BrandingSettingsPage() {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/site-settings");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load branding settings."
          );
        }

        setSettings({
          ...initialSettings,
          ...data.settings,
        });
      } catch (err) {
        setError(err.message || "Unable to load settings.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function handleChange(field, value) {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));

    setMessage("");
    setError("");
  }

  function handleColorPickerChange(field, value) {
    handleChange(field, value);
  }

  function handleHexChange(field, value) {
    const normalizedValue = value.startsWith("#")
      ? value
      : `#${value}`;

    handleChange(field, normalizedValue);
  }

  async function handleSave(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    if (!isValidHex(settings.primaryColor)) {
      setError("Please enter a valid Primary Color HEX code.");
      setSaving(false);
      return;
    }

    if (!isValidHex(settings.accentColor)) {
      setError("Please enter a valid Accent Color HEX code.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logoUrl: settings.logoUrl,
          logoAlt: settings.logoAlt,
          faviconUrl: settings.faviconUrl,
          primaryColor: settings.primaryColor,
          accentColor: settings.accentColor,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save branding settings."
        );
      }

      setSettings((prev) => ({
        ...prev,
        ...data.settings,
      }));

      setMessage("Branding settings saved successfully.");
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
              <Palette size={19} />
              <span className="text-sm font-semibold">
                Website Preferences
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Branding & Appearance
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage your resort logo, favicon and brand colors.
            </p>
          </div>

          <button
            type="submit"
            form="branding-form"
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
        id="branding-form"
        onSubmit={handleSave}
        className="space-y-7"
      >
        {/* Logo */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-[#f0f5f1] p-2.5 text-[#234b3b]">
              <ImageIcon size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Website Logo
              </h2>
              <p className="text-sm text-gray-500">
                Upload the logo displayed in your website header.
              </p>
            </div>
          </div>

          <div className="max-w-xl space-y-5">
            <ImageUploader
              label="Logo Image"
              value={settings.logoUrl}
              onChange={(value) => handleChange("logoUrl", value)}
              alt={settings.logoAlt}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Logo Alternative Text
              </label>

              <input
                type="text"
                value={settings.logoAlt}
                onChange={(e) =>
                  handleChange("logoAlt", e.target.value)
                }
                placeholder="Lama Valley Resort & Restaurant"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
              />

              <p className="mt-1 text-xs text-gray-500">
                Describes the logo for accessibility and search engines.
              </p>
            </div>
          </div>
        </section>

        {/* Favicon */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900">
              Website Favicon
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              The small icon displayed in the browser tab.
            </p>
          </div>

          <div className="max-w-xl">
            <ImageUploader
              label="Favicon Image"
              value={settings.faviconUrl}
              onChange={(value) =>
                handleChange("faviconUrl", value)
              }
              alt="Website favicon"
            />

            <p className="mt-2 text-xs text-gray-500">
              Recommended: square PNG image, 32 × 32 or 48 × 48 pixels.
            </p>
          </div>
        </section>

        {/* Brand Colors */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-[#f0f5f1] p-2.5 text-[#234b3b]">
              <Palette size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Brand Colors
              </h2>
              <p className="text-sm text-gray-500">
                Choose any color for your resort website.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Primary Color */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Primary Color
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                <input
                  type="color"
                  value={
                    isValidHex(settings.primaryColor)
                      ? settings.primaryColor
                      : initialSettings.primaryColor
                  }
                  onChange={(e) =>
                    handleColorPickerChange(
                      "primaryColor",
                      e.target.value
                    )
                  }
                  aria-label="Choose primary color"
                  className="h-11 w-14 cursor-pointer rounded border-0 bg-transparent"
                />

                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) =>
                    handleHexChange("primaryColor", e.target.value)
                  }
                  placeholder="#234B3B"
                  maxLength={7}
                  required
                  aria-label="Primary color HEX code"
                  className="w-full text-sm font-medium uppercase text-gray-700 outline-none"
                />
              </div>

              {!isValidHex(settings.primaryColor) && (
                <p className="mt-2 text-xs text-red-600">
                  Enter a valid HEX color, e.g. #123456.
                </p>
              )}
            </div>

            {/* Accent Color */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Accent Color
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                <input
                  type="color"
                  value={
                    isValidHex(settings.accentColor)
                      ? settings.accentColor
                      : initialSettings.accentColor
                  }
                  onChange={(e) =>
                    handleColorPickerChange(
                      "accentColor",
                      e.target.value
                    )
                  }
                  aria-label="Choose accent color"
                  className="h-11 w-14 cursor-pointer rounded border-0 bg-transparent"
                />

                <input
                  type="text"
                  value={settings.accentColor}
                  onChange={(e) =>
                    handleHexChange("accentColor", e.target.value)
                  }
                  placeholder="#C49A62"
                  maxLength={7}
                  required
                  aria-label="Accent color HEX code"
                  className="w-full text-sm font-medium uppercase text-gray-700 outline-none"
                />
              </div>

              {!isValidHex(settings.accentColor) && (
                <p className="mt-2 text-xs text-red-600">
                  Enter a valid HEX color, e.g. #E67E22.
                </p>
              )}
            </div>
          </div>

          {/* Color Preview */}
          <div className="mt-7">
            <p className="mb-3 text-sm font-medium text-gray-700">
              Brand Color Preview
            </p>

            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div
                className="rounded-lg px-5 py-3 text-sm font-semibold text-white"
                style={{
                  backgroundColor: isValidHex(settings.primaryColor)
                    ? settings.primaryColor
                    : initialSettings.primaryColor,
                }}
              >
                Primary Color
              </div>

              <div
                className="rounded-lg px-5 py-3 text-sm font-semibold text-white"
                style={{
                  backgroundColor: isValidHex(settings.accentColor)
                    ? settings.accentColor
                    : initialSettings.accentColor,
                }}
              >
                Accent Color
              </div>
            </div>
          </div>
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

        {/* Save */}
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
            {saving ? "Saving..." : "Save Branding Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
