import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const diningItems = [
  {
    id: 1,
    name: "Local Cuisine",
    description:
      "Discover delicious local flavours inspired by the food culture of the region.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554",
    label: "Regional Flavours",
  },
  {
    id: 2,
    name: "Fresh & Delicious",
    description:
      "Enjoy a selection of freshly prepared dishes in a welcoming dining environment.",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    label: "Fresh Ingredients",
  },
  {
    id: 3,
    name: "Dining Experience",
    description:
      "Make your visit memorable with a relaxing food and dining experience.",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
    label: "A Taste to Remember",
  },
];

export default function RestaurantSection() {
  return (
    <section className="section-padding bg-background">
      <div className="container">

        {/* Section Heading */}
        <div className="section-heading mb-14">
          <p className="section-eyebrow">Food & Dining</p>

          <h2 className="section-title !text-[35px]">
            A Delicious Experience in the Hills
          </h2>

          <p className="section-description">
            Enjoy a welcoming dining experience and discover
            delicious flavours during your stay at Lama Valley.
          </p>
        </div>

        {/* Dining Cards */}
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {diningItems.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-xl border border-border bg-surface transition-shadow duration-300 hover:shadow-soft"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-7">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  {item.label}
                </p>

                <h3 className="mb-3 text-2xl text-primary-dark">
                  {item.name}
                </h3>

                <p className="mb-6 text-sm leading-7 text-muted">
                  {item.description}
                </p>

                <Link
                  href="/restaurant"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-accent"
                >
                  Explore Our Restaurant
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* View Restaurant */}
        <div className="mt-12 text-center">
          <Link href="/restaurant" className="btn btn-primary">
            Explore Restaurant
            <ArrowUpRight size={17} />
          </Link>
        </div>

      </div>
    </section>
  );
}