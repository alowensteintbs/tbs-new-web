"use client";

import Image from "next/image";
import { useState } from "react";

export function PartnersStrip() {
  return (
    <div className="relative h-[18px] w-full shrink-0 overflow-hidden xl:h-[27px]" aria-label="Empresas colaboradoras">
      <div className="tbs-partners-track h-[18px] xl:h-[27px]">
        {[0, 1, 2, 3, 4].map((copy) => (
          <div
            key={copy}
            className="relative h-[18px] w-[570px] shrink-0 overflow-hidden xl:h-[27px] xl:w-[843px]"
          >
            <Image
              src="/home/alianzas.svg"
              alt={copy === 0 ? "ED, Taxdown, Zumitow, Renta4Banco, TradingView y UTAMED" : ""}
              aria-hidden={copy !== 0}
              width={2478}
              height={27}
              className="absolute left-0 top-0 h-[18px] w-[1676px] max-w-none xl:h-[27px] xl:w-[2478px]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function VideoShowcase({
  showPartners = true,
  poster = "https://i.ytimg.com/vi/4nfPF4XUc7M/sddefault.jpg",
  className = "",
}: { showPartners?: boolean; poster?: string; className?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className={`flex h-[521px] w-full flex-col gap-[10px] rounded-[40px] bg-white/10 p-2 backdrop-blur-sm xl:h-auto xl:gap-5 ${className}`}>
      <div className="relative h-[477px] w-full shrink-0 overflow-hidden rounded-[32px] xl:h-auto xl:aspect-[1424/801]">
        {isPlaying ? (
          <iframe
            className="absolute inset-0 size-full border-0"
            src="https://www.youtube-nocookie.com/embed/4nfPF4XUc7M?autoplay=1&rel=0"
            title="Presentación de Traders Business School"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
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
        )}
      </div>
      {showPartners && <PartnersStrip />}
    </section>
  );
}
