import Image from "next/image";
import { cn } from "@/lib/utils";
import { SectionBadge } from "./section-badge";

type LearningCardProps = {
  icon: string;
  iconAlt?: string;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
  textClassName?: string;
};

function LearningIcon({ src, alt = "" }: { src: string; alt?: string }) {
  return (
    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur-sm">
      <Image src={src} alt={alt} width={29} height={29} className="size-[29px] object-contain" />
    </span>
  );
}

function LearningCard({ icon, iconAlt, title, description, className, children, textClassName }: LearningCardProps) {
  return (
    <article
      className={cn(
        "relative flex min-h-[265px] min-w-0 flex-col overflow-hidden rounded-[28px] bg-tbs-blue-600 p-5",
        className,
      )}
    >
      <LearningIcon src={icon} alt={iconAlt} />
      <div className={cn(children ? "mt-6" : "mt-auto pt-6", textClassName)}>
        <h3 className="font-space text-xl font-bold leading-5 tracking-[-0.4px] text-tbs-blue-100">{title}</h3>
        <p className="mt-3 font-space text-xl leading-5 tracking-[-0.4px] text-tbs-blue-200">{description}</p>
      </div>
      {children}
    </article>
  );
}

function PracticeCard() {
  const details = [
    "Clases en directo para resolver dudas.",
    "Ejercicios prácticos para entregar.",
    "Feedback y corrección de actividades.",
    "Un examen al final de cada módulo.",
  ];

  return (
    <article className="relative flex min-h-[538.667px] overflow-hidden rounded-[28px] p-5 xl:col-start-2 xl:row-span-2 xl:row-start-1">
      <Image
        src="/home/learning/aprender-haciendo.jpg"
        alt="Profesor de Traders Business School"
        width={2731}
        height={4096}
        sizes="(min-width: 1280px) 395px, calc(100vw - 32px)"
        className="absolute left-[-8.097%] top-[-26.206%] h-[126.571%] w-[115.182%] max-w-none object-fill"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,93,232,0)_38.825%,#005de8_70.649%)]" />
      <div className="relative z-10 mt-auto w-full max-w-[325px]">
        <LearningIcon src="/home/learning/icon-practice.svg" />
        <h3 className="mt-6 font-space text-xl font-bold leading-5 tracking-[-0.4px] text-tbs-blue-100">
          Aprende haciendo
        </h3>
        <p className="mt-3 font-space text-xl leading-5 tracking-[-0.4px] text-tbs-blue-200">
          Combinamos teoría, práctica y simulación real para que pongas en acción cada concepto.
        </p>
        <ul className="mt-6 space-y-0.5">
          {details.map((detail) => (
            <li key={detail} className="font-space text-base leading-5 tracking-[-0.32px] text-tbs-blue-200">
              <span aria-hidden="true" className="mr-2 inline-block w-[5px]">›</span>{detail}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function LearningSection() {
  return (
    <section id="metodo" aria-labelledby="metodo-titulo" data-figma-node="7767:80336" className="tbs-grid-blue px-4 py-20 xl:min-h-[1432px] xl:px-10 xl:py-[120px]">
      <div className="mx-auto w-full max-w-[1200px]">
        <header>
          <SectionBadge tone="blue">El objetivo es construir un método</SectionBadge>
          <h2 id="metodo-titulo" className="mt-10 max-w-[989.64px] font-space text-5xl font-bold leading-[0.98] tracking-[-1px] text-tbs-blue-100 xl:text-[82px] xl:leading-[68px] xl:tracking-[-1.64px]">
            Nuestra forma de enseñar marca la diferencia.
          </h2>
          <p className="mt-[60px] max-w-[895px] font-space text-xl leading-7 text-[#f7f7f7] xl:text-[22px]">
            No creemos en copiar operaciones. Creemos en que eres capaz de aprender y tomar decisiones con
            criterio para invertir con seguridad hoy y dentro de diez años.
          </p>
        </header>

        <div className="mt-[60px] grid gap-2 md:grid-cols-2 xl:h-[812px] xl:grid-cols-3 xl:grid-rows-[repeat(3,minmax(0,1fr))]">
          <LearningCard
            icon="/home/learning/icon-clock.svg"
            title="Operativa en directo"
            description="Tenemos clases de operativa donde los profesores operan en tiempo real, explicar cada decisión y responder tus preguntas mientras lo hacen."
            className="xl:col-start-1 xl:row-start-1"
          />

          <LearningCard
            icon="/home/learning/icon-ai.svg"
            title="Asistente de IA 24HS"
            description="Dentro del aula virtual tienes disponible un asistente de IA para resolver dudas, explicarte conceptos y ayudarte con tus tareas cuando lo necesites."
            textClassName="max-w-[325px]"
            className="xl:col-start-1 xl:row-span-2 xl:row-start-2"
          >
            <div className="tbs-mini-grid mt-6 h-[262.667px] w-full max-w-[344px] shrink-0 rounded-2xl bg-black" />
          </LearningCard>

          <PracticeCard />

          <LearningCard
            icon="/home/learning/icon-live.svg"
            title="Aprende a tu ritmo"
            description="Accedes a la formación cuando quieras, desde donde quieras y sin que el tiempo sea un obstáculo."
            className="xl:col-start-2 xl:row-start-3"
          />

          <LearningCard
            icon="/home/learning/icon-tutoring.svg"
            title="Tutorías ilimitadas"
            description="Durante los meses de tutorías incluidos en tu curso, puedes reservar sesiones individuales tantas veces como necesites."
            className="xl:col-start-3 xl:row-start-1"
          />

          <LearningCard
            icon="/home/learning/icon-preview.svg"
            title={"Te mostramos la formación\nantes de matricularte"}
            description="Te enseñamos la formación desde dentro para conocer qué incluye, cómo funciona y resolver tus dudas antes de tomar una decisión."
            className="xl:col-start-3 xl:row-span-2 xl:row-start-2 [&_h3]:whitespace-pre-line"
          >
            <Image
              src="/home/learning/illustration-desk.svg"
              alt="Ilustración de material de estudio"
              width={355}
              height={263}
              className="mt-6 h-[262.667px] w-full shrink-0 rounded-2xl object-cover"
            />
          </LearningCard>
        </div>
      </div>
    </section>
  );
}
