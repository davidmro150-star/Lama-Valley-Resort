
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";

export default function CottageGallery({ images, cottageName }) {
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const hasImages = images && images.length > 0;
  const imageCount = images?.length || 0;

  const showPrevious = () => {
    setActiveImage((current) =>
      current === 0 ? imageCount - 1 : current - 1
    );
  };

  const showNext = () => {
    setActiveImage((current) =>
      current === imageCount - 1 ? 0 : current + 1
    );
  };

  // Keyboard navigation and Escape key
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, imageCount]);

  if (!hasImages) {
    return (
      <div className="flex min-h-[350px] items-center justify-center rounded-xl bg-surface-muted text-muted">
        No cottage photos available
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">

        {/* Main Image */}
        <div
          className="group relative aspect-[16/9] cursor-pointer overflow-hidden rounded-xl bg-surface-muted"
          onClick={() => setIsLightboxOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Open full-screen photo gallery"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsLightboxOpen(true);
            }
          }}
        >
          <Image
            src={images[activeImage]}
            alt={`${cottageName} - Photo ${activeImage + 1}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 75vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
            <span className="flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Maximize2 size={16} />
              View Full Screen
            </span>
          </div>

          <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-4 py-2 text-xs text-white">
            {activeImage + 1} / {imageCount}
          </span>
        </div>

        {/* Thumbnail Gallery */}
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(index)}
              aria-label={`View photo ${index + 1}`}
              aria-pressed={activeImage === index}
              className={`relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition-all ${activeImage === index
                  ? "border-accent opacity-100"
                  : "border-transparent opacity-70 hover:opacity-100"
                }`}
            >
              <Image
                src={image}
                alt={`${cottageName} thumbnail ${index + 1}`}
                fill
                sizes="150px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Full-Screen Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${cottageName} photo gallery`}
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close gallery"
            className="absolute right-5 top-5 z-20 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          >
            <X size={25} />
          </button>

          {/* Previous Button */}
          {imageCount > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Large Image */}
          <div
            className="relative h-[75vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={images[activeImage]}
              alt={`${cottageName} - Photo ${activeImage + 1}`}
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {/* Next Button */}
          {imageCount > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:right-6"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/80">
            {cottageName} — {activeImage + 1} / {imageCount}
          </div>
        </div>
      )}
    </>
  );
}
