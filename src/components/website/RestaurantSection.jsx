
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import connectDB from "@/lib/mongodb";
import HomePage from "@/models/HomePage";
import ResponsiveSlider from "@/components/website/ResponsiveSlider";

const defaultDiningItems = [
  {
    id: 1,
    name: "Local Cuisine",
    description:
      "Discover delicious local flavours inspired by the food culture of the region.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554",
    label: "Regional Flavours",
    alt: "Local cuisine",
  },
  {
    id: 2,
    name: "Fresh & Delicious",
    description:
      "Enjoy a selection of freshly prepared dishes in a welcoming dining environment.",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    label: "Fresh Ingredients",
    alt: "Freshly prepared food",
  },
  {
    id: 3,
    name: "Dining Experience",
    description:
      "Make your visit memorable with a relaxing food and dining experience.",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
    label: "A Taste to Remember",
    alt: "Restaurant dining experience",
  },
];

export const dynamic = "force-dynamic";

export default async function RestaurantSection() {
  let content = {};

  try {
    await connectDB();

    const homePage = await HomePage.findOne()
      .select("diningSection")
      .lean();

    content = homePage?.diningSection || {};
  } catch (error) {
    console.error("Homepage Restaurant section error:", error);
  }

  // Display only complete restaurant cards.
  // Incomplete cards remain saved in the admin dashboard.
  const savedDiningItems = Array.isArray(content.cards)
    ? content.cards.filter(
      (card) =>
        typeof card.name === "string" &&
        card.name.trim() &&
        typeof card.description === "string" &&
        card.description.trim() &&
        typeof card.image === "string" &&
        card.image.trim()
    )
    : [];

  const diningItems =
    savedDiningItems.length > 0
      ? savedDiningItems
      : defaultDiningItems;

  return (
    <section className="section-padding !pt-3 sm:!pt-16 overflow-hidden bg-background">
      <div className="container min-w-0">
        <div className="section-heading mb-10 sm:mb-14">
          <p className="section-eyebrow">
            {content.eyebrow || "Food & Dining"}
          </p>

          <h2 className="section-title !text-[20px] sm:!text-[40px]">
            {content.title || "A Delicious Experience in the Hills"}
          </h2>

          <p className="section-description !text-[14px]">
            {content.description ||
              "Enjoy a welcoming dining experience and discover delicious flavours during your stay at Lama Valley."}
          </p>
        </div>

        <ResponsiveSlider>
          {diningItems.map((item, index) => (
            <article
              key={item._id || item.id || index}
              className="group w-full min-w-0 shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-surface min-[768px]:w-[calc((100%-1.75rem)/2)] min-[1021px]:w-[calc((100%-3.5rem)/3)]"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.alt || item.name || "Restaurant food"}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1020px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    No image available
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-7">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  {item.label || "Food & Dining"}
                </p>

                <h3 className="mb-3 text-xl text-primary-dark sm:text-2xl">
                  {item.name}
                </h3>

                <p className="mb-5 text-sm leading-7 text-muted">
                  {item.description}
                </p>

                <Link
                  href={content.buttonLink || "/restaurant"}
                  style={{
                    all: "unset",
                    boxSizing: "border-box",
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "8px 16px",
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
                  Explore Our Restaurant
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </ResponsiveSlider>

        <div className="mt-6 text-center sm:mt-8">
          <Link
            href={content.buttonLink || "/restaurant"}
            style={{
              all: "unset",
              boxSizing: "border-box",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "8px 20px",
              borderRadius: "6px",
              backgroundColor: "#234b3b",
              color: "#ffffff",
              fontSize: "14px",
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
            {content.buttonText || "Explore Restaurant"}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
