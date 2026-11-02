
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Six local-area background images
const heroImages = [
  // Mirinja Valley — Lama
  {
    src: "https://www.kalbela.com/assets/gallery/2023/12/19/1702975987.png",
    alt: "Hilltop camping and misty mountain views at Mirinja Valley",
  },
  {
    src: "https://www.dailymessenger.net/media/imgAll/2022February/en/mirinja-2310180741.jpg",
    alt: "Green hilltop landscape at Mirinja Valley",
  },
  {
    src: "https://english.khaborerkagoj.com/uploads/2025/06/17/1750156102.valley.jpg",
    alt: "Hilltop viewpoint overlooking Mirinja Valley",
  },

  // Dim Pahar — Bandarban
  {
    src: "https://cdn.rtvonline.com/media/images/2023/02/10/image-211405-1676023657.jpg",
    alt: "Winding mountain road through the green hills of Dim Pahar",
  },
  {
    src: "https://www.travelmate.com.bd/wp-content/uploads/2021/03/Dim-Pahar-Bandarban.jpg",
    alt: "Cloud-covered mountain ridge at Dim Pahar",
  },
  {
    src: "https://adarbepari.com/wp-content/uploads/2017/02/dim-pahar-alikadam-bandarban.jpg",
    alt: "Green mountain scenery at Dim Pahar, Bandarban",
  },
];

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  // Automatic slider
  useEffect(() => {
    const sliderInterval = setInterval(() => {
      setActiveSlide((previous) => (previous + 1) % heroImages.length);
    }, 2000);

    return () => clearInterval(sliderInterval);
  }, []);

  // Previous slide
  const previousSlide = () => {
    setActiveSlide((previous) =>
      previous === 0 ? heroImages.length - 1 : previous - 1
    );
  };

  // Next slide
  const nextSlide = () => {
    setActiveSlide((previous) => (previous + 1) % heroImages.length);
  };

  return (
    <section className="relative isolate flex min-h-[680px] items-center bg-primary-dark">

      {/* Background Image Slider */}
      {heroImages.map((image, index) => (
        <div
          key={image.src}
          className={`absolute inset-0 transition-opacity duration-100 ease-in-out ${activeSlide === index ? "opacity-100" : "opacity-0"
            }`}
        >
          <Image
            src={image.src}
            alt={activeSlide === index ? image.alt : ""}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/10" />
      <div className="absolute inset-0 bg-black/10" />

      {/* Hero Content */}
      <div className="container relative z-10 py-24">
        <div className="max-w-3xl">
          <p className="mb-6 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent-light">
            <span className="h-px w-10 bg-accent" />
            Lama, Bandarban, Bangladesh
          </p>

          <h1 className="mb-7 font-display text-5xl leading-[1.12] text-white sm:text-6xl lg:text-7xl">
            Find Your Peace
            <br />
            Among the Hills.
          </h1>

          <p className="mb-10 max-w-xl text-base leading-8 text-white/85 sm:text-lg">
            Step away from the everyday and discover the natural beauty
            of Lama, Bandarban. A place to slow down, reconnect and
            experience the hills.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/booking"
              className="btn inline-flex min-h-14 bg-accent px-7 text-primary-dark hover:bg-accent-light"
            >
              Book Your Stay
              <ArrowUpRight size={18} />
            </Link>

            <Link
              href="/about"
              className="btn inline-flex min-h-14 border border-white/70 bg-[#234b3b] px-7 !text-white transition-colors hover:bg-white hover:!text-primary-dark"
            >
              Explore the Resort
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

   

      {/* Slider Controls */}
      <div className="absolute bottom-7 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 sm:left-auto lg:right-25 sm:right-8 sm:translate-x-0">

        {/* Previous Button */}
        <button
          type="button"
          onClick={previousSlide}
          aria-label="Previous background image"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 text-white transition-colors hover:bg-white hover:text-primary-dark"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Slide Indicators */}
        <div className="flex items-center gap-2">
          {heroImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={activeSlide === index ? "true" : undefined}
              className={`h-2 rounded-full transition-all duration-300 ${activeSlide === index
                  ? "w-7 bg-accent"
                  : "w-2 bg-white/60 hover:bg-white"
                }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next background image"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 text-white transition-colors hover:bg-white hover:text-primary-dark"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
