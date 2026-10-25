"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LazyImage from "@/components/LazyImage";

export interface Banner {
  id: number;
  image: string;
  href: string;
  alt: string;
}

// High-resolution FirstCry-style banners for Babybloom
const DEFAULT_BANNERS: Banner[] = [
  {
    id: 1,
    image: "/images/banners/babybloom-hero-banner.png",
    href: "/shop",
    alt: "Babybloom - Dress Your Little Ones in Style & Smile",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=2000&q=85",
    href: "/shop",
    alt: "Babybloom Festive Collection - Flat Discount on Premium Kids Wear",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=2000&q=85",
    href: "/girls",
    alt: "Girls Wear Frocks & Party Dresses",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=2000&q=85",
    href: "/boys",
    alt: "Boys Fashion Sets, Tees and Dungarees",
  },
];

interface HeroSliderProps {
  banners?: Banner[];
}

export default function HeroSlider({ banners = DEFAULT_BANNERS }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const hasMovedRef = useRef<boolean>(false);

  const total = banners.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-play timer (resumes when not hovered/touched)
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, total]);

  // Touch Swipe Handlers for mobile friendliness
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = e.touches[0].clientX;
    hasMovedRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
    if (touchStartXRef.current !== null) {
      const diff = Math.abs(touchEndXRef.current - touchStartXRef.current);
      if (diff > 10) {
        hasMovedRef.current = true;
      }
    }
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Previous
      prevSlide();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "ArrowRight") nextSlide();
  };

  return (
    <section
      role="region"
      aria-label="Promotional Hero Banners"
      className="relative w-full bg-white select-none overflow-hidden group pb-2 sm:pb-3"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
    >
      {/* 
        Fluid Responsive Container:
        - Mobile: aspect-[2.33/1] matches exact mockup banner ratio
        - Desktop: aspect-[24/9] max-h-[500px]
      */}
      <div className="relative w-full aspect-[2.33/1] sm:aspect-[21/9] md:aspect-[24/9] xl:aspect-[2.7/1] max-h-[500px] overflow-hidden">
        
        {/* Animated Slide Track */}
        <div
          className="flex w-full h-full transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="relative w-full h-full shrink-0 flex-shrink-0"
              aria-hidden={index !== currentIndex}
            >
              <Link
                href={banner.href}
                className="block relative w-full h-full cursor-pointer"
                onClick={(e) => {
                  // Prevent click if user was swiping/dragging
                  if (hasMovedRef.current) {
                    e.preventDefault();
                  }
                }}
              >
                <LazyImage
                  src={banner.image}
                  alt={banner.alt}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="object-cover object-center w-full h-full"
                  sizes="100vw"
                />
              </Link>
            </div>
          ))}
        </div>

        {/* Previous Button (Left Arrow - hidden on mobile, swipe is primary) */}
        {total > 1 && (
          <button
            type="button"
            onClick={prevSlide}
            className="hidden sm:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm border border-white/50 items-center justify-center text-gray-800 hover:text-[#ff2b75] hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button (Right Arrow - hidden on mobile, swipe is primary) */}
        {total > 1 && (
          <button
            type="button"
            onClick={nextSlide}
            className="hidden sm:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm border border-white/50 items-center justify-center text-gray-800 hover:text-[#ff2b75] hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

      </div>

      {/* Navigation Dots Indicator (Clean underneath the banner matching reference image) */}
      {total > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-2 sm:mt-2.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentIndex
                  ? "w-5 sm:w-6 h-1.5 bg-[#ff2b75]"
                  : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

