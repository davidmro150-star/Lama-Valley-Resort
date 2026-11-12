
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";
import Logo from "@/components/shared/Logo";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Stays", href: "/stays" },
  { name: "Restaurant", href: "/restaurant" },
  { name: "Packages", href: "/packages" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
  { name: "Booking Status", href: "/booking-status" },
];

export default function Navbar({ logoUrl = "", logoAlt = "" }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="container flex min-h-[84px] items-center justify-between">
        <Logo logoUrl={logoUrl} logoAlt={logoAlt} />

        {/* Desktop Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-6 lg:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-foreground transition-colors hover:text-accent"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Booking Button */}
        <Link
          href="/booking"
          className="btn btn-primary hidden lg:inline-flex"
        >
          Book Your Stay
          <ArrowUpRight size={16} />
        </Link>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen((previous) => !previous)}
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-primary lg:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-border bg-background px-5 py-5 lg:hidden"
        >
          <div className="container flex flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-medium text-foreground hover:bg-surface-muted"
              >
                {item.name}
              </Link>
            ))}

            <Link
              href="/booking"
              onClick={() => setMenuOpen(false)}
              className="btn btn-primary mt-3 w-full"
            >
              Book Your Stay
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
