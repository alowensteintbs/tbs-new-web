import "@/components/home/home.css";
import type { Metadata } from "next";
import { EcosystemSection } from "@/components/home/ecosystem-section";
import { AppFooterSection } from "@/components/home/app-footer-section";
import { FreeCoursesSection } from "@/components/home/free-courses-section";
import { Hero } from "@/components/home/hero";
import { LearningSection } from "@/components/home/learning-section";
import { MentorsSection } from "@/components/home/mentors-section";
import { SimulatorSection } from "@/components/home/simulator-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { VideoShowcase } from "@/components/home/video-showcase";
import { SiteHeader, type SiteNavigationItem } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Aprende a invertir",
  description: "Formación en inversión y finanzas con Traders Business School.",
};

const navigationItems: SiteNavigationItem[] = [
  { label: "Nuestros cursos" },
  { label: "Clases Gratis" },
  { label: "Guías Gratis" },
  { label: "Plataforma IA" },
  { label: "Blog" },
];

export default function HomePage() {
  return (
    <main className="min-w-0 overflow-hidden bg-[#0d0d0f]">
      <div className="tbs-grid-light relative z-10 flex h-[1226px] flex-col rounded-b-[36px] pb-1 pt-10 shadow-[0_24px_9.2px_rgba(0,0,0,0.8)] xl:h-auto xl:min-h-[1753px] xl:gap-[60px] xl:pb-3 xl:pt-[60px]">
        <SiteHeader items={navigationItems} />
        <Hero />
        <VideoShowcase />
      </div>

      <div className="-mt-7">
        <SimulatorSection />
      </div>

      <div className="overflow-hidden rounded-[36px] bg-[#0066ff]">
        <EcosystemSection />
        <LearningSection />
      </div>

      <TestimonialsSection />
      <MentorsSection />
      <div className="tbs-grid-dark overflow-hidden rounded-[36px]">
        <FreeCoursesSection />
        <AppFooterSection />
      </div>
    </main>
  );
}
