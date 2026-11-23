
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import connectDB from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import HomePage from "@/models/HomePage";

export const dynamic = "force-dynamic";

export default async function GallerySection() {
  let galleryImages = [];
  let content = {};

  try {
    await connectDB();

    const [images, homePage] = await Promise.all([
      Gallery.find({
        isActive: true,
      })
        .sort({ order: 1, createdAt: -1 })
        .limit(5)
        .lean(),

      HomePage.findOne()
        .select("gallerySection")
        .lean(),
    ]);

    content = homePage?.gallerySection || {};

    galleryImages = images.map((image, index) => ({
      id: image._id.toString(),
      src: image.imageUrl,
      alt: image.title || "Lama Valley Resort",
      title: image.title || "Lama Valley Resort",
      size: index === 0 ? "large" : "normal",
    }));
  } catch (error) {
    console.error("Homepage gallery error:", error);
  }

  return (
    <section className="section-padding !pt-6 sm:!pt-16 bg-background">
      <div className="container min-w-0">

        {/* Section Heading */}
        <div className="section-heading mb-10 sm:mb-14">
          <p className="section-eyebrow">
            {content.eyebrow || "Our Gallery"}
          </p>

          <h2 className="section-title !text-[22px] sm:!text-[35px]">
            {content.title || "Moments Worth Remembering"}
          </h2>

          <p className="section-description !text-[13px]">
            {content.description ||
              "Explore beautiful landscapes, relaxing surroundings and memorable moments at Lama Valley."}
          </p>
        </div>

        {/* Gallery */}
        {galleryImages.length > 0 ? (
          <>
            {/* Automatic Slider: Mobile and Tablet */}
            <div className="feature-slider lg:hidden">
              <div className="feature-slider-track">
                {[...galleryImages, ...galleryImages].map(
                  (image, index) => (
                    <div
                      key={`${image.id}-${index}`}
                      aria-hidden={
                        index >= galleryImages.length
                          ? "true"
                          : undefined
                      }
                      className="feature-slide"
                    >
                      <div className="group relative h-[220px] overflow-hidden rounded-xl sm:h-[280px]">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          sizes="(max-width: 639px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-80" />

                        <div className="absolute bottom-5 left-5">
                          <p className="text-lg font-medium text-white">
                            {image.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Desktop Gallery Grid */}
            <div className="hidden auto-rows-[220px] gap-4 lg:grid lg:grid-cols-3">
              {galleryImages.map((image) => (
                <div
                  key={image.id}
                  className={`group relative overflow-hidden rounded-xl ${image.size === "large"
                      ? "sm:row-span-2"
                      : ""
                    }`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100" />

                  <div className="absolute bottom-5 left-5">
                    <p className="text-lg font-medium text-white">
                      {image.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-xl bg-white px-6 py-16 text-center">
            <h3 className="font-serif text-2xl text-[#173729]">
              Our Gallery Is Growing
            </h3>

            <p className="mt-3 text-sm text-[#647067]">
              Beautiful photographs of Lama Valley will be
              available here soon.
            </p>
          </div>
        )}

        {/* View Gallery Button */}
        <div className="mt-8 text-center sm:mt-12">
          <Link
            href={content.buttonLink || "/gallery"}
            className="btn btn-primary"
          >
            {content.buttonText || "Explore Full Gallery"}
            <ArrowUpRight size={17} />
          </Link>
        </div>

      </div>
    </section>
  );
}
