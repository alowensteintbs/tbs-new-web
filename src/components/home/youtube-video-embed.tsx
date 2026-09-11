"use client";

import Image from "next/image";
import { useState } from "react";

export function YoutubeVideoEmbed({ poster }: { poster: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (isPlaying) {
    return (
      <iframe
        className="absolute inset-0 size-full border-0"
        src="https://www.youtube-nocookie.com/embed/4nfPF4XUc7M?autoplay=1&rel=0"
        title="Presentación de Traders Business School"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  return (
    <button type="button" onClick={() => setIsPlaying(true)} className="group absolute inset-0 block size-full" aria-label="Reproducir presentación de Traders Business School">
      <Image
        src={poster}
        alt="Presentación de Traders Business School"
        fill
        priority
        sizes="(min-width: 1280px) 1424px, 377px"
        className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
      />
      <span className="absolute inset-0 bg-black/10 transition group-hover:bg-black/20" aria-hidden="true" />
      <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/80 shadow-[0_4px_16px_rgb(0_0_0_/_30%)] transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
        <span className="ml-1 h-0 w-0 border-y-[9px] border-y-transparent border-l-[14px] border-l-[#1f1e23]" />
      </span>
    </button>
  );
}
