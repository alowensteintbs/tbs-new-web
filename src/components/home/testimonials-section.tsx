import Image from "next/image";

function TrustpilotRating() {
  return (
    <div className="flex flex-wrap items-center gap-3 font-raleway text-sm font-semibold text-white xl:text-base">
      <span>Excelente</span>
      <span className="flex gap-px" aria-label="Cinco estrellas en Trustpilot">
        {[0, 1, 2, 3, 4].map((star) => (
          <span key={star} className="grid size-5 place-items-center bg-[#00b67a] text-[13px] leading-none text-white">★</span>
        ))}
      </span>
      <span>4.4 de 5</span>
      <span className="h-6 w-px bg-white/70" />
      <span className="text-lg">Trustpilot</span>
    </div>
  );
}

function SocialIcon({ type }: { type: "instagram" | "tiktok" | "youtube" }) {
  const isYoutube = type === "youtube";
  return <Image src={`/home/social-${type}.svg`} alt="" width={isYoutube ? 20 : 16} height={16} className={isYoutube ? "h-4 w-5 object-contain" : "size-4 object-contain"} aria-hidden="true" />;
}

export function TestimonialsSection() {
  return (
    <section className="tbs-grid-dark px-4 py-20 xl:h-[641px] xl:px-10 xl:py-[160px]">
      <div className="mx-auto grid max-w-[1200px] gap-12 xl:grid-cols-[minmax(0,587fr)_minmax(0,613fr)] xl:gap-0">
        <div className="flex min-h-[321px] flex-col">
          <span className="inline-flex h-7 w-fit items-center rounded-full border border-[#ffbe0a] bg-[#ffbe0a]/10 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-[#ffbe0a]">
            PARA CONOCERNOS, ESCÚCHALOS A ELLOS
          </span>
          <div className="mt-[56px]">
            <TrustpilotRating />
            <h2 className="mt-3 font-space text-[46px] font-bold leading-none tracking-[-1px] text-[#f4f4f5] xl:text-[50px]">+7.000 alumnos</h2>
            <p className="mt-3 max-w-[530px] font-raleway text-lg leading-5 text-white xl:text-xl">
              Conocen nuestra forma de enseñar. Han pasado por nuestras clases y aprendido con nuestros profesores.
            </p>
          </div>
          <div className="mt-auto flex h-8 items-center divide-x divide-white/70 font-space text-base font-bold text-white">
            <span className="flex items-center gap-2 pr-4"><SocialIcon type="instagram" />+54.000</span>
            <span className="flex items-center gap-2 px-4"><SocialIcon type="tiktok" />+38.000</span>
            <span className="flex items-center gap-2 pl-4"><SocialIcon type="youtube" />+23.000</span>
          </div>
        </div>
        <TestimonialsCarousel />
      </div>
    </section>
  );
}
import { TestimonialsCarousel } from "./testimonials-carousel";
