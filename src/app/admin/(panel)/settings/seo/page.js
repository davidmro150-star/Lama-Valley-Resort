
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Search,
  Globe,
  Share2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Building2,
  Facebook,
  Code2,
  Info,
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

const initialSEO = {
  metaTitle: "Lama Valley Resort & Restaurant | Lama, Bandarban",
  metaDescription:
    "Discover Lama Valley Resort & Restaurant in Lama, Bandarban. Enjoy comfortable accommodation, delicious dining, and beautiful hill scenery.",
  keywords: [
    "Lama Valley Resort",
    "Resort in Lama",
    "Bandarban Resort",
    "Lama Bandarban",
  ],
  canonicalUrl: "",
  robotsIndex: true,
  robotsFollow: true,
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  ogType: "website",
};

export default function SEOSettingsPage() {
  const [seo, setSeo] = useState(initialSEO);
  const [keywordInput, setKeywordInput] = useState(
    initialSEO.keywords.join(", ")
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/site-settings");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load SEO settings."
          );
        }

        const savedSEO = data.settings?.seo || {};

        const mergedSEO = {
          ...initialSEO,
          ...savedSEO,
          keywords: Array.isArray(savedSEO.keywords)
            ? savedSEO.keywords
            : initialSEO.keywords,
        };

        setSeo(mergedSEO);
        setKeywordInput(mergedSEO.keywords.join(", "));
      } catch (err) {
        setError(err.message || "Unable to load SEO settings.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function handleChange(field, value) {
    setSeo((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const keywords = [
        ...new Set(
          keywordInput
            .split(",")
            .map((keyword) => keyword.trim())
            .filter(Boolean)
        ),
      ];

      const response = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seo: {
            ...seo,
            keywords,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save SEO settings."
        );
      }

      const savedSEO = data.settings?.seo;

      if (savedSEO) {
        const updatedSEO = {
          ...initialSEO,
          ...savedSEO,
          keywords: Array.isArray(savedSEO.keywords)
            ? savedSEO.keywords
            : keywords,
        };

        setSeo(updatedSEO);
        setKeywordInput(updatedSEO.keywords.join(", "));
      }

      setSuccess("SEO settings saved successfully.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  const previewTitle =
    seo.metaTitle || initialSEO.metaTitle;

  const previewDescription =
    seo.metaDescription || initialSEO.metaDescription;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading SEO settings...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/settings"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#234b3b]"
          >
            <ArrowLeft size={16} />
            Back to Settings
          </Link>

          <h1 className="text-2xl font-semibold text-[#173729]">
            SEO Settings
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Improve your resort website's visibility on Google and
            social media.
          </p>
        </div>

        <button
          type="submit"
          form="seo-settings-form"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={17} />
          {saving ? "Saving..." : "Save SEO Settings"}
        </button>
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      <form
        id="seo-settings-form"
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* Search Metadata */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-3 text-[#234b3b]">
              <Search size={21} />
            </div>

            <div>
              <h2 className="font-semibold text-[#173729]">
                Search Engine Metadata
              </h2>
              <p className="text-sm text-gray-500">
                Set the information Google can use to understand your
                website.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Meta Title
              </label>

              <input
                type="text"
                maxLength={70}
                value={seo.metaTitle}
                onChange={(e) =>
                  handleChange("metaTitle", e.target.value)
                }
                placeholder="Lama Valley Resort & Restaurant"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
              />

              <p className="mt-1 text-xs text-gray-500">
                {seo.metaTitle.length}/70 characters
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Meta Description
              </label>

              <textarea
                rows={4}
                maxLength={320}
                value={seo.metaDescription}
                onChange={(e) =>
                  handleChange("metaDescription", e.target.value)
                }
                placeholder="Describe your resort for search engine visitors..."
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
              />

              <p className="mt-1 text-xs text-gray-500">
                {seo.metaDescription.length}/320 characters
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                SEO Keywords
              </label>

              <textarea
                rows={3}
                value={keywordInput}
                onChange={(e) => {
                  setKeywordInput(e.target.value);
                  setSuccess("");
                }}
                placeholder="Resort in Lama, Bandarban Resort, Lama Valley Resort"
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
              />

              <p className="mt-1 text-xs text-gray-500">
                Separate keywords with commas. Google does not use the
                meta keywords tag for ranking, so focus on useful page
                content and relevant search terms.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Canonical URL
              </label>

              <input
                type="url"
                value={seo.canonicalUrl}
                onChange={(e) =>
                  handleChange("canonicalUrl", e.target.value)
                }
                placeholder="https://yourdomain.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
              />

              <p className="mt-1 text-xs text-gray-500">
                Your preferred website URL. Set this after your
                production domain is finalized.
              </p>
            </div>
          </div>
        </section>

        {/* Google Preview */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-7">
          <h2 className="mb-2 font-semibold text-[#173729]">
            Google Search Preview
          </h2>

          <p className="mb-5 text-sm text-gray-500">
            An approximate preview of your website in Google search
            results.
          </p>

          <div className="max-w-2xl rounded-lg border border-gray-200 p-5">
            <p className="mb-2 text-xs text-gray-500">
              yourdomain.com
            </p>

            <h3 className="text-xl font-medium text-[#1a0dab]">
              {previewTitle}
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {previewDescription}
            </p>
          </div>
        </section>

        {/* Local SEO */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-3 text-[#234b3b]">
              <MapPin size={21} />
            </div>

            <div>
              <h2 className="font-semibold text-[#173729]">
                Local SEO
              </h2>
              <p className="text-sm text-gray-500">
                Important local search practices for a resort in
                Bangladesh.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 font-medium text-gray-800">
                <Building2 size={18} />
                Business Information
              </div>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Keep your resort name, phone number and address
                consistent across your website, Google Business
                Profile and other business directories.
              </p>

              <p className="mt-3 text-sm font-medium text-[#234b3b]">
                Lama Valley Resort & Restaurant
              </p>
              <p className="text-sm text-gray-500">
                Lama, Bandarban, Bangladesh
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-800">
                Recommended local search topics
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "Resort in Lama",
                  "Bandarban Resort",
                  "Resort in Bandarban",
                  "Lama Valley Resort",
                  "Hill Resort in Bangladesh",
                  "Resort near Lama",
                ].map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-[#234b3b]"
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              <p className="mt-3 text-xs leading-5 text-gray-500">
                Use relevant phrases naturally in your page headings,
                descriptions, image alt text and useful travel content.
                Avoid repeating keywords unnaturally.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 font-medium text-gray-800">
                <Globe size={18} />
                Google Business Profile
              </div>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Create or claim your Google Business Profile. Add
                accurate location details, contact information, real
                resort photographs, facilities, opening information
                and customer reviews.
              </p>

              <a
                href="https://www.google.com/business/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex text-sm font-semibold text-[#234b3b] hover:underline"
              >
                Google Business Profile
              </a>
            </div>
          </div>
        </section>

        {/* Indexing */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-3 text-[#234b3b]">
              <Globe size={21} />
            </div>

            <div>
              <h2 className="font-semibold text-[#173729]">
                Search Engine Indexing
              </h2>
              <p className="text-sm text-gray-500">
                Control indexing preferences for your website.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <label className="flex cursor-pointer items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Allow search engine indexing
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Allows search engines to include your website in
                  search results.
                </p>
              </div>

              <input
                type="checkbox"
                checked={seo.robotsIndex}
                onChange={(e) =>
                  handleChange("robotsIndex", e.target.checked)
                }
                className="mt-1 h-5 w-5 accent-[#234b3b]"
              />
            </label>

            <div className="border-t border-gray-100" />

            <label className="flex cursor-pointer items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Allow search engines to follow links
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Allows search engines to follow links found on your
                  website.
                </p>
              </div>

              <input
                type="checkbox"
                checked={seo.robotsFollow}
                onChange={(e) =>
                  handleChange("robotsFollow", e.target.checked)
                }
                className="mt-1 h-5 w-5 accent-[#234b3b]"
              />
            </label>
          </div>
        </section>

        {/* Open Graph */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-3 text-[#234b3b]">
              <Share2 size={21} />
            </div>

            <div>
              <h2 className="font-semibold text-[#173729]">
                Social Media Sharing
              </h2>
              <p className="text-sm text-gray-500">
                Manage link previews for Facebook, Messenger and
                compatible platforms.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Open Graph Title
              </label>

              <input
                type="text"
                maxLength={70}
                value={seo.ogTitle}
                onChange={(e) =>
                  handleChange("ogTitle", e.target.value)
                }
                placeholder="Leave empty to use Meta Title"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Open Graph Description
              </label>

              <textarea
                rows={3}
                maxLength={320}
                value={seo.ogDescription}
                onChange={(e) =>
                  handleChange("ogDescription", e.target.value)
                }
                placeholder="Leave empty to use Meta Description"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
              />
            </div>

            <ImageUploader
              label="Open Graph Image"
              value={seo.ogImage}
              onChange={(value) => handleChange("ogImage", value)}
              alt="Social media sharing image"
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Open Graph Type
              </label>

              <select
                value={seo.ogType}
                onChange={(e) =>
                  handleChange("ogType", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#234b3b]"
              >
                <option value="website">Website</option>
                <option value="article">Article</option>
              </select>
            </div>
          </div>
        </section>

        {/* Technical SEO Information */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-7">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-3 text-[#234b3b]">
              <Code2 size={21} />
            </div>

            <div>
              <h2 className="font-semibold text-[#173729]">
                Technical SEO
              </h2>
              <p className="text-sm text-gray-500">
                Additional technical improvements for search engines.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
              <Info size={18} className="mt-0.5 shrink-0 text-[#234b3b]" />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  XML Sitemap
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Your production website should provide a sitemap at
                  /sitemap.xml so search engines can discover public
                  pages.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
              <Info size={18} className="mt-0.5 shrink-0 text-[#234b3b]" />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Google Search Console
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Verify your production domain and submit your sitemap
                  to monitor indexing, search queries and website
                  performance.
                </p>

                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex text-sm font-semibold text-[#234b3b] hover:underline"
                >
                  Open Google Search Console
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
              <Info size={18} className="mt-0.5 shrink-0 text-[#234b3b]" />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Structured Data (Schema.org)
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Add appropriate Resort or Hotel structured data,
                  business contact details, address, images and
                  available facilities to help search engines
                  understand the property.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
              <Info size={18} className="mt-0.5 shrink-0 text-[#234b3b]" />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Mobile Performance
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Optimize mobile loading speed, image sizes, Core Web
                  Vitals, accessibility and responsive layouts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save SEO Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
