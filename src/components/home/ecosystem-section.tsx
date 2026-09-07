"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type EcosystemCardData = {
  logo: string;
  logoAlt: string;
  logoWidth: number;
  logoHeight: number;
  title: string;
  description: string;
  tall?: boolean;
};

const CARDS: EcosystemCardData[] = [
  {
    tall: true,
    logo: "/home/ecosystem/renta4.svg",
    logoAlt: "Renta 4 Banco",
    logoWidth: 246,
    logoHeight: 31,
    title: "Socio estratégico",
    description:
      "Aporta su experiencia y visión como uno de los referentes en el sector financiero de España.",
  },
  {
    tall: true,
    logo: "/home/ecosystem/utamed.svg",
    logoAlt: "Universidad UTAMED",
    logoWidth: 173,
    logoHeight: 40,
    title: "Certificación universitaria",
    description:
      "Algunas formaciones cuentan con respaldo universitario, uniendo nuestro enfoque práctico con el reconocimiento.",
  },
  {
    logo: "/home/ecosystem/zumitow.svg",
    logoAlt: "Zumitow",
    logoWidth: 127,
    logoHeight: 26,
    title: "Colaboración",
    description:
      "Acercamos conocimiento a su newsletter para seguir haciendo de las inversiones algo accesible.",
  },
  {
    logo: "/home/ecosystem/tradingview.svg",
    logoAlt: "TradingView",
    logoWidth: 184,
    logoHeight: 24,
    title: "Partner Educativo",
    description:
      "Colaboramos con una de las plataformas de análisis financiero más utilizada en todo el mundo.",
  },
  {
    logo: "/home/ecosystem/taxdown.svg",
    logoAlt: "TaxDown",
    logoWidth: 159,
    logoHeight: 24,
    title: "Colaboración",
    description:
      "Contamos con sus expertos para impartir los módulos de fiscalidad incluidos en nuestros cursos.",
  },
];

function EcosystemCard({
  logo,
  logoAlt,
  logoWidth,
  logoHeight,
  title,
  description,
  tall = false,
}: EcosystemCardData) {
  return (
    <article
      className={cn(
        "flex min-h-[220px] flex-col justify-between rounded-[24px] border-0 border-b-[3px] border-b-[#0066ff] bg-[#f0f0f0] p-6 max-xl:h-[380px]",
        tall ? "xl:h-[445px]" : "xl:min-h-0 xl:h-[143px] xl:flex-row",
      )}
    >
      <div className={cn("order-2 mt-12 xl:mt-0", !tall && "xl:order-1 xl:max-w-[338px]")}>
        <h3 className="font-space text-2xl font-bold leading-5 text-[#323436]">{title}</h3>
        <p
          className={cn(
            "mt-3 font-space text-xl leading-6 tracking-[-0.4px] text-[#323436]",
            !tall && "xl:leading-5",
          )}
        >
          {description}
        </p>
      </div>

      <Image
        src={logo}
        alt={logoAlt}
        width={logoWidth}
        height={logoHeight}
        className={cn("order-1 h-auto max-w-full object-contain object-left-top", !tall && "xl:order-2")}
      />
    </article>
  );
}

// Stack mobile: la primera card queda en flujo; las demás se apilan tipo mazo
// (solo asoman sus bordes inferiores) y la frontal se "despega" al scrollear.
const STACK_CARDS = CARDS.slice(1);
const CARD_HEIGHT = 380;
const EDGE_PEEK = 13; // alto del borde que asoma por cada card en espera
const MAX_DEPTH = 3; // bordes visibles a la vez en el mazo
const STICKY_TOP = 64;
const TRAVEL = 460; // scroll que consume cada card antes de despegarse
const PEEL_DISTANCE = 440;
const STACK_HEIGHT = CARD_HEIGHT + MAX_DEPTH * EDGE_PEEK;
const RUNWAY_HEIGHT = STACK_HEIGHT + (STACK_CARDS.length - 1) * TRAVEL;

