
"use client";

import { useEffect, useState } from "react";
import {
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
} from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/admin/ImageUploader";

const defaultContent = {
  heroEyebrow: "Our Story & Our Place",
  heroTitle: "Discover Lama Valley",
  heroDescription:
    "A resort and restaurant destination in Lama, Bandarban, surrounded by the distinctive landscapes of the Chittagong Hill Tracts.",
  heroLocation: "Lama, Bandarban, Bangladesh",
  heroImage: "",
  heroImageAlt: "Mirinja Valley landscape in Lama, Bandarban",

  introEyebrow: "Welcome to Lama Valley",
  introTitle: "A Destination Inspired by the Beauty of the Hills",
  introImage: "",
  introImageAlt: "Lama Valley Resort surrounded by natural scenery",
  introParagraphs: [
    "Lama Valley Resort & Restaurant is a destination in Lama, Bandarban, created around the idea of enjoying a change of pace in a beautiful hill region of Bangladesh.",
    "The surrounding landscape gives this part of Bandarban its distinctive character. Green hills, changing skies and the natural scenery of the region make Lama an appealing place for visitors looking to explore southeastern Bangladesh.",
    "Through its accommodation and restaurant, Lama Valley brings together two important parts of a getaway: a place to stay and a place to enjoy food during your visit.",
  ],
  highlights: [
    "Located in Lama, Bandarban, Bangladesh",
    "Part of the beautiful Chittagong Hill Tracts region",
    "A destination for accommodation and dining",
  ],

  locationEyebrow: "Our Location",
  locationTitle: "The Natural Beauty of Lama, Bandarban",
  locationDescription:
    "Discover the landscape and character of one of Bangladesh's beautiful hill regions.",
  locationImage: "",
  locationImageAlt: "Misty hills and landscape of Mirinja Valley, Lama",
  locationHeading: "Explore the Charm of the Hill Tracts",
  locationParagraphs: [
    "Lama is part of Bandarban district in southeastern Bangladesh, a region known for its hills, valleys and distinctive natural landscapes.",
    "One notable destination in the Lama area is Mirinja Tourist Spot, recognised for its elevated viewpoint and surrounding hill scenery. It is part of the wider landscape that makes this region special.",
  ],
  locationButtonText: "Find Our Location",
  locationButtonLink: "/contact",

  experiencesEyebrow: "What We Offer",
  experiencesTitle: "Discover the Lama Valley Experience",
  experiencesDescription:
    "Explore the different parts of your visit, from accommodation to dining.",
  experiences: [
    {
      title: "Accommodation",
      description:
        "Explore the accommodation options available at Lama Valley and find a place for your visit.",
      href: "/stays",
      link: "Explore stays",
      icon: "bed",
    },
    {
      title: "Food & Dining",
      description:
        "Discover the restaurant experience and dining options available during your visit.",
      href: "/restaurant",
      link: "Explore dining",
      icon: "utensils",
    },
    {
      title: "Natural Surroundings",
      description:
        "Experience the distinctive hill landscapes and scenic character of the Lama region.",
      href: "/gallery",
      link: "View gallery",
      icon: "mountain",
    },
  ],

  ctaEyebrow: "Your Next Getaway",
  ctaTitle: "Experience Lama Valley for Yourself",
  ctaDescription:
    "Explore our accommodation and dining options and get in touch to plan your visit to Lama, Bandarban.",
  ctaPrimaryText: "Book Your Stay",
  ctaPrimaryLink: "/booking",
  ctaSecondaryText: "Contact Us",
  ctaSecondaryLink: "/contact",
};

function InputField({ label, value, onChange, placeholder = "" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <textarea
        rows={rows}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#426b55] focus:ring-2 focus:ring-[#426b55]/10"
      />
    </div>
  );
}

