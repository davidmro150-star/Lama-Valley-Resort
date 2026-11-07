
import Image from "next/image";
import Link from "next/link";

const foodImages = [
  {
    src: "https://images.unsplash.com/photo-1547592180-85f173990554",
    alt: "Freshly prepared traditional food",
    title: "Traditional Cuisine",
    category: "Local Favorites",
  },
  {
    src: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    alt: "Fresh healthy meal",
    title: "Fresh & Healthy",
    category: "Healthy Dining",
  },
  {
    src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
    alt: "Restaurant dining experience",
    title: "Dining Experience",
    category: "Restaurant",
  },
];

const highlights = [
  {
    number: "01",
    title: "Fresh Ingredients",
    description:
      "We focus on fresh ingredients and carefully prepared meals for our guests.",
  },
  {
    number: "02",
    title: "Local Flavors",
    description:
      "Enjoy delicious meals inspired by local food traditions and familiar favorites.",
  },
  {
    number: "03",
    title: "Mountain Atmosphere",
    description:
      "Enjoy your meal while experiencing the peaceful surroundings of Lama.",
  },
];

export const metadata = {
  title: "Restaurant | Lama Valley Resort",
  description:
    "Discover the dining experience at Lama Valley Resort and Restaurant in Bandarban.",
};

export default function RestaurantPage() {
  return (
    <main className="bg-[#f7f5ef] text-[#173729]">
      {/* Hero */}
      <section className="relative flex min-h-[65vh] items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0"
          alt="Restaurant dining atmosphere"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center text-white">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.35em] text-[#d8b77e]">
            Taste the Experience
          </p>

          <h1 className="font-serif text-4xl leading-tight md:text-6xl lg:text-7xl">
            Dining at Lama Valley
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/85 md:text-lg">
            Enjoy delicious food, welcoming hospitality, and peaceful
            mountain surroundings at Lama Valley Resort and Restaurant.
          </p>

          <a
            href="#food"
            className="mt-9 inline-flex rounded-full bg-[#c49a62] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#a9804d]"
          >
            Explore Our Dining
          </a>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center lg:px-10 lg:py-28">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#a9804d]">
            Welcome to Our Restaurant
          </p>

          <h2 className="font-serif text-3xl leading-tight md:text-5xl">
            Good Food, Beautiful Surroundings
          </h2>

          <p className="mt-6 leading-8 text-[#647067]">
            At Lama Valley Resort and Restaurant, dining is part of the
            overall experience. Relax, enjoy your time with family and
            friends, and discover the flavors of the region.
          </p>

          <p className="mt-4 leading-8 text-[#647067]">
            Whether you are staying at our resort or visiting for a meal,
            we look forward to welcoming you.
          </p>

          <Link
            href="/contact"
            className="mt-8 inline-flex border-b border-[#a9804d] pb-2 text-sm font-semibold text-[#234b3b] transition hover:text-[#a9804d]"
          >
            Contact Us →
          </Link>
        </div>

        <div className="relative min-h-[350px] overflow-hidden rounded-2xl md:min-h-[500px]">
          <Image
            src={foodImages[0].src}
            alt={foodImages[0].alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* Food Gallery */}
      <section id="food" className="bg-white px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#a9804d]">
              Our Dining Gallery
            </p>

            <h2 className="font-serif text-3xl md:text-5xl">
              A Taste of Lama Valley
            </h2>

            <p className="mt-5 leading-8 text-[#647067]">
              Explore the dining atmosphere and food experiences awaiting
              you at our restaurant.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {foodImages.map((item) => (
              <article key={item.title} className="group">
                <div className="relative h-[320px] overflow-hidden rounded-xl">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#a9804d]">
                  {item.category}
                </p>

                <h3 className="mt-2 font-serif text-2xl">
                  {item.title}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurant Highlights */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="mb-14 max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#a9804d]">
            Why Dine With Us
          </p>

          <h2 className="font-serif text-3xl md:text-5xl">
            More Than Just a Meal
          </h2>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.number}
              className="border-t border-[#d9d5ca] pt-7"
            >
              <span className="text-sm font-semibold text-[#a9804d]">
                {item.number}
              </span>

              <h3 className="mt-5 font-serif text-2xl">
                {item.title}
              </h3>

              <p className="mt-4 leading-8 text-[#647067]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#173729] px-6 py-20 text-center text-white">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#d8b77e]">
          Visit Lama Valley
        </p>

        <h2 className="mx-auto max-w-3xl font-serif text-3xl leading-tight md:text-5xl">
          Make Your Mountain Getaway Even More Memorable
        </h2>

        <p className="mx-auto mt-6 max-w-xl leading-8 text-white/75">
          Get in touch with our team to learn more about dining and
          visiting Lama Valley Resort and Restaurant.
        </p>

        <Link
          href="/contact"
          className="mt-9 inline-flex rounded-full bg-[#c49a62] px-9 py-4 text-sm font-semibold text-white transition hover:bg-[#a9804d]"
        >
          Contact Our Team
        </Link>
      </section>
    </main>
  );
}