function MobileCardStack() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const runway = runwayRef.current;
    if (!runway) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const top = runway.getBoundingClientRect().top;
      const progress = Math.min(
        Math.max((STICKY_TOP - top) / TRAVEL, 0),
        STACK_CARDS.length - 1,
      );
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const depth = i - progress;
        if (depth >= 0) {
          el.style.transform = `translateY(${Math.min(depth, MAX_DEPTH) * EDGE_PEEK}px)`;
          el.style.opacity = "1";
        } else {
          el.style.transform = `translateY(${depth * PEEL_DISTANCE}px)`;
          el.style.opacity = String(Math.max(1 + depth, 0));
        }
      });
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="mt-[60px] xl:hidden">
      <EcosystemCard {...CARDS[0]} />

      <div ref={runwayRef} className="relative mt-6" style={{ height: RUNWAY_HEIGHT }}>
        <div className="sticky" style={{ top: STICKY_TOP, height: STACK_HEIGHT }}>
          {STACK_CARDS.map((card, i) => (
            <div
              key={card.title + card.logoAlt}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute inset-x-0 top-0 will-change-transform"
              style={{
                zIndex: STACK_CARDS.length - i,
                transform: `translateY(${Math.min(i, MAX_DEPTH) * EDGE_PEEK}px)`,
              }}
            >
              <EcosystemCard {...card} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EcosystemSection() {
  return (
    <section className="tbs-grid-light relative z-10 rounded-[36px] px-4 py-20 xl:flex xl:h-[1132px] xl:items-center xl:px-10 xl:py-0">
      <div className="mx-auto w-full max-w-[1200px]">
        <header className="max-w-[998px] xl:w-[998px]">
          <h2 className="font-space text-5xl font-bold leading-[0.98] tracking-[-1px] text-tbs-ink xl:text-[82px] xl:leading-[80px] xl:tracking-[-1.64px]">
            Más que una escuela,
            <br />
            un ecosistema financiero.
          </h2>
          <p className="mt-[18px] max-w-[635px] font-raleway text-lg leading-5 text-tbs-ink xl:text-xl">
            Trabajamos junto a entidades referentes del sector para ofrecer una formación práctica,
            actualizada y conectada con la realidad.
          </p>
        </header>

        <MobileCardStack />

        <div className="mt-[60px] hidden gap-2 xl:grid xl:grid-cols-2">
          <div className="grid gap-2 xl:grid-cols-2">
            <EcosystemCard {...CARDS[0]} />
            <EcosystemCard {...CARDS[1]} />
          </div>

          <div className="grid gap-2">
            <EcosystemCard {...CARDS[2]} />
            <EcosystemCard {...CARDS[3]} />
            <EcosystemCard {...CARDS[4]} />
          </div>
        </div>

        <div className="mt-[60px] w-full overflow-hidden xl:hidden" aria-label="Reconocimientos de Expansión, Investing.com, Emprendedores y elEconomista">
          <div className="tbs-recognitions-track">
            {[0, 1, 2].map((copy) => (
              <Image
                key={copy}
                src="/home/ecosystem/reconocimientos.svg"
                alt={copy === 0 ? "Reconocimientos de Expansión, Investing.com, Emprendedores y elEconomista" : ""}
                aria-hidden={copy !== 0}
                width={1005}
                height={58}
                className="h-auto w-[700px] shrink-0 grayscale brightness-[0.35]"
              />
            ))}
          </div>
        </div>

        <div className="mt-[60px] hidden items-start gap-6 overflow-hidden xl:flex xl:items-center">
          <p className="shrink-0 font-playfair text-2xl italic leading-[18px] tracking-[-0.96px] text-tbs-ink">
            Reconocimientos:
          </p>
          <Image
            src="/home/ecosystem/reconocimientos.svg"
            alt="Reconocimientos de Expansión, Investing.com, Emprendedores y elEconomista"
            width={1005}
            height={58}
            className="h-auto w-[700px] max-w-none grayscale brightness-[0.35] xl:w-[1005px]"
          />
        </div>
      </div>
    </section>
  );
}
