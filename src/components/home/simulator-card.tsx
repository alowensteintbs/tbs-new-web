"use client";

import { useState } from "react";
import Image from "next/image";
import { HomeButton } from "./home-button";

const nivelOptions = [
  "Ninguna: Es la primera vez que hago esto",
  "Básico: Sé lo esencial pero no lo aplico",
  "Intermedio: Tengo un poco de experiencia",
  "Avanzado: quiero profundizar",
];

const interestOptions = [
  "Me interesa el trading",
  "Me interesa el mundo cripto",
  "Me interesan las acciones",
];

const tradingOptions = [
  "Quiero un mayor control manual",
  "Quiero automatizar operativas",
];

type ResponseField = "objective" | "level" | "interest" | "tradingStyle";

type Course = {
  name: string;
  displayName: string;
  reasons: string[];
  freeHref: string;
  conditions: Array<{ field: ResponseField; value: string }>;
};

// Igual que en Dynamic Multistep Forms: un curso se recomienda sólo cuando
// todas sus condiciones coinciden. El orden establece la prioridad.
const courses: Course[] = [
  {
    name: "Trading Algorítmico",
    displayName: "Trading\nalgorítmico",
    freeHref: "/curso-trading-algoritmico-gratis/",
    reasons: [
      "Quieres mejorar tu forma de operar.",
      "Quieres reducir el peso de las emociones en tus decisiones.",
      "No quieres dedicar mucho tiempo a tareas que podrías automatizar.",
      "Quieres comprobar una estrategia antes de utilizarla.",
      "Quieres convertir tus criterios en reglas claras y repetibles.",
      "Quieres usar IA para operar de una forma más eficiente.",
    ],
    conditions: [
      { field: "interest", value: "Me interesa el trading" },
      { field: "tradingStyle", value: "Quiero automatizar operativas" },
    ],
  },
  {
    name: "Curso de Trading Avanzado",
    displayName: "Trading",
    freeHref: "/curso-trading-gratis/",
    reasons: [
      "Quieres empezar a hacer trading pero no sabes cómo.",
      "Quieres entender cuándo entrar y cuándo salir.",
      "Quieres dejar de copiar operaciones sin entenderlas.",
      "Quieres aprender a controlar cuánto arriesgas.",
      "Quieres un método para dejar de operar por intuición.",
      "Quieres llegar a tomar tus propias decisiones al operar.",
    ],
    conditions: [
      { field: "interest", value: "Me interesa el trading" },
      { field: "tradingStyle", value: "Quiero un mayor control manual" },
    ],
  },
  {
    name: "Curso de Criptomonedas Avanzado",
    displayName: "Cripto",
    freeHref: "/curso-criptomonedas-gratis/",
    reasons: [
      "Quieres empezar Cripto, pero no sabes cómo.",
      "Quieres entender qué es lo que compras de antemano.",
      "Quieres distinguir fácilmente la información útil del ruido.",
      "Quieres aprender a proteger y gestionar tus activos.",
      "Quieres detectar oportunidades con más criterio.",
      "No quieres dejarte llevar por impulsos o tendencias.",
    ],
    conditions: [{ field: "interest", value: "Me interesa el mundo cripto" }],
  },
  {
    name: "Curso de Acciones Avanzado",
    displayName: "Acciones",
    freeHref: "/curso-bolsa-gratis/",
    reasons: [
      "Quieres invertir en empresas, pero no sabes cuáles elegir.",
      "Quieres saber si una acción realmente merece la pena.",
      "No quieres comprar simplemente porque otros lo recomiendan.",
      "Quieres saber cuándo tiene sentido comprar o vender.",
      "Quieres diversificar sin elegir acciones al azar.",
      "Quieres construir una cartera pensando en el largo plazo.",
    ],
    conditions: [{ field: "interest", value: "Me interesan las acciones" }],
  },
];

export type SimulatorCardProps = {
  title: string;
  options: string[];
  step: number;
  totalSteps: number;
};

