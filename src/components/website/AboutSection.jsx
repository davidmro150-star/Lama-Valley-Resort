
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

export default function AboutSection() {
  const highlights = [
    "Surrounded by the natural beauty of Bandarban",
    "A peaceful setting away from busy city life",
    "A place to enjoy nature, relaxation and dining",
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container grid items-center gap-14 lg:grid-cols-2 lg:gap-20">

        {/* Image */}
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
            <Image
              src="https://images.unsplash.com/photo-1448375240586-882707db888b"
              alt="Green forest and mountain nature in Bandarban"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="absolute -bottom-6 -right-4 hidden w-48 rounded-xl border-4 border-background bg-primary p-5 text-white sm:block">
            <p className="font-display text-3xl">Lama</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-white/80">
              Bandarban, Bangladesh
            </p>
          </div>
        </div>

        {/* Content */}
        <div>
          <p className="section-eyebrow">
            Welcome to Lama Valley
          </p>

          <h2 className="section-title text-left">
            A Peaceful Escape in the Heart of the Hills
          </h2>

          <p className="mb-5 text-base leading-8 text-muted">
            Discover the natural beauty of Lama, Bandarban.
            Surrounded by green hills and peaceful landscapes,
            Lama Valley offers a welcoming place to relax,
            reconnect with nature and enjoy a refreshing escape.
          </p>

          <p className="mb-8 text-base leading-8 text-muted">
            Whether you are planning a quiet getaway or a
            memorable visit with family and friends, experience
            the charm of the hills at Lama Valley Resort & Restaurant.
          </p>

          <div className="mb-10 space-y-4">
            {highlights.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-primary">
                  <Check size={13} />
                </span>
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>

          <Link
            href="/about"
            className="btn btn-primary"
          >
            Discover Our Story
            <ArrowUpRight size={17} />
          </Link>
        </div>

      </div>
    </section>
  );
}
