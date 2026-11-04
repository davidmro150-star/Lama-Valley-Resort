
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Users,
  Maximize,
  BedDouble,
  Bath,
} from "lucide-react";

import { cottages } from "@/data/cottages";

export const metadata = {
  title: "Cottages & Accommodation",
  description:
    "Explore cottage accommodation at Lama Valley Resort & Restaurant, Lama, Bandarban.",
};

export default function StaysPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative flex min-h-[420px] items-center bg-primary-dark">
        <Image
          src="https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8"
          alt="Wooden cottage accommodation"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="container relative z-10 py-24 text-center">
          <p className="section-eyebrow !text-accent-light">
            Stay With Us
          </p>

          <h1 className="mb-5 font-display text-5xl text-white sm:text-6xl">
            Our Cottages
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-8 text-white/80">
            Discover comfortable cottage accommodation
            and find a place for your next getaway in Lama,
            Bandarban.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-background py-20">
        <div className="container text-center">
          <p className="section-eyebrow">Accommodation</p>

          <h2 className="section-title !text-[35px]">
            Find Your Perfect Cottage
          </h2>

          <p className="section-description mx-auto max-w-2xl">
            Explore our cottage collection. Each accommodation
            option has its own name, layout, capacity and
            available facilities.
          </p>
        </div>
      </section>

      {/* Cottage Collection */}
      <section className="bg-surface-muted pb-24">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {cottages.map((cottage) => (
              <article
                key={cottage.id}
                className="overflow-hidden rounded-xl border border-border bg-surface transition-shadow duration-300 hover:shadow-soft"
              >
                {/* Main Image */}
                <div className="group relative aspect-[4/3]">
                  <Image
                    src={cottage.images[0]}
                    alt={cottage.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {cottage.featured && (
                    <span className="absolute left-4 top-4 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-primary-dark">
                      Featured Cottage
                    </span>
                  )}
                </div>

                {/* Cottage Information */}
                <div className="p-4">
                  <h3 className="mb-3 font-display text-2xl text-primary-dark">
                    {cottage.name}
                  </h3>

                  <p className="mb-6 text-sm leading-7 text-muted">
                    {cottage.description}
                  </p>

                  {/* Specifications */}
                  <div className="grid grid-cols-2 gap-4 border-y border-border py-5">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Users size={17} className="text-primary" />
                      {cottage.capacity} Persons
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Maximize size={17} className="text-primary" />
                      {cottage.size} sq. ft.
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted">
                      <BedDouble size={17} className="text-primary" />
                      {cottage.bedrooms} Bedroom
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Bath size={17} className="text-primary" />
                      {cottage.bathrooms} Bathroom
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="border-t border-border pt-5">
                    <div className="mb-5">
                      <p className="text-xs text-muted">
                        Starting from
                      </p>

                      <p className="text-xl font-semibold text-primary-dark">
                        ৳{cottage.price.toLocaleString("en-BD")}
                        <span className="text-xs font-normal text-muted">
                          {" "}/ night
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/stays/${cottage.slug}`}
                        className="btn btn-outline flex-1 px-3"
                      >
                        View Details
                      </Link>

                      <Link
                        href={`/booking?cottage=${cottage.slug}`}
                        className="btn btn-primary flex-1 px-3"
                      >
                        Book Now
                        <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
