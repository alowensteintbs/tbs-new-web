"use client";

import { useEffect, useState } from "react";

type Testimonial = {
  title: string;
  summary: string;
  duration: string;
};

const testimonials: Testimonial[] = [
  {
    title: "La mejor decisión de aprendizaje sobre inversión",
    summary: "La calidad del audio es impresionante, cada detalle se escucha con una claridad asombrosa.",
    duration: "1:21",
  },
  {
    title: "La mejor decisión de aprendizaje sobre inversión",
    summary: "La calidad del audio es impresionante, cada detalle se escucha con una claridad asombrosa.",
    duration: "1:21",
  },
  {
    title: "La mejor decisión de aprendizaje sobre inversión",
    summary: "La calidad del audio es impresionante, cada detalle se escucha con una claridad asombrosa.",
    duration: "1:21",
  },
];

function SkipIcon({ direction }: { direction: "previous" | "next" }) {
  return (
    <span className={`flex h-3.5 items-center ${direction === "previous" ? "flex-row-reverse" : "flex-row"}`} aria-hidden="true">
      <span className={`h-0 w-0 border-y-[7px] border-y-transparent ${direction === "previous" ? "border-r-[9px] border-r-white" : "border-l-[9px] border-l-white"}`} />
      <span className="h-3.5 w-0.5 bg-white" />
    </span>
  );
}

function PlayIcon({ playing }: { playing: boolean }) {
  if (playing) {
    return <span className="flex gap-1" aria-hidden="true"><span className="h-4 w-1.5 bg-[#ffbe0a]" /><span className="h-4 w-1.5 bg-[#ffbe0a]" /></span>;
  }

  return <span className="h-0 w-0 border-y-[9px] border-y-transparent border-l-[14px] border-l-[#ffbe0a]" aria-hidden="true" />;
}

function TestimonialCard({ testimonial, playing }: { testimonial: Testimonial; playing: boolean }) {
  return (
    <article className="h-[203px] w-[425px] shrink-0 rounded-[32px] bg-[#1f1e23] p-6 shadow-[0_8px_0_rgb(0_0_0_/_25%)]">
      <div className="flex" aria-label="Cinco estrellas">
        {[0, 1, 2, 3, 4].map((star) => (
          <span key={star} className="grid size-[22px] place-items-center font-sans text-[23px] leading-none text-[#ffbe0a]">★</span>
        ))}
      </div>
      <div className="mt-2 flex items-start justify-between gap-3">
        <blockquote className="max-w-[315px] font-playfair text-[25px] italic leading-[24px] text-white">“{testimonial.title}”</blockquote>
        <span className="grid size-[50px] shrink-0 place-items-center rounded-full bg-[#ffbe0a] p-1.5">
          <span className="size-full rounded-full bg-[radial-gradient(circle_at_42%_30%,#f9a461_0_12%,#5f2c1d_38%,#140f10_72%)]" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 h-9 font-space text-[13px] leading-[18px] text-white/60">{testimonial.summary}</p>
      <div className="mt-2">
        <span className="relative block h-1 rounded-full bg-white/20">
          <span className={`block h-full w-1/4 rounded-full bg-white ${playing ? "animate-[tbs-audio-progress_8s_linear_infinite]" : ""}`} />
          <span className="absolute left-1/4 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </span>
        <div className="mt-1.5 flex justify-between font-space text-[11px] leading-[13px] text-white/60"><span>0:52</span><span>{testimonial.duration}</span></div>
      </div>
    </article>
  );
}

export function TestimonialsCarousel() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % testimonials.length), 8000);
    return () => window.clearInterval(timer);
  }, [playing]);

  const goTo = (delta: number) => setActiveIndex((index) => (index + delta + testimonials.length) % testimonials.length);

  return (
    <div className="tbs-grid-dark tbs-testimonial-player flex h-[321px] flex-col gap-6 overflow-hidden rounded-[40px] border-[5px] border-white/20 p-2 backdrop-blur-[4px]">
      <div className="h-[207px] overflow-hidden rounded-2xl">
        <div className="flex h-[203px] gap-1 transition-transform duration-500 ease-out" style={{ transform: `translateX(${81 - activeIndex * 429}px)` }}>
          {testimonials.map((testimonial, index) => <TestimonialCard key={`${testimonial.title}-${index}`} testimonial={testimonial} playing={playing && index === activeIndex} />)}
        </div>
      </div>
      <div className="mx-auto flex h-16 items-center gap-6">
        <button type="button" aria-label="Opinión anterior" onClick={() => goTo(-1)} className="grid size-8 place-items-center rounded-full bg-black/30 transition hover:bg-black/50"><SkipIcon direction="previous" /></button>
        <button type="button" aria-label={playing ? "Pausar carrusel" : "Reproducir carrusel"} onClick={() => setPlaying((value) => !value)} className="grid size-[52px] place-items-center rounded-2xl border border-[#ffbe0a] bg-[#ffbe0a]/20 shadow-[0_0_4px_#ffbe0a]"><PlayIcon playing={playing} /></button>
        <button type="button" aria-label="Siguiente opinión" onClick={() => goTo(1)} className="grid size-8 place-items-center rounded-full bg-black/30 transition hover:bg-black/50"><SkipIcon direction="next" /></button>
      </div>
    </div>
  );
}
