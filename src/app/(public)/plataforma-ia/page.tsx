import "@/components/home/home.css";
import "./plataforma-ia.css";
import Image from "next/image";
import type { Metadata } from "next";
import { AppFooterSection } from "@/components/home/app-footer-section";
import { EcosystemSection } from "@/components/home/ecosystem-section";
import { MentorsSection } from "@/components/home/mentors-section-server";
import { SectionBadge } from "@/components/home/section-badge";
import { SiteHeader, type SiteNavigationItem } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Plataforma IA y aula virtual 360",
  description:
    "Descubre el aula virtual y el asistente de inteligencia artificial de Traders Business School.",
};

const navegacion: SiteNavigationItem[] = [
  { label: "Nuestros cursos", href: "/products" },
  { label: "Clases Gratis", href: "/clases-gratis" },
  { label: "Guías Gratis", href: "/guias-gratis" },
  { label: "Plataforma IA", href: "/plataforma-ia" },
  { label: "Blog", href: "/products" },
];

function HeroPlataforma() {
  return (
    <section className="plataforma-hero">
      <div className="plataforma-hero-copy">
        <SectionBadge>Formación personalizada</SectionBadge>
        <h1>Experiencia<br />formativa TBS</h1>
        <p>Hemos transformado nuestro ecosistema educativo para que vivas una inmersión total hacia la independencia financiera.</p>
      </div>
      <Image src="/plataforma-ia/portatil.png" width={1440} height={780} preload
        alt="Aula virtual de Traders Business School en un portátil"
        className="plataforma-portatil" />
    </section>
  );
}

const funcionesAula = [
  { title: "Imágenes interactivas", description: "Marca, dibuja y responde directamente sobre las imágenes para resolver ejercicios y aplicar los conceptos.", imagen: "imagen-interactiva" },
  { title: "Vídeos interactivos", description: "Cada vídeo combina contenido con preguntas y ejercicios para comprobar que estás entendiendo la clase.", imagen: "video-interactivo" },
];

