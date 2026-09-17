import Image from "next/image";
import { SocialProof } from "@/components/home/social-proof";
import { EcosystemSection } from "@/components/home/ecosystem-section";
import { PartnersStrip } from "@/components/home/video-showcase";
import { SiteHeader } from "@/components/layout/site-header";
import { navegacionClasesGratis, type ClaseGratis } from "./contenido";
import { FormularioRegistro } from "./formulario-registro";

function Etiqueta({ children, blue = false }: { children: React.ReactNode; blue?: boolean }) {
  return (
    <span className={`inline-flex h-7 self-start items-center rounded-full border px-3 font-mono text-xs font-bold uppercase tracking-[.06em] ${blue ? "border-[#0066ff] bg-[#0066ff]/10 text-[#0066ff]" : "border-[#e1ff3b] bg-[#e1ff3b]/10 text-[#e1ff3b]"}`}>
      {children}
    </span>
  );
}

function HeroClase({ clase, cierre = false }: { clase: ClaseGratis; cierre?: boolean }) {
  const Heading = cierre ? "h2" : "h1";
  return (
    <section className={`px-4 pb-[42px] ${cierre ? "pt-20 xl:pt-[120px]" : "pt-[150px] xl:pt-[200px]"} xl:px-10`}>
      <div className="mx-auto max-w-[1200px]">
        <div className="grid items-end gap-8 xl:grid-cols-[580px_520px] xl:justify-between xl:gap-10">
        <div>
          <span className="inline-flex h-7 items-center rounded-full border border-[#92f1c4] bg-[#11e07f]/10 px-3 font-mono text-xs font-bold uppercase text-[#92f1c4]">Plazas disponibles</span>
          <Heading className="mt-[34px] text-balance font-raleway text-[44px] font-extrabold leading-none tracking-[-.02em] text-[#f7f7f7] md:text-[62px] xl:text-[72px]">
            {clase.titulo}
          </Heading>
          <div className="mt-[34px] grid grid-cols-2 gap-2 font-raleway text-sm font-bold text-[#ff0a54] xl:flex xl:gap-2">
            {[
              ["/products/pack-premium/informacion/online.svg", "Online en directo"],
              ["/products/pack-premium/informacion/calendario.svg", "Este miércoles"],
              ["/products/pack-premium/informacion/plazas.svg", "19:00hs"],
              ["/clases-gratis/cronometro.svg", "1h sesión"],
            ].map(([icono, texto], index) => (
              <span key={texto} className={`flex min-h-12 items-center gap-2 whitespace-nowrap rounded-xl bg-[#ff0a54]/10 px-3 xl:order-none xl:gap-1.5 xl:px-2.5 ${["order-1", "order-4", "order-3", "order-2"][index]}`}>
                <Image src={icono} alt="" width={24} height={24} className="size-6 object-contain [filter:brightness(0)_saturate(100%)_invert(20%)_sepia(99%)_saturate(5239%)_hue-rotate(335deg)_brightness(103%)_contrast(103%)]" />
                {texto}
              </span>
            ))}
          </div>
          <div className="mt-[34px]"><SocialProof light /></div>
        </div>
        <FormularioRegistro clase={clase} ubicacion={cierre ? "final" : "inicio"} />
        </div>
        <div className="mt-[60px] xl:mt-[120px]"><PartnersStrip light /></div>
      </div>
    </section>
  );
}

