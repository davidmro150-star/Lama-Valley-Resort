
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  LoaderCircle,
  Globe,
  Link as LinkIcon,
} from "lucide-react";

const initialSettings = {
  resortName: "Lama Valley Resort & Restaurant",
  phone: "",
  email: "",
  address: "Lama, Bandarban, Bangladesh",
  mapLink: "",
  shortDescription: "",
  socialMedia: {
    facebook: "",
    instagram: "",
    youtube: "",
    tiktok: "",
    linkedin: "",
  },
};
const socialFields = [
  {
    name: "facebook",
    label: "Facebook",
    icon: Globe,
    placeholder: "https://www.facebook.com/yourpage",
  },
  {
    name: "instagram",
    label: "Instagram",
    icon: Globe,
    placeholder: "https://www.instagram.com/yourpage",
  },
  {
    name: "youtube",
    label: "YouTube",
    icon: Globe,
    placeholder: "https://www.youtube.com/@yourchannel",
  },
  {
    name: "tiktok",
    label: "TikTok",
    icon: Globe,
    placeholder: "https://www.tiktok.com/@youraccount",
  },
  {
    name: "linkedin",
    label: "LinkedIn",
    icon: Globe,
    placeholder: "https://www.linkedin.com/company/yourpage",
  },
];

const inputClass =
  "w-full rounded-lg border border-[#e8e4da] bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10";

export default function SocialMediaSettingsPage() {
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
          socialMedia: {
            ...initialSettings.socialMedia,
            ...data.settings.socialMedia,
          },
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
      socialMedia: {
        ...previous.socialMedia,
        [name]: value,
      },
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
        throw new Error(data.message || "Unable to save social media links.");
      }

      setSettings({
        ...initialSettings,
        ...data.settings,
        socialMedia: {
          ...initialSettings.socialMedia,
          ...data.settings.socialMedia,
        },
      });

      setMessage("Social media links updated successfully.");
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
          Social Media
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage the social media profiles displayed on your resort website.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-7 rounded-xl border border-[#e8e4da] bg-white p-6 sm:p-8"
      >
        <div>
          <h2 className="text-lg font-semibold text-[#173729]">
            Social Media Profiles
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter the full URL of each social media profile. Leave a field
            empty if your resort does not have that account.
          </p>
        </div>

        <div className="space-y-6">
          {socialFields.map((field) => {
            const Icon = field.icon;

            return (
              <div key={field.name} className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <Icon size={18} className="text-[#426b55]" />
                  {field.label}
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type="url"
                  value={settings.socialMedia[field.name] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={inputClass}
                />
              </div>
            );
          })}
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
