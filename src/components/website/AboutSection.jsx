
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import connectDB from "@/lib/mongodb";
import AboutPage from "@/models/Aboutpage";
import HomePage from "@/models/HomePage";

export const dynamic = "force-dynamic";

export default async function AboutSection() {
  let aboutPage = null;
  let homePage = null;

  try {
    await connectDB();

    const results = await Promise.all([
      AboutPage.findOne()
        .select("introImage introImageAlt")
        .lean(),

      HomePage.findOne()
        .select("aboutSection")
        .lean(),
    ]);

    aboutPage = results[0];
    homePage = results[1];
  } catch (error) {
    console.error("Homepage About section error:", error);
  }

  const content = homePage?.aboutSection || {};

  // Prefer the homepage image, then use the About page image.
  const imageUrl =
    content.image || aboutPage?.introImage || "";

  const imageAlt =
    content.imageAlt ||
    aboutPage?.introImageAlt ||
    "Lama Valley Resort surrounded by natural scenery";

  return (
    <section className="section-padding !pb-10 sm:!pb-16 bg-background">
      <div className="container grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* About Image */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-center text-muted">
              <p className="p-6">
                Upload an Introduction Image from the Admin Dashboard.
              </p>
            </div>
          )}
        </div>

        {/* About Content */}
        <div>
          <p className="section-eyebrow">
            {content.eyebrow || "Welcome to Lama Valley"}
          </p>

          <h2 className="section-title !text-[20px] sm:!text-[35px]">
            {content.title || "Experience the Beauty of the Hills"}
          </h2>

          <p className="mb-5 text-[14px] sm:text-base leading-8 text-muted">
            {content.description ||
              "Located in Lama, Bandarban, Lama Valley Resort & Restaurant is a destination for visitors looking to enjoy the natural surroundings and peaceful atmosphere of the hills."}
          </p>

          <p className="mb-8 text-[14px] sm:text-base leading-8 text-muted">
            {content.description2 ||
              "Whether you are planning a short getaway or a relaxing visit with family and friends, discover the charm of the surrounding landscape."}
          </p>

          <Link
            href={content.buttonLink || "/about"}
            className="btn btn-primary  hero-btn"
          >
            {content.buttonText || "Discover More"}
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
