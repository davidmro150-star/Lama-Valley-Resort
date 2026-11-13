
"use client";

import { useEffect, useState } from "react";
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

const iconMap = {
  bed: BedDouble,
  utensils: Utensils,
  mountain: Mountain,
};

const defaultContent = {
  heroEyebrow: "Our Story & Our Place",
  heroTitle: "Discover Lama Valley",
  heroDescription:
    "A resort and restaurant destination in Lama, Bandarban, surrounded by the distinctive landscapes of the Chittagong Hill Tracts.",
  heroLocation: "Lama, Bandarban, Bangladesh",
  heroImage: "",
  heroImageAlt: "Mirinja Valley landscape in Lama, Bandarban",

  introEyebrow: "Welcome to Lama Valley",
  introTitle: "A Destination Inspired by the Beauty of the Hills",
  introImage: "",
  introImageAlt: "Lama Valley Resort surrounded by natural scenery",
  introParagraphs: [],
  highlights: [],

  locationEyebrow: "Our Location",
  locationTitle: "The Natural Beauty of Lama, Bandarban",
  locationDescription:
    "Discover the landscape and character of one of Bangladesh's beautiful hill regions.",
  locationImage: "",
  locationImageAlt: "Misty hills and landscape of Mirinja Valley, Lama",
  locationHeading: "Explore the Charm of the Hill Tracts",
  locationParagraphs: [],
  locationButtonText: "Find Our Location",
  locationButtonLink: "/contact",

  experiencesEyebrow: "What We Offer",
  experiencesTitle: "Discover the Lama Valley Experience",
  experiencesDescription:
    "Explore the different parts of your visit, from accommodation to dining.",
  experiences: [],

  ctaEyebrow: "Your Next Getaway",
  ctaTitle: "Experience Lama Valley for Yourself",
  ctaDescription:
    "Explore our accommodation and dining options and get in touch to plan your visit to Lama, Bandarban.",
  ctaPrimaryText: "Book Your Stay",
  ctaPrimaryLink: "/stays",
  ctaSecondaryText: "Contact Us",
  ctaSecondaryLink: "/contact",
};

export default function AboutPageContent() {
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        const response = await fetch("/api/about-page", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Unable to load About Page content.");
        }

        setContent({
          ...defaultContent,
          ...data.aboutPage,
        });
      } catch (error) {
        console.error("About Page loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-[500px] items-center justify-center">
        <p className="text-sm text-muted">Loading About Us...</p>
      </main>
    );
  }

  return (
    <main>
      {/* PAGE HERO */}
      <section className="relative flex min-h-[480px] items-center bg-primary-dark">
        {content.heroImage && (
          <img
            src={content.heroImage}
            alt={content.heroImageAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />

        <div className="container relative z-10 py-28">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent-light">
              <span className="h-px w-10 bg-accent" />
              {content.heroEyebrow}
            </div>

            <h1 className="mb-7 font-display text-5xl leading-tight text-white sm:text-6xl lg:text-7xl">
              {content.heroTitle}
            </h1>

            <p className="max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
              {content.heroDescription}
            </p>

            <div className="mt-9 flex items-center gap-2 text-sm text-white/80">
              <MapPin size={17} className="text-accent-light" />
              {content.heroLocation}
            </div>
          </div>
        </div>
      </section>

      {/* INTRODUCTION / OUR STORY */}
      <section className="section-padding bg-background">
        <div className="container grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-muted">
              {content.introImage && (
                <img
                  src={content.introImage}
                  alt={content.introImageAlt}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
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
              {content.introEyebrow}
            </p>

            <h2 className="section-title !text-[35px]">
              {content.introTitle}
            </h2>

            {(content.introParagraphs || []).map((paragraph, index) => (
              <p
                key={index}
                className="mb-5 text-base leading-8 text-muted"
              >
                {paragraph}
              </p>
            ))}

            <div className="space-y-4">
              {(content.highlights || []).map((item, index) => (
                <div key={index} className="flex items-start gap-3">
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

      {/* LOCATION & SURROUNDINGS */}
      <section className="section-padding bg-surface-muted">
        <div className="container">
          <div className="section-heading mb-14">
            <p className="section-eyebrow">
              {content.locationEyebrow}
            </p>

            <h2 className="section-title !text-[35px]">
              {content.locationTitle}
            </h2>

            <p className="section-description">
              {content.locationDescription}
            </p>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="relative aspect-[16/11] overflow-hidden rounded-xl bg-background">
              {content.locationImage && (
                <img
                  src={content.locationImage}
                  alt={content.locationImageAlt}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>

            <div>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Compass size={27} />
              </div>

              <h3 className="mb-5 font-display text-3xl text-primary-dark">
                {content.locationHeading}
              </h3>

              {(content.locationParagraphs || []).map((paragraph, index) => (
                <p
                  key={index}
                  className="mb-5 text-base leading-8 text-muted"
                >
                  {paragraph}
                </p>
              ))}

              <Link
                href={content.locationButtonLink || "/contact"}
                className="btn btn-primary"
              >
                {content.locationButtonText}
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* THE RESORT EXPERIENCE */}
      <section className="section-padding bg-background">
        <div className="container">
          <div className="section-heading mb-14">
            <p className="section-eyebrow">
              {content.experiencesEyebrow}
            </p>

            <h2 className="section-title !text-[35px]">
              {content.experiencesTitle}
            </h2>

            <p className="section-description">
              {content.experiencesDescription}
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {(content.experiences || []).map((item, index) => {
              const Icon = iconMap[item.icon] || Mountain;

              return (
                <article
                  key={item._id || index}
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
                    href={item.href || "/"}
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

      {/* CLOSING CTA */}
      <section className="relative overflow-hidden bg-primary-dark py-24">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border border-white/10" />

        <div className="container relative z-10 text-center">
          <p className="section-eyebrow !text-accent-light">
            {content.ctaEyebrow}
          </p>

          <h2 className="mx-auto mb-6 max-w-3xl font-display !text-3xl leading-tight text-white sm:text-5xl">
            {content.ctaTitle}
          </h2>

          <p className="mx-auto mb-10 max-w-2xl text-base leading-8 text-white/70">
            {content.ctaDescription}
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            {/* Always send guests to the stays page */}
            <Link
              href="/stays"
              className="btn bg-accent px-8 text-primary-dark hover:bg-accent-light"
            >
              {content.ctaPrimaryText}
              <ArrowUpRight size={18} />
            </Link>

            <Link
              href={content.ctaSecondaryLink || "/contact"}
              className="btn border border-white/50 bg-transparent px-8 text-white hover:bg-white hover:text-primary-dark"
            >
              {content.ctaSecondaryText}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
