import "@/components/home/home.css";
import type { Metadata } from "next";
import Image from "next/image";
import { LlamadaSection } from "@/app/(public)/products/pack-premium/_components/inscripcion-section";
import { AppFooterSection } from "@/components/home/app-footer-section";
import { FreeCoursesSection } from "@/components/home/free-courses-section";
import { PartnersStrip } from "@/components/home/video-showcase";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Guías gratis de inversión y finanzas",
  description:
    "Descarga gratis guías prácticas para empezar a invertir, entender los mercados y mejorar tus finanzas.",
};

const beneficios = [
  ["Dar tus primeros", "en el mundo de la inversión."],
  ["Entender las bases", "para empezar a mover tu dinero."],
  ["Ganar conocimiento", "que puedas aplicar."],
  ["Construir un futuro", "financiero mucho más estable."],
] as const;

const guias = Array.from({ length: 6 }, (_, indice) => ({
  id: indice,
  tema: "Tema del documento",
  titulo: "Guía de Productividad",
  descripcion:
    "Aprende a gestionar tu tiempo, evitar distracciones y optimizar tus hábitos diarios de inversión.",
}));

function IlustracionGuias() {
  return (
    <div className="relative mx-auto h-[240px] w-[211px] xl:mx-0 xl:h-[271px] xl:w-[238px]" aria-hidden="true">
      <Image
        src="/guias-gratis/carpeta-recursos.png"
        alt=""
        width={520}
        height={592}
        className="h-full w-full object-contain"
        preload
      />
    </div>
  );
}

function HeroGuias() {
  return (
    <section className="px-4 pb-20 pt-[150px] xl:px-10 xl:pb-[50px] xl:pt-[180px]">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid items-center gap-5 xl:grid-cols-[820px_238px] xl:gap-[42px]">
          <div>
            <h1 className="max-w-[820px] font-raleway text-[50px] font-extrabold leading-[.9] tracking-[-2px] text-[#f7f7f7] md:text-[72px] xl:text-[100px] xl:leading-[90px]">
              Descargar<br /><span className="whitespace-nowrap">recursos <em className="font-playfair font-normal">gratuitos</em></span>
            </h1>
            <p className="mt-8 font-space text-lg leading-none text-[#f7f7f7] xl:text-[26px]">
              Este sitio está pensado para que puedas:
            </p>
          </div>
          <div className="xl:-translate-y-10"><IlustracionGuias /></div>
        </div>

        <div className="mt-8 grid gap-3 rounded-[30px] bg-[#ff0a54]/30 p-[22px] backdrop-blur-[4px] md:grid-cols-2 xl:h-[166px] xl:grid-cols-4">
          {beneficios.map(([titulo, descripcion]) => (
            <article key={titulo} className="relative min-h-[122px] rounded-2xl bg-[#ff0a54]/30 p-4 text-white shadow-[0_16px_32px_rgba(0,0,0,.0314)] backdrop-blur-[4px]">
              <span className="absolute right-4 top-3 font-space text-[26px] leading-none" aria-hidden="true">↗</span>
              <div className="absolute inset-x-4 bottom-4">
                <h2 className="font-space text-[26px] font-bold leading-8 tracking-[-.02em]">{titulo}</h2>
                <p className="font-raleway text-sm leading-[18px] tracking-[-.02em] text-white/70">{descripcion}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-[60px]"><PartnersStrip light /></div>
      </div>
    </section>
  );
}

function IconoDescarga() {
  return (
    <span className="relative block size-3" aria-hidden="true">
      <span className="absolute left-[5px] top-0 h-[7px] w-0.5 rounded-full bg-current" />
      <span className="absolute left-[3px] top-[4px] size-[5px] rotate-45 border-b-2 border-r-2 border-current" />
      <span className="absolute inset-x-px bottom-0 h-[3px] rounded-b-sm border-b-2 border-l-2 border-r-2 border-current" />
    </span>
  );
}

function TarjetaGuia({ guia }: { guia: (typeof guias)[number] }) {
  return (
    <article className="flex h-[474px] flex-col gap-3 rounded-[32px] bg-[#f0f0f0] p-4 text-[#1f1e23] shadow-[0_16px_32px_rgba(0,0,0,.0314)] backdrop-blur-[4px]">
      <div className="relative h-[280px] shrink-0 overflow-hidden rounded-[20px] bg-[#c4c4c4]">
        <span className="absolute left-4 top-4 rounded-full bg-[#1f1e23]/20 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[-.05em] text-[#1f1e23]">
          {guia.tema}
        </span>
      </div>
      <div className="flex h-[90px] shrink-0 flex-col gap-3">
        <div className="flex h-[22px] items-center justify-between gap-3 text-[#0066ff]">
          <span className="inline-flex h-[22px] items-center rounded-full border border-[#0066ff] bg-[#0066ff]/20 px-[10px] font-space text-[11px] font-bold uppercase tracking-[-.05em]">Gratis</span>
          <span className="font-space text-[11px] font-bold uppercase tracking-[-.05em]">PDF · 2.4 MB</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="font-raleway text-[22px] font-extrabold leading-[22px]">{guia.titulo}</h3>
          <p className="font-raleway text-xs leading-[14px] text-[#1f1e23]">{guia.descripcion}</p>
        </div>
      </div>
      <button type="button" className="mt-auto flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[36px] bg-[#0066ff] font-inter text-sm font-semibold text-[#b0d0ff] transition-colors hover:bg-[#0052cc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066ff]">
        <IconoDescarga /> Descargar
      </button>
    </article>
  );
}

function CatalogoGuias() {
  return (
    <section className="tbs-grid-light relative z-10 rounded-[36px] px-4 py-20 text-[#1f1e23] shadow-[0_24px_9.2px_rgba(0,0,0,.8)] xl:px-10 xl:py-[120px]">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="font-space text-[48px] font-bold leading-[.94] tracking-[-2px] md:text-[62px] xl:text-[82px] xl:leading-[72px]">
          Descarga<br />tus documentos
        </h2>
        <div className="mt-[42px] grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {guias.map((guia) => <TarjetaGuia key={guia.id} guia={guia} />)}
        </div>
      </div>
    </section>
  );
}

export default function GuiasGratisPage() {
  const fechaInicial = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Madrid",
  });

  return (
    <div className="tbs-grid-dark min-h-screen overflow-clip bg-[#121214] font-raleway text-white">
      <SiteHeader />
      <main>
        <HeroGuias />
        <CatalogoGuias />
        <FreeCoursesSection className="!h-auto pb-[160px] xl:min-h-[910px]" showIntro={false} />
        <LlamadaSection landingSlug="guias-gratis" fechaInicial={fechaInicial} producto="Guías gratuitas" ocultarDatosContacto />
      </main>
      <AppFooterSection showAppPromo={false} />
    </div>
  );
}
