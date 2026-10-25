"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { Sparkles, ImageOff } from "lucide-react";

export interface LazyImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  containerClassName?: string;
  skeletonClassName?: string;
  showSkeleton?: boolean;
  fallbackText?: string;
  onLoad?: () => void;
  onError?: () => void;
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset states if src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const isBlob = typeof src === "string" && src.startsWith("blob:");
  const effectiveLoading = priority ? "eager" : loading || "lazy";

  if (!src || hasError) {
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
      {/* Animated Skeleton Shimmer Placeholder */}
      {showSkeleton && !isLoaded && (
        <div
          className={`absolute inset-0 z-10 bg-gradient-to-r from-pink-50/90 via-pink-100/60 to-pink-50/90 animate-shimmer flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
            isLoaded ? "opacity-0" : "opacity-100"
          } ${skeletonClassName}`}
          aria-hidden="true"
        >
          <div className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-2xs flex items-center justify-center text-pink-400/80 animate-pulse">
            <Sparkles size={16} />
          </div>
        </div>
      )}

      {/* Actual Image with smooth fade-in */}
      {isBlob ? (
        // Native img fallback for local preview blob URLs
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt={alt}
          loading={effectiveLoading}
          onLoad={() => {
            setIsLoaded(true);
            onLoad?.();
          }}
          onError={() => {
            setHasError(true);
            onError?.();
          }}
          className={`${fill ? "w-full h-full object-cover" : ""} transition-all duration-500 ease-out ${
            isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-[0.98] blur-[2px]"
          } ${className}`}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          priority={priority}
          loading={effectiveLoading}
          sizes={sizes || (fill ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" : undefined)}
          quality={quality}
          onLoad={() => {
            setIsLoaded(true);
            onLoad?.();
          }}
          onError={() => {
            setHasError(true);
            onError?.();
          }}
          className={`transition-all duration-500 ease-out ${
            isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-[0.98] blur-[2px]"
          } ${className}`}
          {...rest}
        />
      )}
    </div>
  );
}
