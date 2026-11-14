
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  Globe,
} from "lucide-react";
import Logo from "@/components/shared/Logo";
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
  address: "Lama, Bandarban, Bangladesh",
  mapLink: "",
  shortDescription:
    "Discover the peaceful beauty of Lama, Bandarban. Enjoy a relaxing escape surrounded by the natural charm of the hills.",
  socialMedia: {},
};

const socialPlatforms = [
  { name: "Facebook", key: "facebook", label: "f" },
  { name: "Instagram", key: "instagram", label: "◎" },
  { name: "YouTube", key: "youtube", label: "▶" },
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

  const activeSocialLinks = socialPlatforms.filter(
    (platform) =>
      typeof settings.socialMedia?.[platform.key] === "string" &&
      settings.socialMedia[platform.key].trim()
  );

  return (
    <footer className="bg-[#142b21] text-white">
      {/* Main Footer */}
      <div className="container grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">

        {/* Brand Information */}
        <div>
          <Logo light />

          <p className="mt-6 max-w-xs text-sm leading-7 text-white/65">
            {settings.shortDescription}
          </p>
          <p className="mt-6 max-w-xs text-sm leading-7 text-white/65">
            {settings.shortDescription}
          </p>
         
          {/* Social Media */}
          {activeSocialLinks.length > 0 && (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {activeSocialLinks.map((platform) => (
                <a
                  key={platform.key}
                  href={settings.socialMedia[platform.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${platform.name} page`}
                  title={platform.name}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${platform.key === "youtube"
                      ? "border-red-600 bg-red-600 text-white hover:bg-red-700"
                      : "border-white/20 text-sm font-semibold text-white/75 hover:border-accent-light hover:bg-accent-light hover:text-[#142b21]"
                    }`}
                >
                  {platform.key === "youtube" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="21"
                      height="21"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
                    </svg>
                  ) : (
                    platform.label
                  )}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
          

        {/* Quick Links */}
        <div>
          <h3 className="mb-6 font-sans text-base font-semibold text-white">
            Quick Links
          </h3>

          <ul className="space-y-4">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-sm text-white/65 transition-colors hover:text-accent-light"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Explore */}
        <div>
          <h3 className="mb-6 font-sans text-base font-semibold text-white">
            Explore
          </h3>

          <ul className="space-y-4">
            {exploreLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-sm text-white/65 transition-colors hover:text-accent-light"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="mb-6 font-sans text-base font-semibold text-white">
            Contact Information
          </h3>

          <ul className="space-y-5">
            {/* Address */}
            <li className="flex items-start gap-3">
              <MapPin size={18} className="mt-1 shrink-0 text-accent-light" />

              {settings.mapLink ? (
                <a
                  href={settings.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm leading-6 text-white/65 transition hover:text-accent-light"
                >
                  {settings.address}
                </a>
              ) : (
                <span className="text-sm leading-6 text-white/65">
                  {settings.address}
                </span>
              )}
            </li>

            {/* Phone */}
            <li className="flex items-center gap-3">
              <Phone size={18} className="shrink-0 text-accent-light" />

              {settings.phone ? (
                <a
                  href={`tel:${settings.phone}`}
                  className="text-sm text-white/65 transition hover:text-accent-light"
                >
                  {settings.phone}
                </a>
              ) : (
                <span className="text-sm text-white/65">
                  Contact number coming soon
                </span>
              )}
            </li>

            {/* Email */}
            <li className="flex items-center gap-3">
              <Mail size={18} className="shrink-0 text-accent-light" />

              {settings.email ? (
                <a
                  href={`mailto:${settings.email}`}
                  className="break-all text-sm text-white/65 transition hover:text-accent-light"
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
            className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-accent-light hover:text-white"
          >
            Get in Touch
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} {settings.resortName}.
            All rights reserved.
          </p>

          <p className="text-xs text-white/50">
            Crafted with care.
          </p>
        </div>
      </div>
    </footer>
  );
}
