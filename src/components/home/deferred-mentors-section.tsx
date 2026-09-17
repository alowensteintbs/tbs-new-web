"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const MentorsCarousel = dynamic(
  () => import("./mentors-section").then((module) => module.MentorsCarousel),
  { ssr: false },
);

export function DeferredMentorsSection({ variant = "home" }: { variant?: "home" | "platform" }) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const markerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || !("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setShouldLoad(true);
      observer.disconnect();
    }, { rootMargin: "600px 0px" });
    observer.observe(marker);
    return () => observer.disconnect();
  }, []);

  return <div ref={markerRef} className={variant === "platform" ? "min-h-[966px]" : "min-h-[986px]"}>{shouldLoad && <MentorsCarousel variant={variant} />}</div>;
}
