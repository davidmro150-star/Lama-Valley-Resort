
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import connectDB from "@/lib/mongodb";
import AboutPage from "@/models/Aboutpage";

export default async function AboutSection() {
  let aboutPage = null;

  try {
    await connectDB();

    aboutPage = await AboutPage.findOne()
      .select("introImage introImageAlt")
      .lean();
  } catch (error) {
    console.error("Homepage About image error:", error);
  }

  const imageUrl = aboutPage?.introImage;
  const imageAlt =
    aboutPage?.introImageAlt ||
    "Lama Valley Resort surrounded by natural scenery";

  return (
    <section className="section-padding bg-background">
      <div className="container grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
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

        <div>
          <p className="section-eyebrow">
            Welcome to Lama Valley
          </p>

          <h2 className="section-title !text-[35px]">
            Experience the Beauty of the Hills
          </h2>

          <p className="mb-5 text-base leading-8 text-muted">
            Located in Lama, Bandarban, Lama Valley Resort
            & Restaurant is a destination for visitors looking
            to enjoy the natural surroundings and peaceful
            atmosphere of the hills.
          </p>

          <p className="mb-8 text-base leading-8 text-muted">
            Whether you are planning a short getaway or a
            relaxing visit with family and friends, discover
            the charm of the surrounding landscape.
          </p>

          <Link href="/about" className="btn btn-primary">
            Discover More
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
