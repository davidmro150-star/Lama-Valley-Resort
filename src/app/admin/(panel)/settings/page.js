
import {
  Building2,
  Palette,
  Share2,
  Search,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const settingsSections = [
  {
    title: "General Information",
    description:
      "Manage resort name, contact number, email address and location.",
    icon: Building2,
    status: "Coming Soon",
  },
  {
    title: "Branding & Appearance",
    description:
      "Manage your resort logo, website identity and visual appearance.",
    icon: Palette,
    status: "Coming Soon",
  },
  {
    title: "Social Media",
    description:
      "Add and update Facebook, Instagram and other social media links.",
    icon: Share2,
    status: "Coming Soon",
  },
  {
    title: "SEO Settings",
    description:
      "Configure default website titles, descriptions and search engine information.",
    icon: Search,
    status: "Coming Soon",
  },
  {
    title: "Booking Configuration",
    description:
      "Manage booking policies, cancellation rules and general reservation settings.",
    icon: CalendarDays,
    status: "Coming Soon",
  },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a805d]">
          System Configuration
        </p>

        <h1 className="mt-2 font-serif text-3xl font-semibold text-[#173729]">
          Settings
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage your resort information and configure your website settings.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {settingsSections.map((section) => {
          const Icon = section.icon;

          return (
            <div
              key={section.title}
              className="rounded-xl border border-[#e8e4da] bg-white p-6 transition hover:border-[#426b55] hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf2ed] text-[#234b3b]">
                  <Icon size={23} strokeWidth={1.7} />
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold text-gray-500">
                  {section.status}
                </span>
              </div>

              <h2 className="mt-5 text-lg font-semibold text-[#173729]">
                {section.title}
              </h2>

              <p className="mt-2 min-h-12 text-sm leading-6 text-gray-500">
                {section.description}
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-gray-400">
                Configure Settings
                <ArrowRight size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
