
import Link from "next/link";
import {
  House,
  Info,
  Contact,
  Images,
  ArrowRight,
  BookOpen,
} from "lucide-react";

const pages = [
  {
    title: "Home Page",
    description:
      "Manage the homepage content, hero section and resort introduction.",
    icon: House,
    href: "/admin/home-page",
    status: "Available",
  },
  {
    title: "About Us",
    description:
      "Manage the resort story, introduction and about section.",
    icon: BookOpen,
    href: "/admin/about-page",
    status: "Available",
  },
  {
    title: "Contact Page",
    description:
      "Manage contact information, address, map and page content.",
    icon: Contact,
    href: "/admin/contact-page",
    status: "Available",
  },
  {
    title: "Gallery",
    description:
      "Manage resort photographs displayed on the public website.",
    icon: Images,
    href: "/admin/gallery",
    status: "Available",
  },
];

export default function PagesManagementPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a805d]">
          Website Management
        </p>

        <h1 className="mt-2 font-serif text-3xl font-semibold text-[#173729]">
          Website Pages
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage the content and information displayed across your resort website.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {pages.map((page) => {
          const Icon = page.icon;
          const available = Boolean(page.href);

          const content = (
            <div className="flex h-full flex-col rounded-xl border border-[#e8e4da] bg-white p-6 transition hover:border-[#426b55] hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf2ed] text-[#234b3b]">
                  <Icon size={23} strokeWidth={1.7} />
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                    available
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {page.status}
                </span>
              </div>

              <h2 className="mt-5 text-lg font-semibold text-[#173729]">
                {page.title}
              </h2>

              <p className="mt-2 flex-1 text-sm leading-6 text-gray-500">
                {page.description}
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#426b55]">
                {available ? "Manage Page" : "Not Available Yet"}
                {available && <ArrowRight size={16} />}
              </div>
            </div>
          );

          return available ? (
            <Link key={page.title} href={page.href}>
              {content}
            </Link>
          ) : (
            <div key={page.title}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
