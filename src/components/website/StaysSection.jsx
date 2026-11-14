
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";

import connectDB from "@/lib/mongodb";
import Cottage from "@/models/Cottage";

export const dynamic = "force-dynamic";

export default async function StaysSection() {
  await connectDB();

  // Fetch active cottages from MongoDB
  const cottages = await Cottage.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  return (
    <section className="section-padding bg-surface-muted">
      <div className="container">

        {/* Section Heading */}
        <div className="section-heading mb-14">
          <p className="section-eyebrow">Stay With Us</p>

          <h2 className="section-title !text-[40px]">
            Find Your Perfect Place to Stay
          </h2>

          <p className="section-description">
            Discover a comfortable place to unwind and enjoy
            the natural beauty of Lama, Bandarban.
          </p>
        </div>

        {/* Accommodation Cards */}
        {cottages.length > 0 ? (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {cottages.map((cottage) => (
              <article
                key={cottage._id.toString()}
                className="group overflow-hidden rounded-xl border border-border bg-surface transition-shadow duration-300 hover:shadow-soft"
              >
                {/* Cottage Image */}
                <div className="relative aspect-[4/3] bg-gray-100">
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
                <div className="p-7">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    Lama Valley Accommodation
                  </p>

                  <h3 className="mb-3 text-2xl text-primary-dark">
                    {cottage.name}
                  </h3>

                  <p className="mb-6 line-clamp-3 text-sm leading-7 text-muted">
                    {cottage.description}
                  </p>

                  <div className="mb-6 flex items-center gap-2 text-sm text-muted">
                    <Users size={17} className="text-primary" />
                    Up to {cottage.capacity} Persons
                  </div>

                  {/* Price */}
                  <div className="mb-6 border-t border-border pt-5">
                    <p className="text-xs text-muted">
                      Starting from
                    </p>

                    <p className="text-xl font-semibold text-primary-dark">
                      ৳
                      {new Intl.NumberFormat("en-BD").format(
                        cottage.price || 0
                      )}
                      <span className="text-xs font-normal text-muted">
                        {" "}/ night
                      </span>
                    </p>
                  </div>

                  {/* Cottage Details Link */}
                  <Link
                    href={`/stays/${cottage.slug}`}
                    className="inline-flex w-full items-center justify-center gap-2 btn btn-primary"
                  >
                    Explore Cottage
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface px-6 py-14 text-center">
            <h3 className="text-xl font-semibold text-primary-dark">
              Cottages Coming Soon
            </h3>

            <p className="mt-3 text-sm text-muted">
              Our accommodation options will be available here soon.
            </p>
          </div>
        )}

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link href="/stays" className="btn btn-primary">
            View All Accommodation
            <ArrowUpRight size={17} />
          </Link>
        </div>

      </div>
    </section>
  );
}
