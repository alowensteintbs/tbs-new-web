"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type GalleryImage = { url: string; alt: string | null };

export function ProductGallery({
  images,
  name,
}: {
  images: GalleryImage[];
  name: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-400">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
        <Image
          src={images[active].url}
          alt={images[active].alt ?? name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, idx) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(idx)}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-lg border",
                idx === active ? "border-blue-500" : "border-gray-200"
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${name} ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
