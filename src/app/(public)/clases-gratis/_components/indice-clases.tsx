import Image from "next/image";
import Link from "next/link";
import { LlamadaSection } from "@/app/(public)/products/pack-premium/_components/inscripcion-section";
import { EcosystemSection } from "@/components/home/ecosystem-section";
import { FreeCoursesSection } from "@/components/home/free-courses-section";
import { PartnersStrip } from "@/components/home/video-showcase";
import { SiteHeader } from "@/components/layout/site-header";
import { navegacionClasesGratis } from "./contenido";
import { ProfesorMiguel } from "./landing-clase";

export function IndiceClasesGratis() {
  const fechaInicial = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Madrid",
  });

  return (
    <div className="tbs-grid-dark min-h-screen bg-[#121214]">
      <SiteHeader items={navegacionClasesGratis} />
      <main>
        <section className="relative z-10 rounded-b-[36px] bg-white px-4 pb-[72px] pt-[132px] text-[#1f1e23] shadow-[0_24px_9px_rgba(0,0,0,.8)] xl:px-[120px] xl:pt-[200px]">
          <div className="mx-auto grid max-w-[1200px] items-center gap-10 xl:grid-cols-[1.05fr_.95fr] xl:gap-[72px]">
            <div>
              <h1 className="max-w-[650px] font-space text-[48px] font-bold leading-[.91] tracking-[-2px] md:text-[54px] xl:text-[44px]">
                <span className="block">Empieza a invertir de cero</span>
                <span className="block font-playfair font-normal italic">con nuestras clases gratis</span>
              </h1>
              <p className="mt-7 font-space text-lg font-bold">Gracias a ellas podrás:</p>
              <ul className="mt-3 space-y-2 font-raleway text-base md:text-lg">
                {[
                  "Tener control real de tu dinero",
                  "Construir seguridad financiera a largo plazo",
                  "Entender de verdad qué significa invertir",
                  "Empezar con una base clara y sin improvisar",
                ].map((beneficio) => (
                  <li key={beneficio} className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#0066ff]" />
                    {beneficio}
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <div className="rounded-lg border border-black px-2 py-1 font-space text-[10px] font-bold leading-[11px]">Google<br /><span className="tracking-[1px]">★★★★★</span></div>
                <div className="rounded-lg border border-black px-2 py-1 font-space text-[10px] font-bold leading-[11px]">Trustpilot<br /><span className="tracking-[1px]">★★★★★</span></div>
                <div className="flex items-end gap-3 font-space font-bold">
                  <span className="text-[38px] leading-none">+ 7.000</span>
                  <span className="pb-0.5 text-base">alumnos.</span>
                </div>
              </div>
              <Link href="#clases-gratis" className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-[#0066ff] px-6 font-space text-base font-bold text-white">
                Ver clases gratuitas
              </Link>
            </div>

            <div className="relative min-h-[340px] overflow-hidden rounded-[28px] bg-[#121214] md:min-h-[455px]">
              <Image
                src="/home/video-portada.png"
                alt="Clase de Traders Business School"
                fill
                priority
                sizes="(min-width: 1280px) 540px, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            </div>
          </div>
          <div className="mx-auto mt-[72px] max-w-[1200px]">
            <PartnersStrip />
          </div>
        </section>

        <FreeCoursesSection
          className="!h-auto pb-[160px]"
          showIntro={false}
          title="Elige una de nuestras clases"
        />

        <section className="tbs-grid-blue rounded-[36px] bg-[#0066ff]">
          <ProfesorMiguel azul />
          <EcosystemSection />
        </section>

        <div className="text-white">
          <LlamadaSection fechaInicial={fechaInicial} producto="Clases gratuitas" />
        </div>
      </main>
    </div>
  );
}
