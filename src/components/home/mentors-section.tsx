"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const mentors = [
  { name: "Miguel Hernández", role: "Co-Fundador y Mentor", experience: "+12 años invirtiendo en activo.", image: "miguel.png" },
  { name: "Sergio Gaitán", role: "Mentor", experience: "+16 años invirtiendo en activo.", image: "sergio.png" },
  { name: "Paco Estrada", role: "Co-Fundador y CEO", experience: "+15 años invirtiendo en activo.", image: "paco-estrada.png" },
  { name: "Marta Rayaces", role: "Experta en fiscalidad", experience: "Colaboradora.", image: "marta.png", tag: "Taxdown" },
  { name: "Fran Portillo", role: "Mentor", experience: "+8 años invirtiendo en activo.", image: "fran.png" },
  { name: "Sveta", role: "Antes alumna, ahora mentora", experience: "+2 años invirtiendo en activo.", image: "sveta.png" },
  { name: "Juan García", role: "Mentor especializado en EFPA", experience: "+18 años como formador en banca.", image: "juan.png" },
  { name: "Paco García", role: "Mentor especialista en LCCI", experience: "+12 años invirtiendo en activo.", image: "paco-garcia.png" },
  { name: "Javier Perez", role: "Mentor", experience: "+10 años invirtiendo en activo.", image: "javier.png" },
];

export function MentorsSection() {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const advance = () => {
      const step = 339;
      const reachesEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - step;
      carousel.scrollTo({ left: reachesEnd ? 0 : carousel.scrollLeft + step, behavior: "smooth" });
    };

    const timer = window.setInterval(advance, 4000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="tbs-grid-light overflow-hidden rounded-[36px] px-4 py-20 xl:h-[986px] xl:px-10 xl:py-[120px]">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col-reverse gap-5 xl:flex-row xl:items-start xl:justify-between">
          <h2 className="font-raleway text-4xl font-extrabold leading-none tracking-[-1px] text-[#1f1e23] xl:text-[46px]">Inversores con <span className="font-playfair font-medium italic">perfil activo</span></h2>
          <span className="inline-flex h-7 w-fit items-center rounded-full border border-[#0066ff] bg-[#0066ff]/10 px-3 font-mono text-xs font-bold uppercase tracking-[0.06em] text-[#0066ff]">El equipo que hay detrás</span>
        </div>
        <p className="mt-8 max-w-[643px] font-raleway text-lg leading-5 text-[#1f1e23] xl:text-xl">
          Si quieres aprender a invertir, lo mejor es hacerlo con profesionales en activo. Por eso, nuestros profesores unen experiencia profesional, visión práctica y vocación por enseñar.
        </p>

        <div ref={carouselRef} className="tbs-mentor-track mt-[32px] flex gap-2 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth" role="region" aria-label="Carrusel de profesores" aria-roledescription="carousel">
          {mentors.map((mentor) => (
            <article key={mentor.name} className="h-[576px] w-[331px] shrink-0 snap-start rounded-[40px] bg-[#f1f1f1] p-2 shadow-[0_8px_20px_rgba(0,0,0,.25)]">
              <div className="group relative h-[560px] overflow-hidden rounded-[32px] bg-[#141417]">
                <Image src={`/home/mentors/${mentor.image}`} alt={mentor.name} fill sizes="331px" className="object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(6,6,8,.35)_60%,#08080a_100%)]" />
                <div className="absolute inset-x-[15px] bottom-[15px] text-white">
                  {mentor.tag && <span className="mb-3 inline-flex rounded-full bg-[#023f22] px-3 py-1 font-space text-xs font-bold text-[#11e07f]">{mentor.tag}</span>}
                  <h3 className="font-space text-[26px] font-bold leading-[22px] tracking-[-.5px]">{mentor.name}</h3>
                  <p className="mt-[22px] font-space text-lg font-bold uppercase leading-[13px]">{mentor.role}</p>
                  <p className="mt-[9px] font-raleway text-[15px] font-bold leading-[11px] text-white/70">{mentor.experience}</p>
                  <div className="mt-[11px] flex h-8 items-center justify-between rounded-full bg-[#0066ff] px-3 font-space text-base font-bold">
                    <span>Ver perfil</span>
                    <span className="grid size-8 -mr-3 place-items-center rounded-full bg-[#f7f7f7] text-[#0066ff]" aria-hidden="true"><span className="text-[17px] font-normal leading-none">+</span></span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
