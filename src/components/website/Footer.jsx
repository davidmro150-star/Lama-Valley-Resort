
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
} from "lucide-react";

import Logo from "@/components/common/Logo";
import connectDB from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Stays", href: "/stays" },
  { name: "Restaurant", href: "/restaurant" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

const exploreLinks = [
  { name: "Accommodation", href: "/stays" },
  { name: "Dining", href: "/restaurant" },
  { name: "Packages", href: "/packages" },
  { name: "Book Your Stay", href: "/stays" },
];

const defaultSettings = {
  resortName: "Lama Valley Resort & Restaurant",
  phone: "",
  email: "",
  address: "",
  mapLink: "",
  shortDescription:
    "Experience the beauty of nature and peaceful mountain living at Lama Valley Resort.",
  socialMedia: {
    facebook: "",
    instagram: "",
    youtube: "",
    tiktok: "",
    linkedin: "",
  },
};

const socialPlatforms = [
  { name: "Facebook", key: "facebook", label: "f" },
  { name: "Instagram", key: "instagram", label: "ig" },
  { name: "TikTok", key: "tiktok", label: "♪" },
  { name: "LinkedIn", key: "linkedin", label: "in" },
];

async function getSiteSettings() {
  try {
    await connectDB();

    const settings = await SiteSettings.findOne().lean();

    return {
      ...defaultSettings,
      ...(settings || {}),
      socialMedia: {
        ...defaultSettings.socialMedia,
        ...(settings?.socialMedia || {}),
      },
    };
  } catch (error) {
    console.error("Footer settings error:", error);
    return defaultSettings;
  }
}

export default async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="bg-[#173729] text-white">
      <div className="container grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:grid-cols-3 sm:gap-8 sm:py-16 lg:grid-cols-4 lg:gap-10">

        {/* Brand */}
        <div className="col-span-2 text-center sm:col-span-3 lg:col-span-1 lg:text-left">
          <div className="flex justify-center lg:justify-start">
            <Logo light />
          </div>

          <p className="mx-auto mt-6 max-w-xs text-sm leading-7 text-white/65 lg:mx-0">
            {settings.shortDescription}
          </p>

          {/* Social Media */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            {socialPlatforms.map((platform) => {
              const url = settings.socialMedia?.[platform.key];

              if (!url) return null;

              return (
                <a
                  key={platform.key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={platform.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-xs font-semibold text-white/75 transition hover:border-[#c49a62] hover:bg-[#c49a62] hover:text-white"
                >
                  {platform.label}
                </a>
              );
            })}

            {settings.socialMedia?.youtube && (
              <a
                href={settings.socialMedia.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/75 transition hover:border-[#c49a62] hover:bg-[#c49a62] hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-6 font-serif text-lg font-semibold">
            Quick Links
          </h3>

          <ul className="space-y-3">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-sm text-white/65 transition hover:text-[#c49a62]"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Explore */}
        <div>
          <h3 className="mb-6 font-serif text-lg font-semibold">
            Explore
          </h3>

          <ul className="space-y-3">
            {exploreLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-sm text-white/65 transition hover:text-[#c49a62]"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Information */}
        <div className="col-span-2 sm:col-span-1">
          <h3 className="mb-6 font-serif text-lg font-semibold">
            Contact Information
          </h3>

          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <MapPin
                size={18}
                className="mt-1 shrink-0 text-[#c49a62]"
              />

              {settings.mapLink ? (
                <a
                  href={settings.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm leading-6 text-white/65 transition hover:text-[#c49a62]"
                >
                  {settings.address || "Visit Our Location"}
                </a>
              ) : (
                <span className="text-sm leading-6 text-white/65">
                  {settings.address || "Location details coming soon"}
                </span>
              )}
            </li>

            <li className="flex items-start gap-3">
              <Phone
                size={17}
                className="mt-1 shrink-0 text-[#c49a62]"
              />

              {settings.phone ? (
                <a
                  href={`tel:${settings.phone}`}
                  className="text-sm text-white/65 transition hover:text-[#c49a62]"
                >
                  {settings.phone}
                </a>
              ) : (
                <span className="text-sm text-white/65">
                  Phone number coming soon
                </span>
              )}
            </li>

            <li className="flex items-start gap-3">
              <Mail
                size={17}
                className="mt-1 shrink-0 text-[#c49a62]"
              />

              {settings.email ? (
                <a
                  href={`mailto:${settings.email}`}
                  className="break-all text-sm text-white/65 transition hover:text-[#c49a62]"
                >
                  {settings.email}
                </a>
              ) : (
                <span className="text-sm text-white/65">
                  Email coming soon
                </span>
              )}
            </li>
          </ul>

          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#c49a62] transition hover:text-white"
          >
            Get in Touch
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} {settings.resortName}. All rights reserved.
          </p>

          <p className="text-xs text-white/50">
            Crafted with care.
          </p>
        </div>
      </div>
    </footer>
  );
}
