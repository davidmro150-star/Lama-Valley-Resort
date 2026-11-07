
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import connectDB from "@/lib/mongodb";
import Cottage from "@/models/Cottage";

import CottageGallery from "@/components/website/CottageGallery";
import CottageBookingWrapper from "@/components/website/CottageBookingWrapper";

export const dynamic = "force-dynamic";

// Convert MongoDB documents into plain JSON-safe objects.
function serializeData(data) {
  return JSON.parse(JSON.stringify(data));
}

// Fetch one active cottage.
async function getCottage(slug) {
  await connectDB();

  const cottageData = await Cottage.findOne({
    slug,
    isActive: true,
  }).lean();

  if (!cottageData) {
    return null;
  }

  return serializeData(cottageData);
}

// Fetch related cottages.
async function getRelatedCottages(currentSlug) {
  await connectDB();

  const relatedData = await Cottage.find({
    isActive: true,
    slug: { $ne: currentSlug },
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  return serializeData(relatedData);
}

// Dynamic page metadata.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cottage = await getCottage(slug);

  if (!cottage) {
    return {
      title: "Cottage Not Found | Lama Valley Resort",
    };
  }

  return {
    title: `${cottage.name} | Lama Valley Resort`,
    description: cottage.description || "Discover our beautiful cottage at Lama Valley Resort.",
  };
}

export default async function CottageDetailsPage({ params }) {
  const { slug } = await params;

  const cottage = await getCottage(slug);

  if (!cottage) {
    notFound();
  }

  const relatedCottages = await getRelatedCottages(slug);

  const images = Array.isArray(cottage.images)
    ? cottage.images.filter((image) => typeof image === "string" && image.trim())
    : [];

  const facilities = Array.isArray(cottage.facilities)
    ? cottage.facilities
    : [];

  const highlights = Array.isArray(cottage.highlights)
    ? cottage.highlights
    : [];

  const includedServices = Array.isArray(cottage.includedServices)
    ? cottage.includedServices
    : [];

  const policies = Array.isArray(cottage.policies)
    ? cottage.policies
    : [];

  const price = Number(cottage.price) || 0;
  const capacity = Number(cottage.capacity) || 1;

  return (
    <main className="min-h-screen bg-[#f7f5ef]">
      {/* Hero Section */}
      <section className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-[#173729] px-5 py-20 text-center sm:min-h-[400px]">
        {images[0] && (
          <Image
            src={images[0]}
            alt={cottage.name}
            fill
            priority
            unoptimized
            className="object-cover opacity-35"
            sizes="100vw"
          />
        )}

        <div className="absolute inset-0 bg-[#10251c]/60" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[4px] text-[#c49a62] sm:text-sm">
            Lama Valley Resort & Restaurant
          </p>

          <h1 className="font-serif text-4xl font-medium text-white sm:text-5xl md:text-6xl">
            {cottage.name}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
            Experience peaceful surroundings, beautiful scenery, and a relaxing
            stay in the hills of Lama.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3 text-sm text-white/90">
            <span className="rounded-full border border-white/30 px-5 py-2">
              Up to {capacity} Guests
            </span>

            <span className="rounded-full border border-white/30 px-5 py-2">
              ৳{price.toLocaleString("en-BD")} / night
            </span>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="transition hover:text-[#234b3b]">
            Home
          </Link>

          <span>/</span>

          <Link href="/stays" className="transition hover:text-[#234b3b]">
            Stays
          </Link>

          <span>/</span>

          <span className="font-medium text-[#234b3b]">
            {cottage.name}
          </span>
        </div>
      </div>

      {/* Main Cottage Content */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-3 lg:gap-12">
          {/* Left Content */}
          <div className="space-y-10 lg:col-span-2">
            {/* Gallery */}
            <div>
              {images.length > 0 ? (
                <CottageGallery images={images} />
              ) : (
                <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-[#e9e6dc] text-gray-500">
                  No images available for this cottage.
                </div>
              )}
            </div>

            {/* Cottage Description */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[3px] text-[#c49a62]">
                Welcome to your stay
              </p>

              <h2 className="mb-5 font-serif text-3xl text-[#234b3b] sm:text-4xl">
                About This Cottage
              </h2>

              <p className="text-base leading-8 text-gray-600">
                {cottage.description ||
                  "Enjoy a peaceful and comfortable stay surrounded by the natural beauty of Lama Valley."}
              </p>
            </div>

            {/* Cottage Overview */}
            <div className="border-y border-[#e3dfd4] py-8">
              <h2 className="mb-6 font-serif text-2xl text-[#234b3b]">
                Cottage Overview
              </h2>

              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500">Guest Capacity</p>
                  <p className="mt-2 font-semibold text-[#234b3b]">
                    {capacity} Guests
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Price Per Night</p>
                  <p className="mt-2 font-semibold text-[#234b3b]">
                    ৳{price.toLocaleString("en-BD")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Accommodation</p>
                  <p className="mt-2 font-semibold text-[#234b3b]">
                    {cottage.accommodationType || "Private Cottage"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Bedrooms</p>
                  <p className="mt-2 font-semibold text-[#234b3b]">
                    {cottage.bedrooms ?? "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Bathrooms</p>
                  <p className="mt-2 font-semibold text-[#234b3b]">
                    {cottage.bathrooms ?? "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Size</p>
                  <p className="mt-2 font-semibold text-[#234b3b]">
                    {cottage.size || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Facilities */}
            {facilities.length > 0 && (
              <div>
                <h2 className="mb-6 font-serif text-2xl text-[#234b3b]">
                  Facilities & Amenities
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {facilities.map((facility, index) => (
                    <div
                      key={`${facility}-${index}`}
                      className="flex items-center gap-3 rounded-xl bg-white p-4"
                    >
                      <span className="text-[#c49a62]">✓</span>
                      <span className="text-sm text-gray-700">
                        {facility}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <div>
                <h2 className="mb-6 font-serif text-2xl text-[#234b3b]">
                  Cottage Highlights
                </h2>

                <ul className="space-y-3">
                  {highlights.map((highlight, index) => (
                    <li
                      key={`${highlight}-${index}`}
                      className="flex gap-3 text-gray-600"
                    >
                      <span className="text-[#c49a62]">✦</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Included Services */}
            {includedServices.length > 0 && (
              <div>
                <h2 className="mb-6 font-serif text-2xl text-[#234b3b]">
                  Included Services
                </h2>

                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {includedServices.map((service, index) => (
                    <li
                      key={`${service}-${index}`}
                      className="rounded-xl bg-white p-4 text-sm text-gray-600"
                    >
                      ✓ {service}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Policies */}
            {policies.length > 0 && (
              <div>
                <h2 className="mb-6 font-serif text-2xl text-[#234b3b]">
                  Cottage Policies
                </h2>

                <ul className="space-y-3">
                  {policies.map((policy, index) => (
                    <li
                      key={`${policy}-${index}`}
                      className="text-sm leading-7 text-gray-600"
                    >
                      • {policy}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Booking Panel */}
          <div className="lg:sticky lg:top-24">
            <CottageBookingWrapper cottage={cottage} />
          </div>
        </div>
      </section>

      {/* Related Cottages */}
      {relatedCottages.length > 0 && (
        <section className="border-t border-[#e3dfd4] bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="mb-10 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[3px] text-[#c49a62]">
                Explore More
              </p>

              <h2 className="font-serif text-3xl text-[#234b3b] sm:text-4xl">
                You May Also Like
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCottages.map((related) => {
                const relatedImage = related.images?.[0];

                return (
                  <Link
                    key={related._id}
                    href={`/stays/${related.slug}`}
                    className="group overflow-hidden rounded-2xl border border-[#e9e5db] bg-[#f7f5ef] transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative h-60 bg-[#e9e6dc]">
                      {relatedImage ? (
                        <Image
                          src={relatedImage}
                          alt={related.name}
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-500">
                          No image available
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="font-serif text-xl text-[#234b3b]">
                        {related.name}
                      </h3>

                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
                        {related.description || "Discover a relaxing stay at Lama Valley Resort."}
                      </p>

                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Up to {related.capacity} guests
                        </span>

                        <span className="font-semibold text-[#234b3b]">
                          ৳{Number(related.price || 0).toLocaleString("en-BD")}
                          <span className="font-normal text-gray-500">
                            {" "}/ night
                          </span>
                        </span>
                      </div>

                      <div className="mt-5 border-t border-[#e3dfd4] pt-4 text-sm font-semibold text-[#234b3b]">
                        View Cottage →
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
