"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const perfiles: Record<string, { activos: string[]; titulaciones: string[] }> = {
  "miguel.png": {
    activos: [
      "Especializado en criptomonedas, acciones y derivados",
      "Operativa de largo plazo en fondos indexados, ETFs y cartera de dividendos",
      "Operativa activa en derivados para conservar capital y hacerlo crecer",
    ],
    titulaciones: [
      "Grado en economía",
      "Máster universitario en finanzas y banca",
      "Máster oficial en Blockchain y Fintech",
      "Doctorando en economía con tesis sobre mercados financieros",
      "Acreditación CNMV para asesoramiento en materia de inversiones",
    ],
  },
  "sergio.png": {
    activos: [
      "Cartera dinámica de acciones con operativa a medio y corto plazo",
      "Opciones financieras, futuros y CFDs a corto plazo",
      "Criptomonedas a medio-largo plazo",
    ],
    titulaciones: [
      "Grado en Administración y dirección de empresas (ADE)",
      "Máster en bolsa y mercados Financieros",
      "Especialización en análisis técnico avanzado",
    ],
  },
};

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

export function MentorsCarousel({ variant = "home" }: { variant?: "home" | "product" }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ pointerId: number; x: number; scrollLeft: number } | null>(null);
  const [perfilesAbiertos, setPerfilesAbiertos] = useState<string[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const hayPerfilAbierto = perfilesAbiertos.length > 0;

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || hayPerfilAbierto) return;

    const advance = () => {
      const step = 339;
      const reachesEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - step;
      carousel.scrollTo({ left: reachesEnd ? 0 : carousel.scrollLeft + step, behavior: "smooth" });
    };

    const timer = window.setInterval(advance, 4000);
    return () => window.clearInterval(timer);
  }, [hayPerfilAbierto]);

  const iniciarArrastre = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
    dragStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setArrastrando(true);
  };

  const arrastrar = (event: React.PointerEvent<HTMLDivElement>) => {
    const inicio = dragStart.current;
    if (!inicio || inicio.pointerId !== event.pointerId) return;
    event.currentTarget.scrollLeft = inicio.scrollLeft - (event.clientX - inicio.x);
  };

  const terminarArrastre = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart.current?.pointerId !== event.pointerId) return;
    dragStart.current = null;
    setArrastrando(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <section className={`tbs-grid-light overflow-hidden rounded-[36px] px-4 py-20 xl:px-10 xl:py-[120px] ${variant === "home" ? "xl:h-[986px]" : ""}`}>
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col-reverse gap-5 xl:flex-row xl:items-start xl:justify-between">
          <h2 className="font-raleway text-4xl font-extrabold leading-none tracking-[-1px] text-[#1f1e23] xl:text-[46px]">{variant === "home" ? <>Inversores con <span className="font-playfair font-medium italic">perfil activo</span></> : <>El equipo que te va a <span className="font-playfair font-medium italic">acompañar</span></>}</h2>
          <span className="inline-flex h-7 w-fit items-center rounded-full border border-[#0066ff] bg-[#0066ff]/10 px-3 font-mono text-xs font-bold uppercase tracking-[0.06em] text-[#0066ff]">{variant === "home" ? "El equipo que hay detrás" : "Método + consistencia = criterio"}</span>
        </div>
        {variant === "home" && <p className="mt-8 max-w-[643px] font-raleway text-lg leading-5 text-[#1f1e23] xl:text-xl">
          Si quieres aprender a invertir, lo mejor es hacerlo con profesionales en activo. Por eso, nuestros profesores unen experiencia profesional, visión práctica y vocación por enseñar.
        </p>}

        <div
          ref={carouselRef}
          className={`tbs-mentor-track mt-[32px] flex gap-2 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth touch-pan-y select-none ${arrastrando ? "cursor-grabbing" : "cursor-grab"}`}
          role="region"
          aria-label="Carrusel de profesores"
          aria-roledescription="carousel"
          onPointerDown={iniciarArrastre}
          onPointerMove={arrastrar}
          onPointerUp={terminarArrastre}
          onPointerCancel={terminarArrastre}
        >
          {mentors.map((mentor) => {
            const perfil = perfiles[mentor.image];
            const abierto = perfilesAbiertos.includes(mentor.image);
            const perfilId = `perfil-${mentor.image.replace(".png", "")}`;

            return (
            <article key={mentor.name} className="h-[576px] w-[331px] shrink-0 snap-start rounded-[40px] bg-[#f1f1f1] p-2 shadow-[0_8px_20px_rgba(0,0,0,.25)]">
              <div className="group relative h-[560px] overflow-hidden rounded-[32px] bg-[#141417]">
                <Image src={`/home/mentors/${mentor.image}`} alt={mentor.name} fill sizes="331px" unoptimized className="object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(6,6,8,.35)_60%,#08080a_100%)]" />
                <div className="absolute inset-x-[15px] bottom-[15px] text-white">
                  {mentor.tag && <span className="mb-3 inline-flex rounded-full bg-[#023f22] px-3 py-1 font-space text-xs font-bold text-[#11e07f]">{mentor.tag}</span>}
                  <h3 className="font-space text-[26px] font-bold leading-[22px] tracking-[-.5px]">{mentor.name}</h3>
                  <p className="mt-[22px] font-space text-lg font-bold uppercase leading-[13px]">{mentor.role}</p>
                  <p className="mt-[9px] font-raleway text-[15px] font-bold leading-[11px] text-white/70">{mentor.experience}</p>
                  <div className={`mt-[11px] overflow-hidden rounded-[18px] ${abierto ? "bg-[#0066ff]/40" : ""}`}>
                    <button
                      type="button"
                      aria-expanded={abierto}
                      aria-controls={perfilId}
                      aria-label={`${abierto ? "Ocultar" : "Ver"} perfil de ${mentor.name}`}
                      onClick={() => setPerfilesAbiertos((actuales) => abierto
                        ? actuales.filter((imagen) => imagen !== mentor.image)
                        : [...actuales, mentor.image])}
                      className="flex h-8 w-full cursor-pointer items-center justify-between rounded-full bg-[#0066ff] pl-3 text-left font-space text-base font-bold focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
                    >
                      <span>{abierto ? "Ocultar perfil" : "Ver perfil"}</span>
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f7f7f7] text-[#0066ff]" aria-hidden="true"><span className="text-[17px] font-normal leading-none">{abierto ? "−" : "+"}</span></span>
                    </button>
                      <div id={perfilId} hidden={!abierto} className="px-[10px] pb-[10px] pt-3">
                        {perfil ? <>
                        <h4 className="font-space text-sm font-bold leading-4">Activos en los que invierte</h4>
                        <ul className="mt-[6px] space-y-[6px] font-raleway text-xs leading-[13px]">
                          {perfil.activos.map((texto) => <li key={texto}>{texto}</li>)}
                        </ul>
                        <h4 className="mt-2 font-space text-sm font-bold leading-4">Titulaciones</h4>
                        <ul className="mt-[6px] space-y-[6px] font-raleway text-xs leading-[13px]">
                          {perfil.titulaciones.map((texto) => <li key={texto}>{texto}</li>)}
                        </ul>
                        </> : <>
                          <h4 className="font-space text-sm font-bold leading-4">Perfil profesional</h4>
                          <p className="mt-[6px] font-raleway text-xs leading-[13px]">{mentor.role}</p>
                          <p className="mt-[6px] font-raleway text-xs leading-[13px]">{mentor.experience}</p>
                        </>}
                      </div>
                  </div>
                </div>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
