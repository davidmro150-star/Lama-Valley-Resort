
import Image from "next/image";
import Link from "next/link";

const packages = [
  {
    id: 1,
    name: "Day Escape",
    subtitle: "A refreshing day in the hills",
    price: "৳1,500",
    unit: "per person",
    duration: "1 Day",
    image:
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8",
    description:
      "Take a break from everyday life and enjoy a relaxing day surrounded by the natural beauty of Lama.",
    features: [
      "Resort access",
      "Natural sightseeing",
      "Relaxation areas",
      "Friendly hospitality",
    ],
  },
  {
    id: 2,
    name: "Hill Retreat",
    subtitle: "A peaceful overnight getaway",
    price: "৳5,500",
    unit: "per couple",
    duration: "2 Days / 1 Night",
    image:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739",
    description:
      "Enjoy an overnight escape with comfortable accommodation and beautiful mountain surroundings.",
    features: [
      "One-night accommodation",
      "Breakfast",
      "Scenic resort surroundings",
      "Relaxation experience",
    ],
    popular: true,
  },
  {
    id: 3,
    name: "Family Getaway",
    subtitle: "Special moments together",
    price: "৳9,500",
    unit: "per family",
    duration: "2 Days / 1 Night",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    description:
      "Spend quality time with your family in a peaceful hill destination away from busy city life.",
    features: [
      "Family accommodation",
      "Breakfast",
      "Resort access",
      "Scenic surroundings",
    ],
  },
];

export const metadata = {
  title: "Resort Packages | Lama Valley Resort",
  description:
    "Explore getaway packages and accommodation experiences at Lama Valley Resort, Bandarban.",
};

export default function PackagesPage() {
  return (
    <main className="bg-[#f7f5ef] text-[#173729]">
      {/* Hero */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8"
          alt="Peaceful mountain resort getaway"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center text-white">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.35em] text-[#d8b77e]">
            Discover Your Escape
          </p>

          <h1 className="font-serif text-4xl leading-tight md:text-6xl lg:text-7xl">
            Packages & Experiences
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/85 md:text-lg">
            Discover peaceful hill retreats, memorable family getaways,
            and relaxing experiences at Lama Valley Resort.
          </p>

          <a
            href="#packages"
            className="mt-9 inline-flex rounded-full bg-[#c49a62] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#a9804d]"
          >
            Explore Packages
          </a>
        </div>
      </section>

     

      {/* Packages */}
      <section
        id="packages"
        className="bg-white px-6 py-20 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#a9804d]">
              Our Packages
            </p>

            <h2 className="font-serif text-3xl md:text-5xl">
              Choose Your Experience
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((item) => (
              <article
                key={item.id}
                className="relative flex flex-col overflow-hidden rounded-2xl border border-[#e7e3d9] bg-[#f7f5ef]"
              >
                {item.popular && (
                  <span className="absolute left-5 top-5 z-10 rounded-full bg-[#c49a62] px-4 py-2 text-xs font-semibold text-white">
                    Popular Choice
                  </span>
                )}

                <div className="relative h-[260px]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a9804d]">
                    {item.duration}
                  </p>

                  <h3 className="mt-3 font-serif text-2xl">
                    {item.name}
                  </h3>

                  <p className="mt-2 text-sm text-[#647067]">
                    {item.subtitle}
                  </p>

                  <p className="mt-5 text-sm leading-7 text-[#647067]">
                    {item.description}
                  </p>

                  <div className="my-6 border-t border-[#ded9ce]" />

                  <h4 className="text-sm font-semibold">
                    Package Includes
                  </h4>

                  <ul className="mt-4 flex-1 space-y-3">
                    {item.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-[#647067]"
                      >
                        <span className="text-[#a9804d]">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 border-t border-[#ded9ce] pt-6">
                    <p className="text-3xl font-semibold">
                      {item.price}
                    </p>

                    <p className="mt-1 text-xs text-[#647067]">
                      {item.unit}
                    </p>

                    <Link
                      href="/booking"
                      className="mt-6 flex w-full items-center justify-center rounded-full bg-[#234b3b] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#173729]"
                    >
                      Book Your Stay
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Experience */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-10 rounded-2xl bg-[#234b3b] p-8 text-white md:grid-cols-2 md:items-center md:p-14">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#d8b77e]">
              Something Special
            </p>

            <h2 className="font-serif text-3xl leading-tight md:text-5xl">
              Looking for a Custom Experience?
            </h2>

            <p className="mt-6 leading-8 text-white/75">
              Planning a group visit or a special occasion?
              Contact our team to discuss your requirements.
            </p>

            <Link
              href="/contact"
              className="mt-8 inline-flex rounded-full bg-[#c49a62] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#a9804d]"
            >
              Contact Our Team
            </Link>
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-xl md:min-h-[380px]">
            <Image
              src="https://images.unsplash.com/photo-1510798831971-661eb04b3739"
              alt="Peaceful resort accommodation"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
