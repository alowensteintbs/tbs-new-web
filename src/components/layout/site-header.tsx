"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type SiteNavigationItem = { label: string; href?: string };

const grupos = [
  { title: "Trading", courses: [
    { prefix: "Curso de ", name: "Trading avanzado" },
    { prefix: "Curso de ", name: "Trading algorítmico con IA" },
  ] },
  { title: "Criptomonedas", courses: [{ prefix: "Curso de ", name: "Criptomonedas avanzado" }] },
  { title: "Acciones", courses: [{ prefix: "Curso de ", name: "Acciones avanzado" }] },
  { title: "Inversión y finanzas", courses: [
    { prefix: "Curso de ", name: "Finanzas personales" },
    { prefix: "Curso de ", name: "Inversor Inteligente" },
  ] },
  { title: "Certificaciones EFPA", courses: [
    { prefix: "", name: "European Financial Advisor (EFA)" },
    { prefix: "", name: "European Investment Practitioner (EIP)" },
    { prefix: "", name: "European Investment Assistant (EIA)" },
  ] },
];

const clasesGratis = [
  {
    title: "Trading",
    icon: "trading",
    topics: ["Lectura de gráficos", "Entradas y salidas", "Gestión del riesgo"],
  },
  {
    title: "Acciones",
    icon: "acciones",
    topics: ["Análisis de empresas", "Selección de acciones", "Gestión de cartera"],
  },
  {
    title: "Criptomonedas",
    icon: "cripto",
    topics: ["Exchanges y wallets", "Análisis técnico", "Gestión del riesgo"],
  },
  {
    title: "Trading algorítmico",
    icon: "ia",
    topics: ["IA aplicada al Trading", "Creación de bots", "Prueba de estrategias"],
  },
];

type IconoClaseGratis = (typeof clasesGratis)[number]["icon"];

function IconoClase({ nombre }: { nombre: IconoClaseGratis }) {
  const propiedades = {
    "aria-hidden": true,
    className: "text-[#daff0a]",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.35,
    viewBox: "0 0 18 18",
  };

  if (nombre === "trading") {
    return (
      <svg {...propiedades} className="h-[18px] w-[15px] text-[#daff0a]">
        <path d="M4 1.5v3M4 11v5.5M2.5 4.5h3v6.5h-3zM9 1.5v1.75M9 12.75v3.75M7.5 3.25h3v9.5h-3zM14 1.5v5M14 13v3.5M12.5 6.5h3V13h-3z" />
      </svg>
    );
  }

  if (nombre === "acciones") {
    return (
      <svg {...propiedades} className="h-[15px] w-[18px] text-[#daff0a]">
        <path d="M1.5 6h15L9 2.25 1.5 6ZM3 7.75h12M3 14.25h12M4.25 7.75v6.5M7.4 7.75v6.5M10.6 7.75v6.5M13.75 7.75v6.5M1.5 16h15" />
        <path d="M8.1 5h1.8" />
      </svg>
    );
  }

  if (nombre === "cripto") {
    return (
      <svg {...propiedades} className="h-[13.5px] w-[15.75px] text-[#daff0a]" viewBox="0 0 15.75 13.5">
        <path d="m4.15.9-3.3 5.85 3.3 5.85h7.45l3.3-5.85L11.6.9H4.15Z" />
        <path d="M6.1 4.05h2.25a1.45 1.45 0 0 1 0 2.9H6.1m0 0h2.6a1.45 1.45 0 0 1 0 2.9H6.1v-5.8M7.05 2.9v1.15m1.5-1.15v1.15M7.05 9.85V11m1.5-1.15V11" />
      </svg>
    );
  }

  return (
    <svg {...propiedades} className="size-[17px] text-[#daff0a]">
      <path d="M11.75 1.5c.35 1.9 1.25 2.8 3.15 3.15-1.9.35-2.8 1.25-3.15 3.15-.35-1.9-1.25-2.8-3.15-3.15 1.9-.35 2.8-1.25 3.15-3.15Z" />
      <path d="M5.2 7.4c.45 2.6 1.7 3.85 4.3 4.3-2.6.45-3.85 1.7-4.3 4.3-.45-2.6-1.7-3.85-4.3-4.3 2.6-.45 3.85-1.7 4.3-4.3Z" />
    </svg>
  );
}

