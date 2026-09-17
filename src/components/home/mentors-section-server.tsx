import { DeferredMentorsSection } from "./deferred-mentors-section";
import { MentorsCarousel } from "./mentors-section";

export function MentorsSection({ variant = "home" }: { variant?: "home" | "platform" }) {
  if (variant === "platform") {
    return (
      <section id="equipo" className="min-h-[966px] scroll-mt-32">
        <MentorsCarousel variant="platform" />
      </section>
    );
  }

  return (
    <section id="equipo" className="min-h-[986px] scroll-mt-32">
      <DeferredMentorsSection />
    </section>
  );
}
