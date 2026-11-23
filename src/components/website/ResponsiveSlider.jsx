
"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ResponsiveSlider({ children }) {
  const sliderRef = useRef(null);

  const slide = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const firstCard = slider.firstElementChild;
    if (!firstCard) return;

    const styles = window.getComputedStyle(slider);
    const gap = parseFloat(styles.columnGap) || 0;
    const cardWidth = firstCard.getBoundingClientRect().width;

    slider.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: "smooth",
    });
  };

  return (
    <div className="grid w-full min-w-0 grid-cols-[36px_minmax(0,1fr)_36px] items-center gap-2 sm:grid-cols-[44px_minmax(0,1fr)_44px] sm:gap-3">

      {/* Previous Button */}
      <button
        type="button"
        onClick={() => slide(-1)}
        aria-label="Previous cottages"
        className="z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-primary hover:bg-primary hover:text-white sm:h-11 sm:w-11"
      >
        <ChevronLeft size={22} />
      </button>

      {/* Slider Container */}
      <div
        ref={sliderRef}
        className="flex min-w-0 gap-7 overflow-x-auto scroll-smooth snap-x snap-mandatory overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={() => slide(1)}
        aria-label="Next cottages"
        className="z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-primary hover:bg-primary hover:text-white sm:h-11 sm:w-11"
      >
        <ChevronRight size={22} />
      </button>

    </div>
  );
}
