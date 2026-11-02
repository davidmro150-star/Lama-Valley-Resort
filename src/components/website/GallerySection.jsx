import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const galleryImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8",
    alt: "Beautiful wooden cottage exterior",
    title: "Cottage Exterior",
    size: "large",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c",
    alt: "Luxury resort room interior",
    title: "Comfortable Stay",
    size: "normal",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1510798831971-661eb04b3739",
    alt: "Wooden cabin accommodation",
    title: "Wooden Cottage",
    size: "normal",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1611892440504-42a792e24d32",
    alt: "Modern resort bedroom",
    title: "Room Interior",
    size: "normal",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    alt: "Beautiful resort property architecture",
    title: "Resort Architecture",
    size: "normal",
  },

];

export default function GallerySection() {
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