"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Testimonial = {
  title: string;
  summary: string;
  audioSrc: string;
};

const testimonials: Testimonial[] = [
  {
    title: "La mejor decisión de aprendizaje sobre inversión",
    summary: "Audio de prueba: reemplazalo por la opinión real de un alumno.",
    audioSrc: "/home/testimonials/opinion-prueba-1.mp3",
  },
  {
    title: "Me ayudó a entender el mercado con más confianza",
    summary: "Audio de prueba: reemplazalo por la opinión real de un alumno.",
    audioSrc: "/home/testimonials/opinion-prueba-2.mp3",
  },
  {
    title: "Clases claras y una comunidad que acompaña",
    summary: "Audio de prueba: reemplazalo por la opinión real de un alumno.",
    audioSrc: "/home/testimonials/opinion-prueba-3.mp3",
  },
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

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

function TestimonialCard({ testimonial, isActive, isPlaying, currentTime, duration, onSelect }: {
  testimonial: Testimonial;
  isActive: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onSelect: () => void;
}) {
  const progress = isActive && duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const ringLength = 138.23;
  const ringOffset = ringLength * (1 - progress);

  return (
    <article
      className={`h-[203px] w-[425px] shrink-0 cursor-pointer rounded-[32px] bg-[#1f1e23] p-6 shadow-[0_8px_0_rgb(0_0_0_/_25%)] transition-opacity ${isActive ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
      aria-label={`Reproducir opinión: ${testimonial.title}`}
      onClick={onSelect}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(); } }}
      role="button"
      tabIndex={0}
    >
      <div className="flex" aria-label="Cinco estrellas">
        {[0, 1, 2, 3, 4].map((star) => (
          <span key={star} className="grid size-[22px] place-items-center font-sans text-[23px] leading-none text-[#ffbe0a]">★</span>
        ))}
      </div>
      <div className="mt-2 flex items-start justify-between gap-3">
        <blockquote className="max-w-[315px] font-playfair text-[25px] italic leading-[24px] text-white">“{testimonial.title}”</blockquote>
        <span className="relative grid size-[50px] shrink-0 place-items-center p-1.5">
          <span className="size-full rounded-full bg-[radial-gradient(circle_at_42%_30%,#f9a461_0_12%,#5f2c1d_38%,#140f10_72%)]" aria-hidden="true" />
          <svg className="pointer-events-none absolute inset-0 size-full -rotate-90" viewBox="0 0 50 50" aria-hidden="true">
            <circle cx="25" cy="25" r="22" fill="none" stroke="#ffbe0a" strokeWidth="2" strokeLinecap="round" strokeDasharray={ringLength} strokeDashoffset={ringOffset} className="transition-[stroke-dashoffset] duration-100 ease-linear" />
          </svg>
        </span>
      </div>
      <p className="mt-2 h-9 font-space text-[13px] leading-[18px] text-white/60">{testimonial.summary}</p>
      <div className="mt-2">
        <span className="relative block h-1 rounded-full bg-white/20">
          <span className="block h-full rounded-full bg-white transition-[width] duration-100 ease-linear" style={{ width: `${progress * 100}%` }} />
          <span className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-[left] duration-100 ease-linear" style={{ left: `${progress * 100}%` }} />
        </span>
        <div className="mt-1.5 flex justify-between font-space text-[11px] leading-[13px] text-white/60"><span>{formatTime(isActive ? currentTime : 0)}</span><span>{formatTime(isActive ? duration : 0)}</span></div>
      </div>
      {isActive && isPlaying && <span className="sr-only">Reproduciendo</span>}
    </article>
  );
}

export function TestimonialsCarousel() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const autoplayAfterChange = useRef(false);
  const [activeIndex, setActiveIndex] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const playActiveAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
    } catch {
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    if (autoplayAfterChange.current) void playActiveAudio();
    autoplayAfterChange.current = false;
  }, [activeIndex, playActiveAudio]);

  const selectTestimonial = (index: number, shouldPlay = true) => {
    if (index === activeIndex) {
      if (isPlaying) audioRef.current?.pause();
      else void playActiveAudio();
      return;
    }
    autoplayAfterChange.current = shouldPlay;
    setIsPlaying(false);
    setActiveIndex(index);
  };

  const goTo = (delta: number) => selectTestimonial((activeIndex + delta + testimonials.length) % testimonials.length, isPlaying);

  return (
    <div className="tbs-grid-dark tbs-testimonial-player flex h-[321px] flex-col gap-6 overflow-hidden rounded-[40px] border-[5px] border-white/20 p-2 backdrop-blur-[4px]">
      <audio
        ref={audioRef}
        src={testimonials[activeIndex].audioSrc}
        preload="metadata"
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => selectTestimonial((activeIndex + 1) % testimonials.length)}
      />
      <div className="h-[207px] overflow-hidden rounded-2xl">
        <div className="flex h-[203px] gap-1 transition-transform duration-500 ease-out" style={{ transform: `translateX(${81 - activeIndex * 429}px)` }}>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.audioSrc}
              testimonial={testimonial}
              isActive={index === activeIndex}
              isPlaying={isPlaying && index === activeIndex}
              currentTime={currentTime}
              duration={duration}
              onSelect={() => selectTestimonial(index)}
            />
          ))}
        </div>
      </div>
      <div className="mx-auto flex h-16 items-center gap-6">
        <button type="button" aria-label="Opinión anterior" onClick={() => goTo(-1)} className="grid size-8 cursor-pointer place-items-center rounded-full bg-black/30 transition hover:bg-black/50"><SkipIcon direction="previous" /></button>
        <button type="button" aria-label={isPlaying ? "Pausar opinión" : "Reproducir opinión"} onClick={() => selectTestimonial(activeIndex)} className="grid size-[52px] cursor-pointer place-items-center rounded-2xl border border-[#ffbe0a] bg-[#ffbe0a]/20 shadow-[0_0_4px_#ffbe0a]"><PlayIcon playing={isPlaying} /></button>
        <button type="button" aria-label="Siguiente opinión" onClick={() => goTo(1)} className="grid size-8 cursor-pointer place-items-center rounded-full bg-black/30 transition hover:bg-black/50"><SkipIcon direction="next" /></button>
      </div>
    </div>
  );
}