function AulaVirtualSection() {
  return (
    <section className="plataforma-aula">
      <div className="plataforma-container">
        <SectionBadge className="plataforma-badge-neutral">Optimización</SectionBadge>
        <h2>Aula virtual 360</h2>
        <p className="plataforma-descripcion">Encuentra tus clases, actividades, progreso y<br className="hidden md:block" /> recursos fácilmente desde un mismo lugar.</p>
        <div className="plataforma-aula-tarjetas">
          {funcionesAula.map((item) => (
            <article className="plataforma-tarjeta" key={item.title}>
              <Image src={`/plataforma-ia/${item.imagen}.png`} width={558} height={320} alt={item.title} className="plataforma-captura" sizes="(max-width: 767px) 90vw, 558px" />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
        <article className="plataforma-logros">
          <div>
            <h3>Sistema de logros para ver tus avances</h3>
            <p>Cada actividad completada suma a tu progreso: alcanza nuevas<br className="hidden md:block" /> metas y desbloquea niveles a medida que avanzas en tu formación.</p>
          </div>
          <Image src="/plataforma-ia/logros.png" width={347} height={72} alt="Insignias de progreso, actividades, formación, resultados y objetivos" className="plataforma-insignias" />
        </article>
      </div>
    </section>
  );
}

function AsistenteSection() {
  return (
    <section className="plataforma-asistente">
      <div className="plataforma-container plataforma-asistente-layout">
        <div>
          <SectionBadge className="plataforma-badge-neutral">Acompañamiento</SectionBadge>
          <h2>Asistente de<br />IA integrado en<br />tu formación</h2>
          <p className="plataforma-descripcion">Pregunta lo que necesites y en cualquier<br className="hidden md:block" /> momento. Sube tus actividades, tareas, teoría y<br className="hidden md:block" /> resuelve todas tus dudas.</p>
        </div>
        <Image src="/plataforma-ia/asistente.png" width={610} height={506} alt="Conversación con el asistente de inversión de inteligencia artificial" className="plataforma-chat" sizes="(max-width: 767px) 90vw, 610px" />
      </div>
    </section>
  );
}

const fundamentos = [
  {
    title: "Aprende durante el proceso",
    description: "Lo que aprendes no se queda solo en una clase. Lo llevas a aplicación, prácticas y situaciones donde tienes que aplicarlo por ti mismo.",
  },
  {
    title: "Sin límite de tiempo",
    description: "Accede a tu ritmo y siempre que quieras a la formación a través del aula virtual.",
  },
];

const acompanamiento = [
  { title: "Sesiones en directo", subtitle: "Aplicas la teoría", points: ["Analizamos casos en condiciones óptimas", "Aplicamos la metodología en gráficos reales", "Hacemos ejercicios prácticos en directo", "Enseñamos razonamiento aplicado"] },
  { title: "Tutorías individuales", subtitle: "Entrenas tu operativa", points: ["Aclarar conceptos que generan dificultad", "Revisar casos particulares en operativa", "Ganar perspectiva de decisiones aplicadas", "Adaptar operativa a tu perfil y objetivo"] },
  { title: "Revisión de prácticas", subtitle: "Resuelves tus dudas", points: ["Los alumnos presentan sus prácticas", "Corrección en directo con la mejor decisión", "Errores habituales y cómo corregirlos", "Materiales del proceso paso a paso"] },
];

function MetodoPlataformaSection() {
  return (
    <section className="tbs-grid-blue px-4 py-20 text-[#e6f0ff] xl:h-[1016px] xl:px-10 xl:py-[120px]">
      <div className="mx-auto max-w-[1200px]">
        <SectionBadge tone="blue">El objetivo es construir un método</SectionBadge>
        <h2 className="mt-10 max-w-[1000px] font-space text-5xl font-bold leading-[.92] tracking-[-1px] xl:text-[82px] xl:leading-[68px] xl:tracking-[-1.64px]">Nuestra forma de enseñar<br />marca la diferencia.</h2>
        <div className="mt-[60px] grid gap-2 md:grid-cols-2">
          {fundamentos.map((item) => <article key={item.title} className="min-h-[210px] rounded-[28px] bg-[#005de8] p-5"><span className="grid size-14 place-items-center rounded-2xl border border-white/20 bg-white/10"><Image src="/home/learning/icon-practice.svg" width={29} height={29} alt="" /></span><h3 className="mt-8 font-space text-xl font-bold">{item.title}</h3><p className="mt-3 max-w-[520px] font-raleway text-base leading-5 text-[#b0d0ff]">{item.description}</p></article>)}
        </div>
        <div className="mt-5 grid gap-2 rounded-[28px] border-[6px] border-[#5298ff]/40 bg-[#005de8] p-2 shadow-[0_0_25px_rgba(82,152,255,.5)] md:grid-cols-3">
          {acompanamiento.map((item) => <article key={item.title} className="min-h-[220px] rounded-[18px] border border-[#a7c9ff]/50 p-5"><h3 className="font-space text-xl font-bold">{item.title}</h3><p className="mt-1 font-space text-base text-[#b0d0ff]">{item.subtitle}</p><ul className="mt-5 space-y-2">{item.points.map((point) => <li key={point} className="font-raleway text-xs leading-4 text-white"><span className="mr-2">•</span>{point}</li>)}</ul></article>)}
        </div>
      </div>
    </section>
  );
}

export default function PlataformaIAPage() {
  return (
    <main className="plataforma-page min-w-0 overflow-clip bg-[#121214]">
      <SiteHeader items={navegacion} />
      <HeroPlataforma />
      <div className="tbs-grid-dark plataforma-producto">
        <AulaVirtualSection />
        <AsistenteSection />
      </div>
      <div className="overflow-clip rounded-[36px] bg-[#0066ff]">
        <EcosystemSection variant="platform" />
        <MetodoPlataformaSection />
      </div>
      <MentorsSection variant="platform" />
      <div className="tbs-grid-dark overflow-hidden">
        <AppFooterSection showAppPromo={false} />
      </div>
    </main>
  );
}
