import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "About Us",
  description:
    "Discover Lama Valley Resort & Restaurant in Lama, Bandarban.",
};

export default function AboutPage() {
  return (
    <main>
      {/* Page Hero */}
      <section className="relative flex min-h-[400px] items-center bg-primary-dark">
   

        <div className="absolute inset-0 bg-black/60" />

        <div className="container relative z-10 py-24 text-center">
          <p className="section-eyebrow !text-accent-light">
            Discover Lama Valley
          </p>

          <h1 className="mb-5 font-display text-5xl text-white sm:text-6xl">
            About Our Resort
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-8 text-white/80">
            A peaceful destination in the beautiful hills of
            Lama, Bandarban, Bangladesh.
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="section-padding bg-background">
        <div className="container grid items-center gap-14 lg:grid-cols-2 lg:gap-20">

          <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
            <Image
              src="https://images.unsplash.com/photo-1510798831971-661eb04b3739"
              alt="Wooden cottage surrounded by nature"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
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
              & Restaurant is presented as a destination for
              visitors looking to enjoy the natural surroundings
              and peaceful atmosphere of the hills.
            </p>

            <p className="mb-8 text-base leading-8 text-muted">
              Whether you are planning a short getaway or a
              relaxing visit with family and friends, discover
              the charm of the surrounding landscape.
            </p>

            <Link href="/booking" className="btn btn-primary">
              Plan Your Visit
              <ArrowUpRight size={17} />
            </Link>
          </div>

        </div>
      </section>

      {/* Closing Section */}
      <section className="section-padding bg-surface-muted">
        <div className="container text-center">
          <p className="section-eyebrow">Your Next Getaway</p>

          <h2 className="section-title !text-[35px]">
            Discover Lama Valley
          </h2>

          <p className="section-description mx-auto mb-8 max-w-2xl">
            Explore our accommodation and dining options
            and plan your visit to Lama, Bandarban.
          </p>

          <Link href="/booking" className="btn btn-primary">
            Book Your Stay
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}