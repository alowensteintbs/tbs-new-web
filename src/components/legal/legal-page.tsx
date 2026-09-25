import Link from "next/link";
import { AppFooterSection } from "@/components/home/app-footer-section";
import { SiteHeader } from "@/components/layout/site-header";
import styles from "./legal-page.module.css";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  children: React.ReactNode;
};

const legalLinks = [
  { href: "/aviso-legal", label: "Aviso legal" },
  { href: "/terminos-y-condiciones", label: "Términos y condiciones" },
  { href: "/politica-de-privacidad", label: "Privacidad" },
  { href: "/politica-de-cookies", label: "Cookies" },
];

export function LegalPage({
  eyebrow,
  title,
  description,
  updated,
  children,
}: LegalPageProps) {
  return (
    <main className="min-w-0 overflow-clip bg-[#0d0d0f]">
      <SiteHeader />

      <section className={`${styles.grid} relative z-10 overflow-hidden rounded-b-[36px] px-4 pb-16 pt-40 shadow-[0_24px_9.2px_rgba(0,0,0,0.8)] xl:px-10 xl:pb-24 xl:pt-52`}>
        <div className="mx-auto max-w-[1200px]">
          <span className="inline-flex rounded-full border border-[#e1ff3b]/35 bg-[#e1ff3b]/10 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[.08em] text-[#e1ff3b]">
            {eyebrow}
          </span>
          <div className="mt-7 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-end">
            <div>
              <h1 className="max-w-4xl font-space text-[42px] font-bold leading-[.94] tracking-[-1.6px] text-[#f7f7f7] sm:text-6xl xl:text-[76px] xl:tracking-[-3px]">
                {title}
              </h1>
              <p className="mt-6 max-w-2xl font-raleway text-base font-medium leading-6 text-[#c7c7c9] xl:text-lg xl:leading-7">
                {description}
              </p>
            </div>
            <p className="rounded-2xl border border-white/10 bg-white/[.06] px-5 py-4 font-raleway text-sm font-semibold leading-5 text-[#e6f0ff] backdrop-blur-sm">
              {updated}
            </p>
          </div>
        </div>
      </section>

      <section className={`${styles.grid} relative z-20 -mt-7 px-4 pb-20 pt-14 xl:px-10 xl:pb-28 xl:pt-20`}>
        <div className="mx-auto max-w-[900px]">
          <nav aria-label="Documentos legales" className="mb-5 flex flex-wrap gap-2">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-white/15 bg-white/[.06] px-3 py-2 font-raleway text-xs font-bold text-[#d9d9dc] transition-colors hover:border-[#e1ff3b] hover:text-[#e1ff3b]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <article className={styles.article}>{children}</article>
        </div>
      </section>

      <div className={`${styles.grid} overflow-hidden rounded-t-[36px]`}>
        <AppFooterSection showAppPromo={false} />
      </div>
    </main>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={styles.section}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
