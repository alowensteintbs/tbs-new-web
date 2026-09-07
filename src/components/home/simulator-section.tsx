import { SectionBadge } from "./section-badge";
import { SimulatorCard } from "./simulator-card";

const options = [
  "Mejorar mis finanzas personales",
  "Crear un sistema de ahorro",
  "Aprender a invertir desde cero",
  "Optimizar mis inversiones actuales",
  "Certificarme como asesor financiero",
];

export function SimulatorSection() {
  return (
    <section id="formacion" className="tbs-grid-dark relative flex h-[714px] w-full justify-center overflow-hidden px-4 py-[120px] xl:h-[844px] xl:px-10 xl:py-40">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 48% 58% at 50% 100%, rgba(17,224,127,0.4) 0%, rgba(17,224,127,0) 80%)",
        }}
      />

      <div className="relative z-10 flex h-[474px] w-full max-w-[361px] flex-col gap-7 xl:h-[524px] xl:max-w-[726px]">
        <div className="flex flex-col items-start gap-[18px]">
          <div>
            <SectionBadge tone="green">Formación personalizada</SectionBadge>
            <h2 className="mt-[18px] whitespace-nowrap font-space text-[clamp(32px,10.18vw,40px)] font-bold leading-10 tracking-[-0.8px] text-tbs-green-200 xl:text-[82px] xl:leading-[80px] xl:tracking-[-1.64px]">
              Tu situación actual
            </h2>
          </div>
          <p className="font-raleway text-base leading-4 text-white">
            Vamos a establecer tu situación
            <span className="hidden xl:inline"> actual</span>
          </p>
        </div>

        <SimulatorCard
          title="Objetivo principal"
          options={options}
          selectedIndex={0}
          step={1}
          totalSteps={4}
        />

        <p className="font-raleway text-xs font-semibold leading-3 text-tbs-green-500">
          * Datos de rentabilidad basados en históricos
        </p>
      </div>
    </section>
  );
}
