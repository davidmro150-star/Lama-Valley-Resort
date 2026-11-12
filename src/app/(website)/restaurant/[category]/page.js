
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import connectDB from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
import RestaurantMenuCard from "@/components/website/RestaurantMenuCard";

export const dynamic = "force-dynamic";


const siteUrl = (
  process.env.SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export async function generateMetadata({ params }) {
  const { category } = await params;
  const selectedCategory = categories[category];

  if (!selectedCategory) {
    return {
      title: "Category Not Found | Lama Valley Resort",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${selectedCategory.name} at Lama Valley Resort | Bandarban`;

  const description =
    `${selectedCategory.description} Enjoy a memorable dining experience at Lama Valley Resort, Lama, Bandarban.`;

  const canonicalUrl = `${siteUrl}/restaurant/${category}`;

  return {
    title,
    description,

    keywords: [
      `${selectedCategory.name} at Lama Valley`,
      `${selectedCategory.name} in Lama`,
      "Restaurant in Lama Bandarban",
      "Lama Valley Restaurant",
      "Food in Bandarban",
      "Resort restaurant in Bangladesh",
    ],

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Lama Valley Resort & Restaurant",
      type: "website",
      images: [
        {
          url: selectedCategory.image,
          alt: `${selectedCategory.name} at Lama Valley Resort`,
        },
      ],
    },
  };
}


const categories = {
  breakfast: {
    name: "Breakfast",
    subtitle: "A Beautiful Start to Your Day",
    description:
      "Begin your morning with freshly prepared breakfast and the peaceful beauty of Lama Valley.",
    image:
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666",
  },
  lunch: {
    name: "Lunch",
    subtitle: "A Taste of the Hills",
    description:
      "Enjoy freshly prepared meals, local flavours and a relaxing dining experience surrounded by nature.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554",
  },
  dinner: {
    name: "Dinner",
    subtitle: "An Evening to Savour",
    description:
      "Enjoy delicious food and a memorable evening with family and friends at Lama Valley.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
  },
  desserts: {
    name: "Desserts",
    subtitle: "Something Sweet to Remember",
    description:
      "Discover delightful desserts and sweet treats to make your dining experience complete.",
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777",
  },
};

export default async function RestaurantCategoryPage({ params }) {
  const { category } = await params;
  const selectedCategory = categories[category];

  if (!selectedCategory) {
    notFound();
  }

  let items = [];

  try {
    await connectDB();

    const menuItems = await MenuItem.find({
      category: selectedCategory.name,
      isAvailable: true,
    })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    // Convert MongoDB documents into plain JavaScript objects.
    items = menuItems.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      description: item.description || "",
      price: Number(item.price || 0),
      imageUrl: item.imageUrl || "",
      isFeatured: Boolean(item.isFeatured),
    }));
  } catch (error) {
    console.error("Restaurant category error:", error);
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#173729]">
      {/* Hero */}
      <section className="relative flex min-h-[460px] items-center justify-center overflow-hidden sm:min-h-[540px]">
        <Image
          src={selectedCategory.image}
          alt={`${selectedCategory.name} at Lama Valley Resort`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/65" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 py-24 text-center text-white">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#d5ad76]" />

            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#e5c18e] sm:text-sm">
              Lama Valley Restaurant
            </p>

            <span className="h-px w-10 bg-[#d5ad76]" />
          </div>

          <h1 className="font-serif text-5xl font-semibold tracking-wide sm:text-6xl md:text-7xl">
            {selectedCategory.name}
          </h1>

          <p className="mt-5 font-serif text-xl italic text-[#f0d5ae] sm:text-2xl">
            {selectedCategory.subtitle}
          </p>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-white/85 sm:text-base">
            {selectedCategory.description}
          </p>

          <div className="mt-9">
            <Link
              href="#menu"
              className="inline-flex rounded-full border border-white/70 px-8 py-3.5 text-sm font-semibold text-white transition hover:border-[#c49a62] hover:bg-[#c49a62]"
            >
              Discover Our Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="border-b border-[#e8e1d5] bg-white px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-2 text-sm text-gray-500">
          <Link
            href="/restaurant"
            className="transition hover:text-[#a9804d]"
          >
            Restaurant
          </Link>

          <span>/</span>

          <span className="font-semibold text-[#234b3b]">
            {selectedCategory.name}
          </span>
        </div>
      </div>

      {/* Menu Section */}
      <section id="menu" className="scroll-mt-10 px-5 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#a9804d]">
              From Our Kitchen
            </p>

            <h2 className="font-serif text-3xl font-semibold sm:text-4xl md:text-5xl">
              Our {selectedCategory.name} Menu
            </h2>

            <div className="mx-auto mt-6 h-px w-20 bg-[#c49a62]" />

            <p className="mt-6 text-sm leading-8 text-gray-600 sm:text-base">
              Explore our selection of freshly prepared dishes, carefully
              presented for a delightful dining experience.
            </p>
          </div>

          {items.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <RestaurantMenuCard
                  key={item.id}
                  item={item}
                  category={selectedCategory.name}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#e8e1d5] bg-white px-6 py-20 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a9804d]">
                Coming Soon
              </p>

              <h3 className="mt-4 font-serif text-3xl font-semibold">
                Our {selectedCategory.name} Menu
              </h3>

              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-gray-500">
                We are preparing something delicious for you. Please visit
                again soon to explore our menu.
              </p>

              <Link
                href="/restaurant"
                className="mt-8 inline-flex rounded-full bg-[#234b3b] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#173729]"
              >
                Back to Restaurant
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#173729] px-5 py-16 text-center text-white sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#e5c18e]">
            Dine With Us
          </p>

          <h2 className="font-serif text-3xl font-semibold sm:text-4xl">
            A Wonderful Dining Experience Awaits
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-white/75 sm:text-base">
            Visit Lama Valley Resort and enjoy delicious food in the
            peaceful surroundings of the hills.
          </p>

          <Link
            href="/contact"
            className="mt-8 inline-flex rounded-full bg-[#c49a62] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#a9804d]"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
