
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  MapPin,
  Mountain,
  Leaf,
  Utensils,
  BedDouble,
  Compass,
} from "lucide-react";

export const metadata = {
  title: "About Us",
  description:
    "Discover Lama Valley Resort & Restaurant in Lama, Bandarban, Bangladesh. Explore our setting, surroundings and hospitality.",
};

const experiences = [
  {
    icon: BedDouble,
    title: "Accommodation",
    description:
      "Explore the accommodation options available at Lama Valley and find a place for your visit.",
    href: "/stays",
    link: "Explore stays",
  },
  {
    icon: Utensils,
    title: "Food & Dining",
    description:
      "Discover the restaurant experience and dining options available during your visit.",
    href: "/restaurant",
    link: "Explore dining",
  },
  {
    icon: Mountain,
    title: "Natural Surroundings",
    description:
      "Experience the distinctive hill landscapes and scenic character of the Lama region.",
    href: "/gallery",
    link: "View gallery",
  },
];

const highlights = [
  "Located in Lama, Bandarban, Bangladesh",
  "Part of the beautiful Chittagong Hill Tracts region",
  "A destination for accommodation and dining",
];

export default function AboutPage() {
  return (
    <main>
      {/* =====================================
          PAGE HERO
      ====================================== */}
      <section className="relative flex min-h-[480px] items-center bg-primary-dark">
        <Image
          src="https://www.kalbela.com/assets/gallery/2023/12/19/1702975987.png"
          alt="Mirinja Valley landscape in Lama, Bandarban"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />

        <div className="container relative z-10 py-28">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent-light">
              <span className="h-px w-10 bg-accent" />
              Our Story & Our Place
            </div>

            <h1 className="mb-7 font-display text-5xl leading-tight text-white sm:text-6xl lg:text-7xl">
              Discover Lama Valley
            </h1>

            <p className="max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
              A resort and restaurant destination in Lama,
              Bandarban, surrounded by the distinctive
              landscapes of the Chittagong Hill Tracts.
            </p>

            <div className="mt-9 flex items-center gap-2 text-sm text-white/80">
              <MapPin size={17} className="text-accent-light" />
              Lama, Bandarban, Bangladesh
            </div>
          </div>
        </div>
      </section>

      {/* =====================================
          INTRODUCTION / OUR STORY
      ====================================== */}
      <section className="section-padding bg-background">
        <div className="container grid items-center gap-14 lg:grid-cols-2 lg:gap-20">

          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
              <Image
                src="https://cdn.jagonews24.com/media/imgAllNew/BG/2023March/cover-20241215152036.jpg"
                alt="Traditional bamboo hut in the hills of Mirinja, Bandarban"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <div className="absolute -bottom-6 -right-4 hidden max-w-[230px] rounded-xl border-4 border-background bg-primary p-6 text-white sm:block">
              <Mountain size={27} className="mb-3 text-accent-light" />

              <p className="font-display text-2xl">
                Lama, Bandarban
              </p>

              <p className="mt-2 text-xs leading-6 text-white/70">
                In the beautiful hill region of southeastern Bangladesh.
              </p>
            </div>
          </div>

          <div>
            <p className="section-eyebrow">
              Welcome to Lama Valley
            </p>

            <h2 className="section-title !text-[35px]">
              A Destination Inspired by the Beauty of the Hills
            </h2>

            <p className="mb-5 text-base leading-8 text-muted">
              Lama Valley Resort & Restaurant is a destination
              in Lama, Bandarban, created around the idea of
              enjoying a change of pace in a beautiful hill
              region of Bangladesh.
            </p>

            <p className="mb-5 text-base leading-8 text-muted">
              The surrounding landscape gives this part of
              Bandarban its distinctive character. Green
              hills, changing skies and the natural scenery
              of the region make Lama an appealing place
              for visitors looking to explore southeastern
              Bangladesh.
            </p>

            <p className="mb-8 text-base leading-8 text-muted">
              Through its accommodation and restaurant,
              Lama Valley brings together two important
              parts of a getaway: a place to stay and a
              place to enjoy food during your visit.
            </p>

            <div className="space-y-4">
              {highlights.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-primary">
                    <Leaf size={13} />
                  </span>

                  <p className="text-sm leading-6 text-foreground">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* =====================================
          LOCATION & SURROUNDINGS
      ====================================== */}
      <section className="section-padding bg-surface-muted">
        <div className="container">

          <div className="section-heading mb-14">
            <p className="section-eyebrow">
              Our Location
            </p>

            <h2 className="section-title !text-[35px]">
              The Natural Beauty of Lama, Bandarban
            </h2>

            <p className="section-description">
              Discover the landscape and character of one
              of Bangladesh's beautiful hill regions.
            </p>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-2">

            <div className="relative aspect-[16/11] overflow-hidden rounded-xl">
       <img
  src="https://www.kalbela.com/assets/gallery/2023/12/19/1702975987.png"
  alt="Misty hills and landscape of Mirinja Valley, Lama"
  className="h-full w-full object-cover"
/>
            </div>

            <div>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Compass size={27} />
              </div>

              <h3 className="mb-5 font-display text-3xl text-primary-dark">
                Explore the Charm of the Hill Tracts
              </h3>

              <p className="mb-5 text-base leading-8 text-muted">
                Lama is part of Bandarban district in
                southeastern Bangladesh, a region known
                for its hills, valleys and distinctive
                natural landscapes.
              </p>

              <p className="mb-7 text-base leading-8 text-muted">
                One notable destination in the Lama area
                is Mirinja Tourist Spot, recognised for
                its elevated viewpoint and surrounding
                hill scenery. It is part of the wider
                landscape that makes this region special.
              </p>

              <Link
                href="/contact"
                className="btn btn-primary"
              >
                Find Our Location
                <ArrowUpRight size={17} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================
          THE RESORT EXPERIENCE
      ====================================== */}
      <section className="section-padding bg-background">
        <div className="container">

          <div className="section-heading mb-14">
            <p className="section-eyebrow">
              What We Offer
            </p>

            <h2 className="section-title !text-[35px]">
              Discover the Lama Valley Experience
            </h2>

            <p className="section-description">
              Explore the different parts of your visit,
              from accommodation to dining.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {experiences.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-xl border border-border bg-surface p-8 transition-shadow duration-300 hover:shadow-soft"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-primary">
                    <Icon size={26} strokeWidth={1.6} />
                  </div>

                  <h3 className="mb-4 font-display text-2xl text-primary-dark">
                    {item.title}
                  </h3>

                  <p className="mb-7 text-sm leading-7 text-muted">
                    {item.description}
                  </p>

                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-accent"
                  >
                    {item.link}
                    <ArrowUpRight size={16} />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================
          CLOSING CTA
      ====================================== */}
      <section className="relative overflow-hidden bg-primary-dark py-24">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border border-white/10" />

        <div className="container relative z-10 text-center">
          <p className="section-eyebrow !text-accent-light">
            Your Next Getaway
          </p>

          <h2 className="mx-auto mb-6 max-w-3xl font-display !text-3xl leading-tight text-white sm:text-5xl">
            Experience Lama Valley for Yourself
          </h2>

          <p className="mx-auto mb-10 max-w-2xl text-base leading-8 text-white/70">
            Explore our accommodation and dining options
            and get in touch to plan your visit to Lama,
            Bandarban.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/booking"
              className="btn bg-accent px-8 text-primary-dark hover:bg-accent-light"
            >
              Book Your Stay
              <ArrowUpRight size={18} />
            </Link>

            <Link
              href="/contact"
              className="btn border border-white/50 bg-transparent px-8 text-white hover:bg-white hover:text-primary-dark"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