export function SimulatorCard({ title, options, totalSteps }: SimulatorCardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedObjective, setSelectedObjective] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedInterest, setSelectedInterest] = useState<number | null>(null);
  const [selectedTradingStyle, setSelectedTradingStyle] = useState<number | null>(null);
  const isTradingPath = selectedInterest === 0;
  const isResultStep = currentStep === (isTradingPath ? 5 : 4);
  const currentTitle = currentStep === 1
    ? title
    : currentStep === 2
      ? "Nivel que te representa"
      : "¿Con qué frase te identificas?";
  const currentOptions = currentStep === 1
    ? options
    : currentStep === 2
      ? nivelOptions
      : currentStep === 3
        ? interestOptions
        : tradingOptions;
  const selectedIndex = currentStep === 1
    ? selectedObjective
    : currentStep === 2
      ? selectedLevel
      : currentStep === 3
        ? selectedInterest
        : selectedTradingStyle;
  const responses = {
    objective: selectedObjective === null ? null : options[selectedObjective],
    level: selectedLevel === null ? null : nivelOptions[selectedLevel],
    interest: selectedInterest === null ? null : interestOptions[selectedInterest],
    tradingStyle: selectedTradingStyle === null ? null : tradingOptions[selectedTradingStyle],
  };
  const recommendedCourse = courses.find((course) =>
    course.conditions.every(({ field, value }) => responses[field] === value)
  );

  if (isResultStep && recommendedCourse) {
    return (
      <div className="simulator-result mx-auto flex w-full max-w-[726px] flex-col gap-8 rounded-[28px] bg-tbs-green-500/15 p-5 text-white backdrop-blur-[8px] xl:h-[300px] xl:flex-row">
        <div className="flex flex-col justify-between gap-8 xl:w-[232px] xl:shrink-0">
          <div className="flex flex-col gap-1.5">
            <p className="font-space text-[28px] font-bold leading-[22px] tracking-[-0.02em] text-tbs-green-500">
              Tu curso es
            </p>
            <h3 className={`whitespace-pre-line font-playfair font-normal italic tracking-[-0.04em] text-[#f7f7f7] ${recommendedCourse.displayName.includes("\n") ? "text-[52px] leading-[48px]" : "text-[62px] leading-[56px]"}`}>
              {recommendedCourse.displayName}
            </h3>
          </div>
          <div className="flex flex-col gap-1.5">
            <HomeButton
              href={recommendedCourse.freeHref}
              variant="green"
              className="h-8 w-full rounded-[24px] px-3 py-2 text-sm font-extrabold leading-4 text-tbs-green-900 shadow-none"
            >
              Ver clase gratis
            </HomeButton>
            <HomeButton
              href={`/products?q=${encodeURIComponent(recommendedCourse.name)}`}
              variant="navigation"
              className="h-8 w-full rounded-[24px] bg-white/30 px-3 py-2 text-sm font-bold leading-4 text-[#f4f4f5]"
            >
              Quiero más información
            </HomeButton>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-6 font-raleway font-medium xl:justify-between xl:gap-0">
          <h4 className="text-sm leading-4">
            ¿Porque encaja contigo?
          </h4>
          <ul className="flex flex-col gap-6 text-xs leading-[14px] xl:flex-1 xl:justify-between xl:gap-0 xl:pt-[26.35px]">
            {recommendedCourse.reasons.map((reason) => (
              <li key={reason} className="flex items-center gap-1.5">
                <Image
                  src="/home/simulator/flecha.svg"
                  alt=""
                  width={18}
                  height={15}
                  className="h-[14.32px] w-[17.59px] shrink-0"
                />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[726px] rounded-[28px] bg-[rgba(17,224,127,0.15)] p-5 backdrop-blur-sm">
      <div>
        <p className="mb-3 font-raleway text-base font-bold leading-4 text-tbs-green-500">{currentTitle}</p>
        <div className="flex flex-col gap-[7px]">
          {currentOptions.map((option, index) => {
            const selected = index === selectedIndex;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  if (currentStep === 1) setSelectedObjective(index);
                  else if (currentStep === 2) setSelectedLevel(index);
                  else if (currentStep === 3) setSelectedInterest(index);
                  else setSelectedTradingStyle(index);
                }}
                className={selected
                  ? "flex h-[30px] cursor-pointer items-center rounded-lg border border-tbs-green-500 bg-tbs-green-900 px-2 text-left font-raleway text-sm leading-4 text-white xl:h-8 xl:text-base"
                  : "flex h-[30px] cursor-pointer items-center rounded-lg border border-tbs-green-900 bg-black/30 px-2 text-left font-raleway text-sm leading-4 text-white transition-colors hover:border-tbs-green-500 hover:bg-tbs-green-900/60 xl:h-8 xl:text-base"}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex h-8 items-center gap-3">
        <span className="font-raleway text-base leading-4 tracking-[3.2px] text-tbs-green-500">{Math.min(currentStep, totalSteps - 1)}/{totalSteps}</span>
        <span className="h-px min-w-0 flex-1 bg-[length:100%_100%]" style={{ backgroundImage: "url('/home/progreso.svg')" }} aria-hidden="true" />
        <HomeButton disabled={currentStep === 1} onClick={() => setCurrentStep((step) => step - 1)} variant="navigation" className="h-8 cursor-pointer px-4 text-base leading-4 disabled:cursor-not-allowed">Volver</HomeButton>
        <HomeButton
          disabled={selectedIndex === null}
          onClick={() => {
            if (currentStep < 5) setCurrentStep((step) => step + 1);
          }}
          variant="green"
          className="h-8 cursor-pointer px-4 text-base leading-4 disabled:cursor-not-allowed"
        >
          Siguiente
        </HomeButton>
      </div>
    </div>
  );
}