// El catálogo admite búsquedas por nombre; sustituir por URLs directas cuando
// estén publicados todos los productos de esta navegación.
function catalogo(nombre: string) {
  if (nombre === "Pack Inversión Premium") return "/products/pack-premium";
  return `/products?q=${encodeURIComponent(nombre)}`;
}

function Cursos({ close, mobile = false }: { close: () => void; mobile?: boolean }) {
  return (
    <div className={cn("grid xl:grid-cols-[407px_334.37px]", mobile ? "gap-1" : "gap-3")}>
      <div className="flex flex-col gap-0.5">
        {grupos.map((grupo) => (
          <section key={grupo.title} className={cn("rounded-2xl px-3", mobile ? "bg-[#111113] py-2.5" : "bg-[#161618] py-2")}>
            <h3 className="font-space text-lg font-bold leading-[22px] text-[#e1ff3b]">/ {grupo.title}</h3>
            <ul className={mobile ? "space-y-0" : "mt-1 space-y-1"}>
              {grupo.courses.map((course) => (
                <li key={course.name}>
                  <a href={catalogo(course.name)} onClick={close} className={cn("block rounded-sm font-raleway text-sm text-[#f7f7f7] transition-colors hover:text-[#e1ff3b] focus-visible:outline-2 focus-visible:outline-[#e1ff3b]", mobile ? "leading-[18px]" : "leading-[22px]")}>
                    {course.prefix}{course.prefix ? <strong className="font-bold">{course.name}</strong> : course.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <Link href="/products/pack-premium" onClick={close} className={cn("relative block overflow-hidden rounded-2xl bg-black outline-offset-4 focus-visible:outline-2 focus-visible:outline-[#e1ff3b]", mobile ? "aspect-[684/560]" : "aspect-[376/486]")} aria-label="Ver formación Pack Inversión Premium: Trading, Criptomonedas, Acciones y Trading con IA">
        {/* Asset provisional de la captura del usuario, recortado por CSS.
            Reemplazar por la exportación original de Curso card (7622:5910). */}
        <span aria-hidden="true" className={cn("absolute inset-0", mobile ? "bg-[url('/home/menu/referencia-cursos-mobile.png')] bg-[length:111.69591%_266.25%] bg-[position:55%_94.09237%]" : "bg-[url('/home/menu/referencia-cursos.png')] bg-[length:316.48936%_143.41564%] bg-[position:71.99017%_62.55924%]")} />
      </Link>
    </div>
  );
}

function ClasesGratis({ close, mobile = false }: { close: () => void; mobile?: boolean }) {
  return (
    <div className={cn("grid", mobile ? "grid-cols-2 gap-2" : "grid-cols-4 gap-1")}>
      {clasesGratis.map((clase) => (
        <article
          key={clase.title}
          className={cn("flex min-w-0 flex-col rounded-2xl bg-[#111113] text-[#f7f7f7]", mobile ? "h-[204px] p-2" : "h-[228px] p-3")}
        >
          <div className="grid size-[37.5px] shrink-0 place-items-center rounded-lg border border-[#daff0a] bg-[#eeff8e]/10">
            <IconoClase nombre={clase.icon} />
          </div>

          <div className={mobile ? "mt-3" : "mt-4"}>
            <p className="font-raleway text-xs leading-[14px] text-[#c7c7c9]">Aprende desde cero</p>
            <h3 className="font-space text-[15px] font-bold leading-[17px]">{clase.title}</h3>
          </div>

          <ul className={cn("font-raleway text-xs leading-[14px] text-[#d1d1d3]", mobile ? "mt-3 space-y-1.5" : "mt-4 space-y-2")}>
            {clase.topics.map((topic) => (
              <li key={topic} className="flex gap-1.5">
                <span aria-hidden="true">→</span>
                <span>{topic}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/#clases-gratis"
            onClick={close}
            className="mt-auto flex h-6 items-center justify-center rounded-full border border-[#c7f000] bg-[#c7f000]/10 font-space text-sm font-bold leading-none text-[#c7f000] transition-colors hover:bg-[#c7f000] hover:text-[#111113] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c7f000]"
          >
            Reservar plaza
          </Link>
        </article>
      ))}
    </div>
  );
}

export function SiteHeader({ items, className }: { items: SiteNavigationItem[]; className?: string }) {
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [freeClassesOpen, setFreeClassesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const coursesButtonRef = useRef<HTMLButtonElement>(null);
  const freeClassesButtonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const close = () => { setCoursesOpen(false); setFreeClassesOpen(false); setMobileOpen(false); };

  useEffect(() => {
    if (!coursesOpen && !freeClassesOpen && !mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setCoursesOpen(false);
      setFreeClassesOpen(false);
      setMobileOpen(false);
      if (window.matchMedia("(min-width: 1280px)").matches) {
        if (freeClassesOpen) freeClassesButtonRef.current?.focus();
        else coursesButtonRef.current?.focus();
      }
      else mobileButtonRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [coursesOpen, freeClassesOpen, mobileOpen]);

  function itemHref(item: SiteNavigationItem) {
    if (item.href) return item.href;
    if (item.label === "Clases Gratis") return "/#clases-gratis";
    if (item.label === "Plataforma IA") return "/#metodo";
    return "/products";
  }

  return (
    <>
      {(coursesOpen || freeClassesOpen || mobileOpen) && <div className="fixed inset-0 z-40 bg-black/60" aria-hidden="true" onClick={close} />}
      <header ref={headerRef}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close(); }}
        onMouseLeave={() => {
          if (window.matchMedia("(min-width: 1280px)").matches) {
            setCoursesOpen(false);
            setFreeClassesOpen(false);
          }
        }}
        className={cn("fixed left-4 right-4 top-10 z-50 xl:left-1/2 xl:right-auto xl:top-16 xl:w-[calc(100%-80px)] xl:max-w-[1199px] xl:-translate-x-1/2", className)}>
        <div className="flex h-[62px] items-center justify-between rounded-[20px] bg-tbs-black px-5 shadow-[0_8px_4px_rgba(18,18,20,0.5)] xl:h-[54px] xl:rounded-[26px] xl:pl-6 xl:pr-3">
          <Link href="/" aria-label="Traders Business School, inicio" onClick={close}>
            <Image src="/home/logo-traders.svg" alt="Traders Business School" width={107} height={28} priority />
          </Link>
          <nav className="hidden items-center gap-3 xl:flex" aria-label="Navegación principal">
            {items.map((item) => item.label === "Nuestros cursos" ? (
              <button key={item.label} ref={coursesButtonRef} type="button" aria-expanded={coursesOpen} aria-controls="menu-cursos" onMouseEnter={() => { setCoursesOpen(true); setFreeClassesOpen(false); }} onClick={() => { setCoursesOpen(!coursesOpen); setFreeClassesOpen(false); }}
                className={cn("inline-flex h-[30px] cursor-pointer items-center rounded-full px-5 font-space text-sm font-medium hover:text-[#e1ff3b] focus-visible:outline-2 focus-visible:outline-[#e1ff3b]", coursesOpen ? "text-[#e1ff3b]" : "text-[#f7f7f7]")}>
                {item.label}
              </button>
            ) : item.label === "Clases Gratis" ? (
              <button
                key={item.label}
                ref={freeClassesButtonRef}
                type="button"
                aria-expanded={freeClassesOpen}
                aria-controls="menu-clases-gratis"
                onMouseEnter={() => {
                  setFreeClassesOpen(true);
                  setCoursesOpen(false);
                }}
                onClick={() => {
                  setFreeClassesOpen(!freeClassesOpen);
                  setCoursesOpen(false);
                }}
                className={cn("inline-flex h-[30px] cursor-pointer items-center rounded-full px-5 font-space text-sm font-medium hover:text-[#e1ff3b] focus-visible:outline-2 focus-visible:outline-[#e1ff3b]", freeClassesOpen ? "text-[#e1ff3b]" : "text-[#f7f7f7]")}
              >
                {item.label}
              </button>
            ) : (
              <a key={item.label} href={itemHref(item)} onClick={close} className="inline-flex h-[30px] items-center rounded-full px-5 font-space text-sm font-medium text-[#f7f7f7] hover:text-[#e1ff3b]">{item.label}</a>
            ))}
          </nav>
          <a href="https://academia.tradersbusinessschool.com" target="_blank" rel="noopener noreferrer" onClick={close} className="hidden h-[30px] items-center rounded-full border-2 border-[#f7f7f7] px-3 font-raleway text-base font-extrabold leading-4 text-[#f7f7f7] xl:inline-flex">Aula Virtual</a>
          <div className="ml-auto flex items-center gap-1 xl:hidden">
          {mobileOpen && (coursesOpen || freeClassesOpen) && <button type="button" aria-label="Volver al menú principal" onClick={() => { setCoursesOpen(false); setFreeClassesOpen(false); mobileButtonRef.current?.focus(); }} className="grid size-11 cursor-pointer place-items-center rounded-lg"><Image src="/home/menu/volver.svg" alt="" width={20} height={15} unoptimized /></button>}
          <button type="button" ref={mobileButtonRef} aria-expanded={mobileOpen} aria-controls="menu-mobile" aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"} onClick={() => { setMobileOpen(!mobileOpen); setCoursesOpen(false); setFreeClassesOpen(false); }} className="grid size-11 cursor-pointer place-items-center rounded-lg text-white xl:hidden">
            <span aria-hidden="true" className="relative flex w-4 flex-col gap-1.5">
              <span className={cn("h-px w-full bg-[#f7f7f7]", mobileOpen && "translate-y-[7px] rotate-45")} />
              <span className={cn("h-px w-full bg-[#f7f7f7]", mobileOpen && "opacity-0")} />
              <span className={cn("h-px w-full bg-[#f7f7f7]", mobileOpen && "-translate-y-[7px] -rotate-45")} />
            </span>
          </button>
          </div>
        </div>
        {coursesOpen && <div id="menu-cursos" className="absolute left-1/2 top-[60px] hidden max-h-[calc(100dvh-140px)] w-[793.37px] -translate-x-1/2 overflow-y-auto rounded-[30px] border-[6px] border-white/10 bg-black/60 p-[14px] shadow-[0_11px_12px_rgb(0_0_0/25%)] backdrop-blur-[16px] xl:block"><Cursos close={close} /></div>}
        {freeClassesOpen && <div id="menu-clases-gratis" className="absolute left-1/2 top-[60px] hidden w-[793.37px] -translate-x-1/2 rounded-[30px] border-[6px] border-white/10 bg-black/60 p-[14px] shadow-[0_11px_12px_rgb(0_0_0/25%)] backdrop-blur-[16px] xl:block"><ClasesGratis close={close} /></div>}
        {mobileOpen && <nav id="menu-mobile" aria-label="Navegación móvil" className="mt-1 max-h-[calc(100dvh-122px)] overflow-y-auto overscroll-contain rounded-[22px] border-[6px] border-[#292a28] bg-black p-1 text-white shadow-[0_11px_12px_rgb(0_0_0/25%)] xl:hidden">
          {coursesOpen ? <div id="cursos-mobile"><Cursos close={close} mobile /></div> : freeClassesOpen ? <div id="clases-gratis-mobile"><ClasesGratis close={close} mobile /></div> : <div className="flex flex-col gap-1">
            <button type="button" onClick={() => { setCoursesOpen(true); mobileButtonRef.current?.focus(); }} className="flex min-h-10 w-full cursor-pointer items-center justify-between rounded-xl bg-[#111113] px-3 py-2 font-space text-base font-bold">Nuestros cursos<span aria-hidden="true" className="font-sans text-[25px] leading-none">↗</span></button>
            <button type="button" aria-expanded={freeClassesOpen} aria-controls="clases-gratis-mobile" onClick={() => { setFreeClassesOpen(true); mobileButtonRef.current?.focus(); }} className="flex min-h-10 w-full cursor-pointer items-center justify-between rounded-xl bg-[#111113] px-3 py-2 font-space text-base font-bold">Aprender gratis<span aria-hidden="true" className="font-sans text-[25px] leading-none">↗</span></button>
            <Link href="/#equipo" onClick={close} className="flex min-h-10 items-center justify-between rounded-xl bg-[#111113] px-3 py-2 font-space text-base font-bold">Sobre nosotros<span aria-hidden="true" className="font-sans text-[25px] leading-none">↗</span></Link>
          </div>}
        </nav>}
      </header>
    </>
  );
}
