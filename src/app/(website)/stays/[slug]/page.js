
import CottageGallery from "@/components/website/CottageGallery";
import CottageBookingPanel from "@/components/website/CottageBookingPanel";
import Link from "next/link";
import { notFound } from "next/navigation";
import CottageBookingWrapper from "@/components/website/CottageBookingWrapper";
import {
  ArrowLeft,
  ArrowUpRight,
  Users,
  Maximize,
  BedDouble,
  Bath,
  Check,
  Clock,
  ShieldCheck,
  Sparkles,
  Home,
} from "lucide-react";
import { cottages } from "@/data/cottages";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cottage = cottages.find((item) => item.slug === slug);

  if (!cottage) {
    return { title: "Cottage Not Found" };
  }

  return {
    title: `${cottage.name} | Lama Valley Resort`,
    description: cottage.description,
  };
}

export default async function CottageDetailsPage({ params }) {
  const { slug } = await params;
  const cottage = cottages.find((item) => item.slug === slug);

  if (!cottage) notFound();

  const relatedCottages = cottages
    .filter((item) => item.slug !== cottage.slug)
    .slice(0, 3);

  const specifications = [
    {
      icon: Users,
      value: cottage.occupancy?.maxGuests || cottage.capacity,
      label: "Maximum Guests",
    },
    {
      icon: Maximize,
      value: `${cottage.size} sq. ft.`,
      label: "Cottage Size",
    },
    {
      icon: BedDouble,
      value: cottage.bedrooms,
      label: "Bedrooms",
    },
    {
      icon: Bath,
      value: cottage.bathrooms,
      label: "Bathrooms",
    },
  ];

  const facilities = cottage.facilities || [];
  const highlights = cottage.highlights || [];
  const includedServices = cottage.includedServices || [];

  const policies = [
    {
      label: "Child Policy",
      value: cottage.policies?.childPolicy,
    },
    {
      label: "Booking Policy",
      value: cottage.policies?.bookingPolicy,
    },
    {
      label: "Cancellation Policy",
      value: cottage.policies?.cancellationPolicy,
    },
  ].filter((policy) => policy.value);

  return (
    <main className="bg-background">
      {/* Breadcrumb and Hero */}
      <section className="relative overflow-hidden bg-primary-dark text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary-dark/95 to-primary/70" />

        <div className="container relative z-10 py-16 sm:py-20 lg:py-24">
          <Link
            href="/stays"
            className="mb-10 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-accent-light"
          >
            <ArrowLeft size={16} />
            All Cottages
          </Link>

          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent-light">
              <span className="h-px w-8 bg-accent-light" />
              {cottage.accommodationType || "Cottage Accommodation"}
            </div>

            <h1 className="mb-5 font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
              {cottage.name}
            </h1>

            <p className="max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
              {cottage.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-white/75">
              <span className="inline-flex items-center gap-2">
                <Users size={17} className="text-accent-light" />
                Up to {cottage.occupancy?.maxGuests || cottage.capacity} guests
              </span>

              <span className="h-1 w-1 rounded-full bg-accent-light" />

              <span className="inline-flex items-center gap-2">
                <BedDouble size={17} className="text-accent-light" />
                {cottage.bedrooms} bedroom
                {cottage.bedrooms > 1 ? "s" : ""}
              </span>

              <span className="h-1 w-1 rounded-full bg-accent-light" />

              <span className="inline-flex items-center gap-2">
                <Bath size={17} className="text-accent-light" />
                {cottage.bathrooms} bathroom
                {cottage.bathrooms > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="container py-10 sm:py-14">
        <CottageGallery
          images={cottage.images || []}
          cottageName={cottage.name}
        />
      </section>

      {/* Main Cottage Information */}
      <section className="section-padding pt-4">
        <div className="container">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
            {/* Left Content */}
            <div className="min-w-0">
              {/* About */}
              <div className="mb-12">
                <p className="section-eyebrow">Discover Your Stay</p>

                <h2 className="section-title mb-5">
                  About This Cottage
                </h2>

                <p className="max-w-3xl text-base leading-8 text-muted">
                  {cottage.description}
                </p>

                <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
                  Enjoy a comfortable stay at Lama Valley Resort, surrounded
                  by the natural beauty of the hills. Explore the cottage
                  facilities and choose your preferred dates to plan your stay.
                </p>
              </div>

              {/* Specifications */}
              <div className="mb-12">
                <p className="section-eyebrow">At a Glance</p>

                <h2 className="mb-6 font-display text-2xl text-primary-dark sm:text-3xl">
                  Accommodation Overview
                </h2>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                  {specifications.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-xl border border-border bg-surface p-4 sm:p-5"
                      >
                        <Icon
                          size={23}
                          className="mb-4 text-primary"
                          strokeWidth={1.7}
                        />

                        <p className="text-xl font-semibold text-primary-dark">
                          {item.value}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-muted">
                          {item.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Highlights */}
              {highlights.length > 0 && (
                <div className="mb-12">
                  <p className="section-eyebrow">Cottage Experience</p>

                  <h2 className="mb-6 font-display text-2xl text-primary-dark sm:text-3xl">
                    Cottage Highlights
                  </h2>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className="flex items-start gap-3 rounded-xl bg-surface-muted p-4"
                      >
                        <Sparkles
                          size={19}
                          className="mt-0.5 shrink-0 text-accent"
                        />
                        <p className="text-sm leading-6 text-foreground">
                          {highlight}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Facilities */}
              <div className="mb-12">
                <p className="section-eyebrow">Your Comfort Matters</p>

                <h2 className="mb-6 font-display text-2xl text-primary-dark sm:text-3xl">
                  Cottage Facilities
                </h2>

                {facilities.length > 0 ? (
                  <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                    {facilities.map((facility) => (
                      <div
                        key={facility}
                        className="flex items-center gap-3 text-sm text-muted"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-primary">
                          <Check size={16} />
                        </span>

                        {facility}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">
                    Facility information will be updated soon.
                  </p>
                )}
              </div>

              {/* Included Services */}
              {includedServices.length > 0 && (
                <div className="mb-12">
                  <p className="section-eyebrow">Included With Your Stay</p>

                  <h2 className="mb-6 font-display text-2xl text-primary-dark sm:text-3xl">
                    Included Services
                  </h2>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {includedServices.map((service) => (
                      <div
                        key={service}
                        className="flex items-center gap-3 text-sm text-muted"
                      >
                        <Check size={17} className="shrink-0 text-primary" />
                        {service}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Check-in / Check-out */}
              <div className="mb-12 rounded-xl border border-border bg-surface p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <Clock size={22} className="text-primary" />

                  <h2 className="font-display text-2xl text-primary-dark">
                    Check-in & Check-out
                  </h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wider text-muted">
                      Check-in
                    </p>

                    <p className="text-lg font-semibold text-primary-dark">
                      {cottage.schedule?.checkInTime || "To be confirmed"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wider text-muted">
                      Check-out
                    </p>

                    <p className="text-lg font-semibold text-primary-dark">
                      {cottage.schedule?.checkOutTime || "To be confirmed"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Policies */}
              {policies.length > 0 && (
                <div className="mb-12">
                  <div className="mb-6 flex items-center gap-3">
                    <ShieldCheck size={22} className="text-primary" />

                    <h2 className="font-display text-2xl text-primary-dark">
                      Booking Policies
                    </h2>
                  </div>

                  <div className="space-y-5">
                    {policies.map((policy) => (
                      <div key={policy.label}>
                        <h3 className="mb-2 text-sm font-semibold text-primary-dark">
                          {policy.label}
                        </h3>

                        <p className="text-sm leading-7 text-muted">
                          {policy.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Panel */}
            <div>
              <CottageBookingWrapper cottage={cottage} />
            </div>
          </div>
        </div>
      </section>

      {/* Other Cottages */}
      <section className="section-padding bg-surface-muted">
        <div className="container">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-eyebrow">Explore More</p>

              <h2 className="section-title">
                Other Cottages to Discover
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
                Explore more accommodation options at Lama Valley Resort.
              </p>
            </div>

            <Link
              href="/stays"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-accent"
            >
              View All Cottages
              <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {relatedCottages.map((item) => (
              <Link
                key={item.id}
                href={`/stays/${item.slug}`}
                className="group overflow-hidden rounded-xl border border-border bg-surface transition duration-300 hover:-translate-y-1 hover:shadow-soft"
              >
                <div className="relative aspect-[16/10] bg-surface-muted">
                  {item.images?.[0] && (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: `url("${item.images[0]}")`,
                      }}
                    />
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-display text-xl text-primary-dark transition group-hover:text-primary">
                    {item.name}
                  </h3>

                  <p className="mt-2 text-sm text-muted">
                    Up to {item.capacity} guests
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <p className="text-sm text-muted">
                      From{" "}
                      <span className="font-semibold text-primary-dark">
                        ৳{item.price.toLocaleString("en-BD")}
                      </span>
                      /night
                    </p>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-primary transition group-hover:bg-primary group-hover:text-white">
                      <ArrowUpRight size={17} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
  