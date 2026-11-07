
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Users,
  Clock,
} from "lucide-react";

import connectDB from "@/lib/mongodb";
import Cottage from "@/models/Cottage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cottages & Accommodation",
  description:
    "Explore cottage accommodation at Lama Valley Resort & Restaurant, Lama, Bandarban.",
};

function formatPrice(price) {
  return new Intl.NumberFormat("en-BD").format(price || 0);
}

export default async function StaysPage() {
  await connectDB();

  const cottages = await Cottage.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean();

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
          {cottages.length === 0 ? (
            <div className="py-16 text-center">
              <h3 className="text-xl font-semibold text-primary-dark">
                No cottages available
              </h3>
              <p className="mt-2 text-sm text-muted">
                Please check back later for accommodation updates.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {cottages.map((cottage) => (
                <article
                  key={cottage._id.toString()}
                  className="overflow-hidden rounded-xl border border-border bg-surface transition-shadow duration-300 hover:shadow-soft"
                >
                  {/* Main Image */}
                  <div className="group relative aspect-[4/3] bg-gray-100">
                    {cottage.images?.[0] ? (
                      <Image
                        src={cottage.images[0]}
                        alt={cottage.name}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No image available
                      </div>
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
                        <span className="text-xs text-gray-500">
                          {cottage.images?.length || 0} Photos
                        </span>
                      </div>
                    </div>

                    {/* Stay Schedule */}
                    <div className="my-5 rounded-lg border border-[#e8d6b8] bg-[#fff8eb] p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Clock size={17} className="text-[#9a692c]" />
                        <h4 className="text-sm font-semibold text-[#76501f]">
                          Stay Schedule
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-md bg-[#f5e6c9] p-3">
                          <p className="mb-1 text-xs font-medium text-[#76501f]">
                            Check-in
                          </p>
                          <p className="text-base font-bold text-[#76501f]">
                            01:00 PM
                          </p>
                        </div>

                        <div className="rounded-md bg-[#e8f0eb] p-3">
                          <p className="mb-1 text-xs font-medium text-[#234b3b]">
                            Check-out
                          </p>
                          <p className="text-base font-bold text-[#234b3b]">
                            11:00 AM
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="border-t border-border pt-5">
                      <div className="mb-5">
                        <p className="text-xs text-muted">
                          Starting from
                        </p>

                        <p className="text-xl font-semibold text-primary-dark">
                          ৳{formatPrice(cottage.price)}
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
          )}
        </div>
      </section>
    </main>
  );
}
