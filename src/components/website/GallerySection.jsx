
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import connectDB from "@/lib/mongodb";
import Gallery from "@/models/Gallery";

export default async function GallerySection() {
  let galleryImages = [];

  try {
    await connectDB();

    const images = await Gallery.find({
      isActive: true,
    })
      .sort({ order: 1, createdAt: -1 })
      .limit(5)
      .lean();

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
    <section className="section-padding bg-background">
      <div className="container">

        {/* Section Heading */}
        <div className="section-heading mb-14">
          <p className="section-eyebrow">Our Gallery</p>

          <h2 className="section-title !text-[35px]">
            Moments Worth Remembering
          </h2>

          <p className="section-description">
            Explore beautiful landscapes, relaxing surroundings
            and memorable moments at Lama Valley.
          </p>
        </div>

        {/* Gallery Grid */}
        {galleryImages.length > 0 ? (
          <div className="grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
        <div className="mt-12 text-center">
          <Link href="/gallery" className="btn btn-primary">
            Explore Full Gallery
            <ArrowUpRight size={17} />
          </Link>
        </div>

      </div>
    </section>
  );
}
