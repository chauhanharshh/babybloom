"use client";

import { useState, useEffect, useRef } from "react";
import Image, { ImageProps } from "next/image";
import { ImageOff } from "lucide-react";

export interface LazyImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  containerClassName?: string;
  skeletonClassName?: string;
  showSkeleton?: boolean;
  fallbackText?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimizes Cloudinary URLs so the browser fetches pre-sized WebP/AVIF directly
 * from Cloudinary's fast edge CDN instead of waiting for Next.js /_next/image proxy.
 */
function optimizeImageSrc(src: ImageProps["src"], priority?: boolean): ImageProps["src"] {
  if (typeof src !== "string") return src;
  const trimmed = src.trim();
  if (!trimmed.includes("res.cloudinary.com") || !trimmed.includes("/upload/")) {
    return trimmed;
  }
  // Avoid double-injecting transformations if already present
  if (/\/upload\/[^/]*(f_auto|q_auto|w_\d+)/.test(trimmed)) {
    return trimmed;
  }
  const targetWidth = priority ? 1200 : 600;
  return trimmed.replace(
    "/upload/",
    `/upload/f_auto,q_auto:good,w_${targetWidth},c_limit/`
  );
}

export default function LazyImage({
  src,
  alt,
  fill,
  width,
  height,
  className = "",
  containerClassName = "",
  skeletonClassName = "",
  showSkeleton = true,
  fallbackText,
  priority = false,
  loading,
  sizes,
  quality,
  style,
  onLoad,
  onError,
  ...rest
}: LazyImageProps) {
  const optimizedSrc = optimizeImageSrc(src, priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const prevSrcRef = useRef(optimizedSrc);
  const imgElementRef = useRef<HTMLImageElement | null>(null);

  // Only reset loading state when the image URL genuinely changes
  useEffect(() => {
    if (prevSrcRef.current !== optimizedSrc) {
      prevSrcRef.current = optimizedSrc;
      setIsLoaded(false);
      setHasError(false);
    }

    // If image is already cached/complete in the DOM, mark loaded immediately (0ms)
    if (imgElementRef.current && imgElementRef.current.complete) {
      if (imgElementRef.current.naturalWidth > 0) {
        setIsLoaded(true);
      }
      return;
    }

    // Safety cap: never let the skeleton mask block the image for more than 900ms
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 900);

    return () => clearTimeout(timer);
  }, [optimizedSrc]);

  const srcStr = typeof optimizedSrc === "string" ? optimizedSrc : "";
  const isDirectImg =
    srcStr.startsWith("blob:") ||
    srcStr.startsWith("data:") ||
    srcStr.includes("res.cloudinary.com");

  const effectiveLoading = priority ? "eager" : loading || "eager";

  if (!optimizedSrc || hasError) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-3 text-center bg-pink-50/60 border border-dashed border-pink-200/80 rounded-xl select-none ${containerClassName}`}
        style={style}
      >
        <div className="w-8 h-8 rounded-full bg-white shadow-2xs flex items-center justify-center text-[#ff2b75] mb-1.5">
          <ImageOff size={15} />
        </div>
        <span className="text-[11px] font-bold text-gray-700 leading-tight line-clamp-1 max-w-[85%]">
          {alt || fallbackText || "Image unavailable"}
        </span>
        <span className="text-[9px] text-pink-500 font-medium mt-0.5">
          Babybloom
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${fill ? "w-full h-full" : "inline-block"} ${containerClassName}`}
      style={style}
    >
      {/* Lightweight Skeleton Placeholder (disappears immediately when loaded or after max 900ms) */}
      {showSkeleton && !isLoaded && (
        <div
          className={`absolute inset-0 z-10 bg-pink-50/70 animate-pulse pointer-events-none transition-opacity duration-150 ${
            isLoaded ? "opacity-0" : "opacity-100"
          } ${skeletonClassName}`}
          aria-hidden="true"
        />
      )}

      {isDirectImg ? (
        // Direct CDN / Data / Blob image (bypasses slow Next.js /_next/image server proxy)
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={(node) => {
            imgElementRef.current = node;
            if (node && node.complete && node.naturalWidth > 0 && !isLoaded) {
              setIsLoaded(true);
            }
          }}
          src={srcStr}
          alt={alt}
          loading={effectiveLoading}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => {
            setIsLoaded(true);
            onLoad?.();
          }}
          onError={() => {
            setHasError(true);
            onError?.();
          }}
          className={`${fill ? "w-full h-full object-cover" : ""} transition-opacity duration-150 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
        />
      ) : (
        <Image
          ref={(node) => {
            imgElementRef.current = node;
            if (node && node.complete && node.naturalWidth > 0 && !isLoaded) {
              setIsLoaded(true);
            }
          }}
          src={optimizedSrc}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          priority={priority}
          loading={effectiveLoading}
          sizes={sizes || (fill ? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" : undefined)}
          quality={quality || 75}
          onLoad={() => {
            setIsLoaded(true);
            onLoad?.();
          }}
          onError={() => {
            setHasError(true);
            onError?.();
          }}
          className={`transition-opacity duration-150 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          {...rest}
        />
      )}
    </div>
  );
}
