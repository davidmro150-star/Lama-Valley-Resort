import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const stays = [
  {
    id: 1,
    name: "Deluxe Room",
    description:
      "A comfortable space to relax and enjoy a peaceful getaway in the hills.",
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32",
    label: "Comfort & Relaxation",
  },
  {
    id: 2,
    name: "Family Accommodation",
    description:
      "A welcoming accommodation option for families and group visitors.",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace",
    label: "Space for Everyone",
  },
  {
    id: 3,
    name: "Nature Retreat",
    description:
      "Enjoy a relaxing stay surrounded by beautiful natural scenery.",
    image:
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8",
    label: "A Peaceful Escape",
  },
];

export default function StaysSection() {
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
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {stays.map((stay) => (
            <article
              key={stay.id}
              className="group overflow-hidden rounded-xl border border-border bg-surface transition-shadow duration-300 hover:shadow-soft"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={stay.image}
                  alt={stay.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-7">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  {stay.label}
                </p>

                <h3 className="mb-3 text-2xl text-primary-dark">
                  {stay.name}
                </h3>

                <p className="mb-6 text-sm leading-7 text-muted">
                  {stay.description}
                </p>

                <Link
                  href="/stays"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-accent"
                >
                  Explore Accommodation
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>

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