function ContenidoClase({ clase }: { clase: ClaseGratis }) {
  return (
    <section className="tbs-grid-blue rounded-[36px] px-4 py-[42px] xl:px-[120px] xl:py-[120px]">
      <div className="mx-auto max-w-[1200px]">
        <span className="inline-flex h-7 items-center rounded-full border border-white bg-white/10 px-3 font-mono text-xs font-bold uppercase text-white">Primer paso para invertir y construir</span>
        <h2 className="mt-[42px] font-space text-[62px] font-bold leading-[58px] tracking-[-.02em] text-[#e6f0ff] xl:text-[82px] xl:leading-[68px]">
          ¿Qué verás en la clase?
        </h2>

        <div className="mt-[42px] grid gap-2 md:grid-cols-3">
          {clase.lecciones.map((leccion, index) => (
            <article key={leccion} className="min-h-[244px] rounded-[24px] bg-[#005de8] p-4 text-[#e6f0ff]">
              <span className="grid size-14 place-items-center rounded-[16px] border border-white/20 bg-white/15 shadow-[inset_1px_1px_2px_#c5efff99,inset_-1px_-1px_2px_#c5efff66]">
                <Image src={["/products/acciones/programa/target.svg", "/clases-gratis/lightbulb.svg", "/clases-gratis/wrench.svg"][index]} alt="" width={32} height={32} className="size-8 brightness-0 invert" />
              </span>
              <h3 className="mt-[56px] font-space text-2xl font-bold leading-6">{leccion}</h3>
              <p className="mt-3 max-w-[315px] font-raleway text-lg leading-5">{[
                "Veremos cómo analizar oportunidades, actuar con criterio y evitar las decisiones impulsivas.",
                "Veremos qué opciones y alternativas existen para hacer trading e invertir sin necesitar mucho capital.",
                "Veremos qué herramientas, conceptos y pasos necesitas para empezar con una base sólida.",
              ][index]}</p>
            </article>
          ))}
        </div>

        <p className="mt-[42px] font-space text-[30px] font-bold leading-8 text-[#e6f0ff]">Y además, algo exclusivo para los que asistan en directo...</p>
        <div className="mt-[42px] grid gap-4 md:grid-cols-2">
          <article className="overflow-hidden rounded-[32px] border-[6px] border-white/20 bg-white/20 p-4 text-[#e6f0ff] shadow-[0_12px_24px_#00000026]">
            <Image src="/clases-gratis/video-exclusivo-figma.png" alt="Vista previa del vídeo exclusivo" width={835} height={476} sizes="(min-width: 1280px) 548px, (min-width: 768px) 45vw, 100vw" className="aspect-[313/308] w-full rounded-2xl object-cover md:aspect-[548/312]" />
            <div className="mt-5">
              <h3 className="flex items-center gap-3 font-space text-2xl font-bold leading-6"><IconoMaterial />Vídeo exclusivo</h3>
              <p className="mt-3 font-raleway text-lg leading-5">Cómo seguir la economía sin ser un experto.</p>
            </div>
          </article>
          <article className="overflow-hidden rounded-[32px] border-[6px] border-white/20 bg-white/20 p-4 text-[#e6f0ff] shadow-[0_12px_24px_#00000026]">
            <Image src="/clases-gratis/presentacion-figma.png" alt="Presentación de la clase de Trading" width={835} height={470} sizes="(min-width: 1280px) 548px, (min-width: 768px) 45vw, 100vw" className="aspect-[548/312] w-full rounded-2xl object-cover" />
            <div className="mt-5">
              <h3 className="flex items-center gap-3 font-space text-2xl font-bold leading-6"><IconoMaterial descarga />Presentación descargable</h3>
              <p className="mt-3 font-raleway text-lg leading-5">Documento completo de nuestra clase en directo.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function IconoMaterial({ descarga = false }: { descarga?: boolean }) {
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {descarga ? <><path d="M12 3v12m-6-6 6 6 6-6" /><path d="M3 16v5h18v-5" /></> : <path d="m9 5 10 7-10 7Z" fill="currentColor" stroke="none" />}
      </svg>
    </span>
  );
}

export function ProfesorMiguel({ azul = false }: { azul?: boolean }) {
  return (
    <section className={`${azul ? "tbs-grid-blue rounded-t-[36px] xl:py-8" : "xl:py-[160px]"} px-4 py-20 xl:px-[120px]`}>
      <div className={`mx-auto grid max-w-[1200px] gap-6 overflow-hidden rounded-[40px] border-[6px] border-white/10 p-4 shadow-[0_36px_5px_#00000080] backdrop-blur-[4px] md:grid-cols-2 xl:p-6 ${azul ? "bg-[#0066ff]" : "bg-black/10"}`}>
        <div className="relative order-2 aspect-[558/446] overflow-hidden rounded-[14px] md:order-1 md:aspect-auto md:min-h-[446px]">
          <Image src={azul ? "/home/mentors/miguel.png" : "/clases-gratis/miguel-figma.png"} alt="Miguel Hernández" fill sizes="(min-width: 1280px) 558px, (min-width: 768px) 45vw, 100vw" className="object-cover object-top" />
        </div>
        <div className="order-1 flex flex-col justify-center text-white md:order-2">
          <Etiqueta>El profesor que hay detrás</Etiqueta>
          <h2 className="mt-5 font-space text-[38px] font-bold leading-none tracking-[-1px] text-[#e1ff3b] md:text-[48px]">Miguel Hernández</h2>
          <p className="mt-2 font-space text-2xl font-bold leading-6">Co-Fundador y Mentor</p>
          <p className="mt-1 font-raleway text-lg leading-5 text-white/75">+12 años invirtiendo en activo.</p>
          <h3 className="mt-6 font-space text-base font-bold leading-5">Activos en los que invierte</h3>
          <div className="mt-3 grid gap-2 font-raleway text-sm md:grid-cols-3">
            {[
              ["/products/acciones/programa/trending-up.svg", "Criptomonedas, acciones y derivados"],
              ["/products/acciones/programa/chart-no-axes-column.svg", "Fondos indexados, ETFs y dividendos"],
              ["/products/pack-premium/programa/shield.svg", "Derivados para conservar y crecer capital"],
            ].map(([icono, texto]) => <div key={texto} className="flex gap-2 rounded-xl bg-[#242427]/90 p-3 md:min-h-[100px] md:flex-col"><IconoProfesor src={icono} /><p className="leading-[14px]">{texto}</p></div>)}
          </div>
          <h3 className="mt-6 font-space text-base font-bold leading-5">Titulaciones</h3>
          <div className="mt-3 grid gap-2 font-raleway text-xs md:grid-cols-3">
            {[
              ["/products/acciones/programa/graduation-cap.svg", "Grado en Economía – Univ. Sevilla"],
              ["/clases-gratis/award.svg", "Máster Finanzas y Banca – UPO"],
              ["/products/finanzas-personales/programa/cpu.svg", "Máster Blockchain y Fintech – IEB"],
              ["/products/trading-algoritmico/programa/book-open.svg", "Doctorando en Economía"],
              ["/products/acciones/programa/circle-check.svg", "Acreditación CNMV"],
            ].map(([icono, titulo]) => <p key={titulo} className="flex min-h-10 items-center gap-3 rounded-xl bg-[#242427]/90 px-2 py-1 leading-3"><IconoProfesor src={icono} />{titulo}</p>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function IconoProfesor({ src }: { src: string }) {
  return <Image src={src} alt="" width={24} height={24} className="size-6 shrink-0 [filter:brightness(0)_saturate(100%)_invert(94%)_sepia(98%)_saturate(1892%)_hue-rotate(14deg)_brightness(110%)_contrast(105%)]" />;
}

export function LandingClase({ clase }: { clase: ClaseGratis }) {
  return (
    <div className="tbs-grid-dark min-h-screen bg-[#121214]">
      <SiteHeader items={navegacionClasesGratis} />
      <main>
        <HeroClase clase={clase} />
        <ContenidoClase clase={clase} />
        <ProfesorMiguel />
        <EcosystemSection />
        <HeroClase clase={clase} cierre />
      </main>
    </div>
  );
}
