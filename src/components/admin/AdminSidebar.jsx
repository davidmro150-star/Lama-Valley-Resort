
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  House,
  UtensilsCrossed,
  Package,
  Images,
  FileText,
  MessageSquare,
  Settings,
  ChevronLeft,
  Mountain,
} from "lucide-react";

const navigation = [
  {
    title: "OVERVIEW",
    items: [
      {
        name: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        available: true,
      },
    ],
  },
  {
    title: "RESORT MANAGEMENT",
    items: [
      {
        name: "Bookings",
        href: "/admin/bookings",
        icon: CalendarDays,
        available: true,
      },
      {
        name: "Cottages",
        href: "/admin/rooms",
        icon: House,
        available: true,
      },
      {
        name: "Restaurant",
        href: "/admin/restaurant",
        icon: UtensilsCrossed,
        available: true,
      },
      {
        name: "Packages",
        href: "/admin/packages",
        icon: Package,
        available: true,
      },
    ],
  },
  {
    title: "WEBSITE CONTENT",
    items: [
      {
        name: "Gallery",
        href: "/admin/gallery",
        icon: Images,
        available: true,
      },
      {
        name: "Pages",
        href: "/admin/pages",
        icon: FileText,
        available: true,
      },
      {
        name: "About Page",
        href: "/admin/about-page",
        icon: FileText,
        available: true,
      },
      {
        name: "Contact Page",
        href: "/admin/contact-page",
        icon: FileText,
        available: true,
      },
      {
        name: "Messages",
        href: "/admin/messages",
        icon: MessageSquare,
        available: true,
      },
    ],
  },
  {
    title: "PREFERENCES",
    items: [
      {
        name: "Settings",
        href: "/admin/settings",
        icon: Settings,
        available: true,
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-[260px] shrink-0 flex-col bg-[#173729] text-white">
      {/* Brand */}
      <div className="flex h-[82px] items-center justify-between border-b border-white/10 px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#e2c18e]">
            <Mountain size={22} />
          </div>

          <div>
            <h1 className="font-serif text-[17px] font-semibold tracking-wide">
              LAMA VALLEY
            </h1>
            <p className="mt-0.5 text-[9px] tracking-[0.22em] text-white/55">
              RESORT ADMIN
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-7">
        {navigation.map((group) => (
          <div key={group.title}>
            <p className="mb-3 px-3 text-[10px] font-semibold tracking-[0.18em] text-white/40">
              {group.title}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <div key={item.name}>
                    {item.available ? (
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] font-medium transition ${isActive
                            ? "bg-[#426b55] text-white shadow-sm"
                            : "text-white/65 hover:bg-white/8 hover:text-white"
                          }`}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                        <span>{item.name}</span>

                        {isActive && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#e2c18e]" />
                        )}
                      </Link>
                    ) : (
                      <div
                        title="This section will be available soon"
                        className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-3 text-[13px] font-medium text-white/35"
                      >
                        <Icon size={18} strokeWidth={1.8} />
                        <span>{item.name}</span>
                        <span className="ml-auto text-[9px] text-white/30">
                          SOON
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t border-white/10 p-5">
        <Link
          href="/"
          className="flex items-center justify-between rounded-lg px-3 py-2.5 text-xs text-white/55 transition hover:bg-white/8 hover:text-white"
        >
          <span>Visit public website</span>
          <ChevronLeft size={15} />
        </Link>

        <p className="mt-4 px-3 text-[10px] text-white/30">
          © {new Date().getFullYear()} Lama Valley Resort
        </p>
      </div>
    </aside>
  );
}
