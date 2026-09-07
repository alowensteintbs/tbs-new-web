"use client";

import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import { HomeButton } from "./home-button";
import { SectionBadge } from "./section-badge";
import { SocialProof } from "./social-proof";

function RotatingWord() {
  return (
    <TypeAnimation
      sequence={["futuro", 5000, "criterio", 5000, "libertad", 5000, "seguridad", 5000]}
      speed={{ type: "keyStrokeDelayInMs", value: 180 }}
      deletionSpeed={{ type: "keyStrokeDelayInMs", value: 120 }}
      repeat={Infinity}
      wrapper="span"
      className="inline-block"
    />
  );
}

function HeroTitle() {
  return (
    <h1 className="font-space font-bold text-tbs-ink">
      <span className="flex flex-col items-start text-left text-[clamp(68px,21.88vw,86px)] leading-[0.84] tracking-[-0.04em] xl:hidden">
        <span>Invertir</span>
        <span className="flex items-center">
          para
          <Image
            src="/home/objetivo.gif"
            alt=""
            width={86}
            height={86}
            unoptimized
            className="ml-[18px] size-[86px] shrink-0"
          />
        </span>
        <span>construir</span>
        <span className="font-playfair font-normal italic tracking-[-0.06em]"><RotatingWord /></span>
      </span>

      <span className="hidden flex-col items-center text-center text-[140px] tracking-[-5.6px] xl:flex">
        <span className="-mb-2 leading-[120px]">Invertir para</span>
        <span className="flex items-center leading-[140px]">
          construir
          <Image
            src="/home/objetivo.gif"
            alt=""
            width={140}
            height={140}
            unoptimized
            className="size-[140px] shrink-0"
          />
          <span className="font-playfair font-normal italic tracking-[-8.4px]"><RotatingWord /></span>
        </span>
      </span>
    </h1>
  );
}

export function Hero() {
  return (
    <section className="mx-auto flex h-[661px] w-full flex-col items-start px-4 pb-3 pt-[110px] xl:h-[757px] xl:max-w-[1440px] xl:items-center xl:px-10 xl:pb-[60px] xl:pt-[140px]">
      <SectionBadge className="self-center">Escuela de inversión más elegida de España</SectionBadge>

      <div className="mt-8 flex w-full max-w-[361px] flex-col items-start gap-5 xl:mt-12 xl:max-w-none xl:items-center xl:gap-9">
        <HeroTitle />

        <p className="font-space text-[22px] leading-7 text-tbs-ink">
          Aquí aprendes cómo hacerlo.
        </p>

        <SocialProof />

        <HomeButton
          href="#formacion"
          variant="magenta"
          className="h-11 w-full px-5 text-xl font-bold leading-5 xl:h-10 xl:w-auto xl:py-2.5"
        >
          Quiero aprender a invertir
        </HomeButton>
      </div>
    </section>
  );
}
