
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function AboutSection() {
  return (
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
