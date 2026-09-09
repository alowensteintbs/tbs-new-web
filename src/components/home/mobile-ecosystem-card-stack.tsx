"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type EcosystemCardData = {
  logo: string;
  logoAlt: string;
  logoWidth: number;
  logoHeight: number;
  title: string;
  description: string;
  tall?: boolean;
};

const CARD_HEIGHT = 380;
const EDGE_PEEK = 13;
const MAX_DEPTH = 3;
const STICKY_TOP = 64;
const TRAVEL = 460;
const PEEL_DISTANCE = 440;
const STACK_HEIGHT = CARD_HEIGHT + MAX_DEPTH * EDGE_PEEK;

function MobileEcosystemCard({ logo, logoAlt, logoWidth, logoHeight, title, description }: EcosystemCardData) {
  return (
    <article className="flex h-[380px] flex-col justify-between rounded-[24px] border-0 border-b-[3px] border-b-[#0066ff] bg-[#f0f0f0] p-6">
      <div className="order-2 mt-12">
        <h3 className="font-space text-2xl font-bold leading-5 text-[#323436]">{title}</h3>
        <p className="mt-3 font-space text-xl leading-6 tracking-[-0.4px] text-[#323436]">{description}</p>
      </div>
      <Image src={logo} alt={logoAlt} width={logoWidth} height={logoHeight} className="order-1 h-auto max-w-full object-contain object-left-top" />
    </article>
  );
}

export function MobileEcosystemCardStack({ cards }: { cards: EcosystemCardData[] }) {
  const runwayRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stackCards = cards.slice(1);
  const runwayHeight = STACK_HEIGHT + (stackCards.length - 1) * TRAVEL;

  useEffect(() => {
    const runway = runwayRef.current;
    if (!runway) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const progress = Math.min(Math.max((STICKY_TOP - runway.getBoundingClientRect().top) / TRAVEL, 0), stackCards.length - 1);
      cardRefs.current.forEach((element, index) => {
        if (!element) return;
        const depth = index - progress;
        element.style.transform = depth >= 0
          ? `translateY(${Math.min(depth, MAX_DEPTH) * EDGE_PEEK}px)`
          : `translateY(${depth * PEEL_DISTANCE}px)`;
        element.style.opacity = depth >= 0 ? "1" : String(Math.max(1 + depth, 0));
      });
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [stackCards.length]);

  return (
    <div className="mt-[60px] md:hidden">
      <MobileEcosystemCard {...cards[0]} />
      <div ref={runwayRef} className="relative mt-6" style={{ height: runwayHeight }}>
        <div className="sticky" style={{ top: STICKY_TOP, height: STACK_HEIGHT }}>
          {stackCards.map((card, index) => (
            <div
              key={card.title + card.logoAlt}
              ref={(element) => { cardRefs.current[index] = element; }}
              className={cn("absolute inset-x-0 top-0 will-change-transform")}
              style={{ zIndex: stackCards.length - index, transform: `translateY(${Math.min(index, MAX_DEPTH) * EDGE_PEEK}px)` }}
            >
              <MobileEcosystemCard {...card} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
