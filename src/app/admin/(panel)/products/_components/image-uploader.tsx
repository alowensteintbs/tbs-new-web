"use client";

import Image from "next/image";
import { useState, useTransition } from "react";

export type ProductImageValue = { url: string; alt: string | null };

/**
 * Uploads images (via /admin/api/upload) and tracks the resulting public URLs.
 * The URLs are submitted with the product form as `image_url[]` / `image_alt[]`
 * hidden inputs, in order.
 */
export function ImageUploader({
  initialImages,
}: {
  initialImages: ProductImageValue[];
}) {
  const [images, setImages] = useState<ProductImageValue[]>(initialImages);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    startTransition(async () => {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/admin/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Error al subir la imagen.");
          return;
        }
        setImages((prev) => [...prev, { url: data.url, alt: null }]);
      }
    });
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {images.map((img, idx) => (
            <li key={img.url} className="relative">
              <input type="hidden" name="image_url" value={img.url} />
              <input type="hidden" name="image_alt" value={img.alt ?? ""} />
              <div className="h-24 w-24 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <Image
                  src={img.url}
                  alt={img.alt ?? ""}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white shadow hover:bg-red-700"
                aria-label="Quitar imagen"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          disabled={isPending}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {isPending ? "Subiendo…" : "Subir imágenes"}
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
