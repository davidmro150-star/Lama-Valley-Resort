import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
} from "lucide-react";
import Logo from "@/components/shared/Logo";

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
  { name: "Book Your Stay", href: "/booking" },
];

export default function Footer() {
  return (
    <footer className="bg-[#142b21] text-white">

      {/* Main Footer */}
      <div className="container grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">

        {/* Brand Information */}
        <div>
          <Logo light />

          <p className="mt-6 max-w-xs text-sm leading-7 text-white/65">
            Discover the peaceful beauty of Lama, Bandarban.
            Enjoy a relaxing escape surrounded by the natural
            charm of the hills.
          </p>
        </div>

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
            <li className="flex items-start gap-3">
              <MapPin size={18} className="mt-1 shrink-0 text-accent-light" />
              <span className="text-sm leading-6 text-white/65">
                Lama, Bandarban, Bangladesh
              </span>
            </li>

            <li className="flex items-center gap-3">
              <Phone size={18} className="shrink-0 text-accent-light" />
              <span className="text-sm text-white/65">
                Contact number coming soon
              </span>
            </li>

            <li className="flex items-center gap-3">
              <Mail size={18} className="shrink-0 text-accent-light" />
              <span className="text-sm text-white/65">
                Email coming soon
              </span>
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
            © {new Date().getFullYear()} Lama Valley Resort & Restaurant.
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