function SectionHeading({ title, description }) {
  return (
    <div className="border-b border-gray-100 pb-4">
      <h2 className="text-lg font-semibold text-[#173729]">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}

function normalizeContent(data = {}) {
  return {
    ...defaultContent,
    ...data,

    introParagraphs: Array.isArray(data.introParagraphs)
      ? data.introParagraphs
      : defaultContent.introParagraphs,

    highlights: Array.isArray(data.highlights)
      ? data.highlights
      : defaultContent.highlights,

    locationParagraphs: Array.isArray(data.locationParagraphs)
      ? data.locationParagraphs
      : defaultContent.locationParagraphs,

    experiences:
      Array.isArray(data.experiences) && data.experiences.length > 0
        ? data.experiences
        : defaultContent.experiences,
  };
}

export default function AboutPageEditor() {
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    async function fetchAboutPage() {
      try {
        const response = await fetch("/api/admin/about-page", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.aboutPage) {
          throw new Error(
            data.message || "Failed to load About Page."
          );
        }

        setContent(normalizeContent(data.aboutPage));
      } catch (error) {
        setMessage(error.message);
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    }

    fetchAboutPage();
  }, []);

  function updateField(field, value) {
    setContent((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateExperience(index, field, value) {
    setContent((previous) => ({
      ...previous,
      experiences: previous.experiences.map((item, i) =>
        i === index
          ? { ...item, [field]: value }
          : item
      ),
    }));
  }

  function addExperience() {
    setContent((previous) => ({
      ...previous,
      experiences: [
        ...previous.experiences,
        {
          title: "",
          description: "",
          href: "",
          link: "",
          icon: "mountain",
        },
      ],
    }));
  }

  function removeExperience(index) {
    setContent((previous) => ({
      ...previous,
      experiences: previous.experiences.filter(
        (_, i) => i !== index
      ),
    }));
  }

  async function saveChanges() {
    if (saving) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/about-page", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(content),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.aboutPage) {
        throw new Error(
          data.message || "Failed to save About Page."
        );
      }

      setContent(normalizeContent(data.aboutPage));
      setMessage("About Page updated successfully!");
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
      <div className="flex min-h-[300px] items-center justify-center">
        <RefreshCw
          className="animate-spin text-[#426b55]"
          size={28}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a805d]">
            Website Management
          </p>

          <h1 className="mt-2 font-serif text-3xl font-semibold text-[#173729]">
            About Page Editor
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage the content displayed on your public About Us page.
          </p>
        </div>

        <Link
          href="/about"
          target="_blank"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <Eye size={17} />
          View Public Page
        </Link>
      </div>

      {/* STATUS MESSAGE */}
      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            messageType === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="space-y-6 rounded-xl border border-[#e8e4da] bg-white p-6">
        <SectionHeading
          title="1. Hero Section"
          description="The main banner displayed at the top of the About Us page."
        />

        <InputField
          label="Eyebrow Text"
          value={content.heroEyebrow}
          onChange={(v) => updateField("heroEyebrow", v)}
        />

        <InputField
          label="Hero Heading"
          value={content.heroTitle}
          onChange={(v) => updateField("heroTitle", v)}
        />

        <TextAreaField
          label="Hero Description"
          value={content.heroDescription}
          onChange={(v) => updateField("heroDescription", v)}
        />

        <InputField
          label="Location"
          value={content.heroLocation}
          onChange={(v) => updateField("heroLocation", v)}
        />

        <ImageUploader
          label="Hero Image"
          value={content.heroImage}
          onChange={(v) => updateField("heroImage", v)}
          alt={content.heroImageAlt}
        />

        <InputField
          label="Hero Image Alt Text"
          value={content.heroImageAlt}
          onChange={(v) => updateField("heroImageAlt", v)}
        />
      </section>

      {/* 2. INTRODUCTION SECTION */}
      <section className="space-y-6 rounded-xl border border-[#e8e4da] bg-white p-6">
        <SectionHeading
          title="2. Introduction / Our Story"
          description="Edit the introduction, paragraphs and highlights."
        />

        <InputField
          label="Eyebrow Text"
          value={content.introEyebrow}
          onChange={(v) => updateField("introEyebrow", v)}
        />

        <InputField
          label="Section Heading"
          value={content.introTitle}
          onChange={(v) => updateField("introTitle", v)}
        />

        <ImageUploader
          label="Introduction Image"
          value={content.introImage}
          onChange={(v) => updateField("introImage", v)}
          alt={content.introImageAlt}
        />

        <InputField
          label="Image Alt Text"
          value={content.introImageAlt}
          onChange={(v) => updateField("introImageAlt", v)}
        />

        <TextAreaField
          label="Introduction Paragraphs (one paragraph per line)"
          rows={8}
          value={(content.introParagraphs || []).join("\n")}
          onChange={(v) =>
            updateField(
              "introParagraphs",
              v.split("\n").filter((item) => item.trim())
            )
          }
        />

        <TextAreaField
          label="Highlights (one item per line)"
          rows={4}
          value={(content.highlights || []).join("\n")}
          onChange={(v) =>
            updateField(
              "highlights",
              v.split("\n").filter((item) => item.trim())
            )
          }
        />
      </section>

      {/* 3. LOCATION SECTION */}
      <section className="space-y-6 rounded-xl border border-[#e8e4da] bg-white p-6">
        <SectionHeading
          title="3. Location & Surroundings"
          description="Manage the location information and its image."
        />

        <InputField
          label="Eyebrow Text"
          value={content.locationEyebrow}
          onChange={(v) => updateField("locationEyebrow", v)}
        />

        <InputField
          label="Section Heading"
          value={content.locationTitle}
          onChange={(v) => updateField("locationTitle", v)}
        />

        <TextAreaField
          label="Section Description"
          value={content.locationDescription}
          onChange={(v) => updateField("locationDescription", v)}
        />

        <ImageUploader
          label="Location Image"
          value={content.locationImage}
          onChange={(v) => updateField("locationImage", v)}
          alt={content.locationImageAlt}
        />

        <InputField
          label="Image Alt Text"
          value={content.locationImageAlt}
          onChange={(v) => updateField("locationImageAlt", v)}
        />

        <InputField
          label="Content Heading"
          value={content.locationHeading}
          onChange={(v) => updateField("locationHeading", v)}
        />

        <TextAreaField
          label="Location Paragraphs (one paragraph per line)"
          rows={6}
          value={(content.locationParagraphs || []).join("\n")}
          onChange={(v) =>
            updateField(
              "locationParagraphs",
              v.split("\n").filter((item) => item.trim())
            )
          }
        />

        <InputField
          label="Button Text"
          value={content.locationButtonText}
          onChange={(v) => updateField("locationButtonText", v)}
        />

        <InputField
          label="Button Link"
          value={content.locationButtonLink}
          onChange={(v) => updateField("locationButtonLink", v)}
        />
      </section>

      {/* 4. EXPERIENCES SECTION */}
      <section className="space-y-6 rounded-xl border border-[#e8e4da] bg-white p-6">
        <SectionHeading
          title="4. Resort Experiences"
          description="Manage the accommodation, dining and surroundings cards."
        />

        <InputField
          label="Eyebrow Text"
          value={content.experiencesEyebrow}
          onChange={(v) => updateField("experiencesEyebrow", v)}
        />

        <InputField
          label="Section Heading"
          value={content.experiencesTitle}
          onChange={(v) => updateField("experiencesTitle", v)}
        />

        <TextAreaField
          label="Section Description"
          value={content.experiencesDescription}
          onChange={(v) => updateField("experiencesDescription", v)}
        />

        {content.experiences?.map((item, index) => (
          <div
            key={item._id || index}
            className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#173729]">
                Experience {index + 1}
              </h3>

              <button
                type="button"
                onClick={() => removeExperience(index)}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
              >
                <Trash2 size={15} />
                Remove
              </button>
            </div>

            <InputField
              label="Title"
              value={item.title}
              onChange={(v) =>
                updateExperience(index, "title", v)
              }
            />

            <TextAreaField
              label="Description"
              value={item.description}
              onChange={(v) =>
                updateExperience(index, "description", v)
              }
            />

            <InputField
              label="Button Text"
              value={item.link}
              onChange={(v) =>
                updateExperience(index, "link", v)
              }
            />

            <InputField
              label="Button Link"
              value={item.href}
              onChange={(v) =>
                updateExperience(index, "href", v)
              }
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Icon
              </label>

              <select
                value={item.icon || "mountain"}
                onChange={(e) =>
                  updateExperience(
                    index,
                    "icon",
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
              >
                <option value="bed">Accommodation</option>
                <option value="utensils">Food & Dining</option>
                <option value="mountain">Mountain</option>
              </select>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addExperience}
          className="inline-flex items-center gap-2 rounded-lg border border-[#426b55] px-4 py-3 text-sm font-semibold text-[#426b55] hover:bg-[#edf2ed]"
        >
          <Plus size={17} />
          Add Experience
        </button>
      </section>

      {/* 5. CLOSING CTA */}
      <section className="space-y-6 rounded-xl border border-[#e8e4da] bg-white p-6">
        <SectionHeading
          title="5. Closing Call to Action"
          description="Manage the final section of the About Us page."
        />

        <InputField
          label="Eyebrow Text"
          value={content.ctaEyebrow}
          onChange={(v) => updateField("ctaEyebrow", v)}
        />

        <InputField
          label="Heading"
          value={content.ctaTitle}
          onChange={(v) => updateField("ctaTitle", v)}
        />

        <TextAreaField
          label="Description"
          value={content.ctaDescription}
          onChange={(v) => updateField("ctaDescription", v)}
        />

        <InputField
          label="Primary Button Text"
          value={content.ctaPrimaryText}
          onChange={(v) => updateField("ctaPrimaryText", v)}
        />

        <InputField
          label="Primary Button Link"
          value={content.ctaPrimaryLink}
          onChange={(v) => updateField("ctaPrimaryLink", v)}
        />

        <InputField
          label="Secondary Button Text"
          value={content.ctaSecondaryText}
          onChange={(v) => updateField("ctaSecondaryText", v)}
        />

        <InputField
          label="Secondary Button Link"
          value={content.ctaSecondaryLink}
          onChange={(v) => updateField("ctaSecondaryLink", v)}
        />
      </section>

      {/* SAVE BUTTON */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-[#e8e4da] bg-white p-5 sm:flex-row sm:items-center">
        <p className="text-sm text-gray-500">
          Save your changes to update the About Page content in the database.
        </p>

        <button
          type="button"
          onClick={saveChanges}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <RefreshCw size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}

          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
