import { HomeButton } from "./home-button";

export type SimulatorCardProps = {
  title: string;
  options: string[];
  selectedIndex: number;
  step: number;
  totalSteps: number;
};

export function SimulatorCard({
  title,
  options,
  selectedIndex,
  step,
  totalSteps,
}: SimulatorCardProps) {
  return (
    <div className="w-full rounded-[28px] bg-[rgba(17,224,127,0.15)] p-5 backdrop-blur-sm">
      <div>
        <p className="mb-3 font-raleway text-base font-bold leading-4 text-tbs-green-500">
          {title}
        </p>
        <div className="flex flex-col gap-[7px]">
          {options.map((option, index) => (
            <div
              key={option}
              className={
                index === selectedIndex
                  ? "flex h-[30px] items-center rounded-lg border border-tbs-green-500 bg-tbs-green-900 px-2 font-raleway text-sm leading-4 text-white xl:h-8 xl:text-base"
                  : "flex h-[30px] items-center rounded-lg border border-tbs-green-900 bg-black/30 px-2 font-raleway text-sm leading-4 text-white xl:h-8 xl:text-base"
              }
            >
              {option}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex h-8 items-center gap-3">
        <span className="font-raleway text-base leading-4 tracking-[3.2px] text-tbs-green-500">
          {step}/{totalSteps}
        </span>
        <span
          className="h-px min-w-0 flex-1 bg-[length:100%_100%]"
          style={{ backgroundImage: "url('/home/progreso.svg')" }}
          aria-hidden="true"
        />
        <HomeButton disabled variant="navigation" className="h-8 px-4 text-base leading-4">
          Volver
        </HomeButton>
        <HomeButton disabled variant="green" className="h-8 px-4 text-base leading-4">
          Siguiente
        </HomeButton>
      </div>
    </div>
  );
}
