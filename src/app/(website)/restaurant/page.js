
import Image from "next/image";
import Link from "next/link";

import connectDB from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";

const siteUrl = (
  process.env.SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const metadata = {
  title: "Restaurant in Lama, Bandarban | Lama Valley Resort",
  description:
    "Enjoy delicious local and traditional food at Lama Valley Resort & Restaurant in Lama, Bandarban. Explore our breakfast, lunch, dinner and dessert menus.",

  keywords: [
    "Restaurant in Lama",
    "Restaurant in Bandarban",
    "Lama Valley Restaurant",
    "Food in Lama Bandarban",
    "Traditional food in Bandarban",
    "Resort restaurant in Bangladesh",
  ],

  alternates: {
    canonical: `${siteUrl}/restaurant`,
  },

  openGraph: {
    title: "Restaurant & Dining | Lama Valley Resort",
    description:
      "Discover delicious food, local flavours and a relaxing dining experience at Lama Valley Resort in Lama, Bandarban.",
    url: `${siteUrl}/restaurant`,
    siteName: "Lama Valley Resort & Restaurant",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
        alt: "Restaurant dining experience at Lama Valley Resort",
      },
    ],
  },
};

const categories = [
  {
    name: "Breakfast",
    slug: "breakfast",
    description:
      "Start your day with a delicious breakfast surrounded by the beautiful hills of Lama.",
    fallbackImage:
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666",
  },
  {
    name: "Lunch",
    slug: "lunch",
    description:
      "Enjoy freshly prepared lunch featuring local flavours and delicious meals.",
    fallbackImage:
      "https://images.unsplash.com/photo-1547592180-85f173990554",
  },
  {
    name: "Dinner",
    slug: "dinner",
    description:
      "Relax and enjoy a memorable dinner with family and friends.",
    fallbackImage:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
  },
  {
    name: "Desserts",
    slug: "desserts",
    description:
      "Discover sweet treats and delightful desserts to complete your meal.",
    fallbackImage:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777",
  },
];

export default async function RestaurantPage() {
  let menuItems = [];

  try {
    await connectDB();

    menuItems = await MenuItem.find({
      category: {
        $in: categories.map((category) => category.name),
      },
      isAvailable: true,
      imageUrl: { $nin: ["", null] },
    })
      .sort({ order: 1, createdAt: -1 })
      .select("category imageUrl")
      .lean();
  } catch (error) {
    console.error("Restaurant category images error:", error);
  }

  // Get the first available uploaded image for each category.
  const categoryImages = new Map();

  for (const item of menuItems) {
    if (!categoryImages.has(item.category)) {
      categoryImages.set(item.category, item.imageUrl);
    }
  }

  const updatedCategories = categories.map((category) => ({
    ...category,
    image:
      categoryImages.get(category.name) || category.fallbackImage,
  }));

  return (
    <main className="bg-[#f7f5ef] text-[#173729]">
      {/* Hero */}
      <section className="relative flex min-h-[420px] items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0"
          alt="Restaurant dining experience"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 py-24 text-center text-white">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-[#e5c18e]">
            Lama Valley Resort
          </p>

          <h1 className="font-serif text-4xl font-bold sm:text-5xl md:text-6xl">
            Restaurant & Dining
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/90 sm:text-lg">
            Experience delicious food, traditional flavours and a relaxing
            dining atmosphere in the beautiful hills of Lama.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#a9804d]">
            Fresh Food & Local Flavours
          </p>

          <h2 className="font-serif text-3xl font-bold sm:text-4xl">
            A Taste of Lama Valley
          </h2>

          <p className="mt-6 text-base leading-8 text-gray-600">
            Enjoy freshly prepared meals made for our guests. Explore our
            restaurant menu and discover delicious dishes for every taste.
          </p>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="bg-white px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#a9804d]">
              From Our Kitchen
            </p>

            <h2 className="font-serif text-3xl font-bold sm:text-4xl">
              Explore Our Menu
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-gray-600">
              Choose your favourite dining category and explore our
              freshly prepared dishes, complete with descriptions and prices.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {updatedCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/restaurant/${category.slug}`}
                className="group overflow-hidden rounded-2xl border border-[#eee9df] bg-[#fdfcf9] transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                {/* Category Image */}
                <div className="relative h-64 overflow-hidden bg-[#eee9df]">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <h3 className="absolute bottom-5 left-5 font-serif text-2xl font-bold text-white">
                    {category.name}
                  </h3>
                </div>

                {/* Category Details */}
                <div className="p-6">
                  <p className="min-h-[84px] text-sm leading-7 text-gray-600">
                    {category.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-[#e9e3d8] pt-4">
                    <span className="text-sm font-semibold text-[#234b3b]">
                      Explore Menu
                    </span>

                    <span className="text-xl text-[#a9804d] transition-transform duration-300 group-hover:translate-x-2">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-[#173729] px-5 py-16 text-center text-white sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#e5c18e]">
            Visit Lama Valley
          </p>

          <h2 className="font-serif text-3xl font-bold sm:text-4xl">
            Enjoy a Wonderful Dining Experience
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-white/80">
            Planning a visit? Contact us to learn more about our restaurant
            and dining experience.
          </p>

          <Link
            href="/contact"
            className="mt-8 inline-flex rounded-full bg-[#c49a62] px-8 py-4 font-semibold text-white transition hover:bg-[#a9804d]"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
