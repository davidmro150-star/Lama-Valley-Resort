
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";

import connectDB from "@/lib/mongodb";
import Cottage from "@/models/Cottage";
import HomePage from "@/models/HomePage";
import ResponsiveSlider from "@/components/website/ResponsiveSlider";

export const dynamic = "force-dynamic";

export default async function StaysSection() {
  await connectDB();

  // Fetch active cottages and homepage section content.
  const [cottages, homePage] = await Promise.all([
    Cottage.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean(),

    HomePage.findOne()
      .select("staysSection")
      .lean(),
  ]);

  const content = homePage?.staysSection || {};

  return (
    <section className="section-padding !pt-6 sm:!pt-16 overflow-hidden bg-surface-muted">
      <div className="container min-w-0">
        {/* Section Heading */}
        <div className="section-heading mb-10 sm:mb-14">
          <p className="section-eyebrow">
            {content.eyebrow || "Stay With Us"}
          </p>

          <h2 className="section-title !text-[22px] sm:!text-[40px]">
            {content.title || "Find Your Perfect Place to Stay"}
          </h2>

          <p className="section-description !text-[14px]">
            {content.description ||
              "Discover a comfortable place to unwind and enjoy the natural beauty of Lama, Bandarban."}
          </p>
        </div>

        {/* Accommodation Slider */}
        {cottages.length > 0 ? (
          <ResponsiveSlider>
            {cottages.map((cottage) => (
              <article
                key={cottage._id.toString()}
                className="group w-full min-w-0 shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-surface transition-shadow duration-300 hover:shadow-soft min-[768px]:w-[calc((100%-1.75rem)/2)] min-[1021px]:w-[calc((100%-3.5rem)/3)]"
              >
                {/* Cottage Image */}
                <div className="relative aspect-[4/3] bg-gray-100">
                  {cottage.images?.[0] ? (
                    <Image
                      src={cottage.images[0]}
                      alt={cottage.name}
                      fill
                      unoptimized
                      sizes="(max-width: 767px) 100vw, (max-width: 1020px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      No image available
                    </div>
                  )}
                </div>

                {/* Cottage Information */}
                <div className="p-3 sm:p-7">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    Lama Valley Accommodation
                  </p>

                  <h3 className="mb-3 text-xl text-primary-dark sm:text-2xl">
                    {cottage.name}
                  </h3>

                  <p className="mb-6 line-clamp-3 text-sm leading-7 text-muted">
                    {cottage.description}
                  </p>

                  {/* Capacity */}
                  <div className="mb-6 flex items-center gap-2 text-sm text-muted">
                    <Users
                      size={17}
                      className="shrink-0 text-primary"
                    />

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
                    style={{
                      all: "unset",
                      boxSizing: "border-box",
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      padding: "8px 12px",
                      border: "1px solid #000000",
                      borderRadius: "6px",
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      fontSize: "13px",
                      fontWeight: 500,
                      lineHeight: 1.5,
                      textAlign: "center",
                      cursor: "pointer",
                      filter: "none",
                      backdropFilter: "none",
                      WebkitBackdropFilter: "none",
                      boxShadow: "none",
                      textShadow: "none",
                      opacity: 1,
                      transform: "none",
                    }}
                  >
                    Select Room
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </ResponsiveSlider>
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

        {/* View All Accommodation Button */}
        <div className="mt-4 text-center sm:mt-8">
          <Link
            href={content.buttonLink || "/stays"}
            style={{
              display: "inline-block",
              backgroundColor: "#234b3b",
              color: "#ffffff",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: 500,
              filter: "none",
              backdropFilter: "none",
              boxShadow: "none",
              opacity: 1,
              transform: "none",
          
              textDecoration: "none",
            }}
          >
            {content.buttonText || "View All Accommodation"}
          </Link>
        </div>
      </div>
    </section>
  );
}
