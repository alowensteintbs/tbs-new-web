import Image from "next/image";
import Link from "next/link";
import { Etiqueta } from "@/app/(public)/products/pack-premium/_components/elementos";
import { LlamadaSection } from "@/app/(public)/products/pack-premium/_components/inscripcion-section";
import packStyles from "@/app/(public)/products/pack-premium/_components/pack-premium.module.css";
import { AppFooterSection } from "@/components/home/app-footer-section";
import { SectionBadge } from "@/components/home/section-badge";
import { SocialProof } from "@/components/home/social-proof";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { CuentaAtras } from "./cuenta-atras";
import styles from "./descuento.module.css";

export type OpcionDescuento = {
  /** Dos líneas del título; `enfasis` marca la que va en Playfair azul. */
  titulo: [string, string];
  enfasis?: 0 | 1;
  /** Nombre para lectores de pantalla en el botón de inscripción. */
  nombre: string;
  descripcion: string;
  tutorias: string;
  mensual: string;
  completo: string;
  href: string;
};

export type BonusDescuento = { texto: string; destacado?: string };

export type LandingDescuento = {
  /** Líneas del título del hero; en móvil pueden partirse. */
  titulo: string[];
  /**
   * Fin de la oferta en ISO 8601 (p. ej. "2026-11-30T23:59:59+01:00").
   * Con `null`, la cuenta atrás termina cada día a medianoche de Madrid.
   */
  finOferta: string | null;
  etiquetaComparativa: string;
  tituloComparativa: string;
  incluye: string[];
  curso: OpcionDescuento;
  premium: OpcionDescuento & { bonus: BonusDescuento[] };
  llamada: { landingSlug: string; producto: string };
};

function Cabecera() {
  return (
    <header className={styles.cabecera}>
      <div className={styles.contenedor}>
        <Link href="/" aria-label="Traders Business School, ir al inicio">
          <Image
            src="/home/logo-traders.svg"
            alt="Traders Business School"
            width={118}
            height={32}
            priority
          />
        </Link>
        <SectionBadge className={styles.lema}>
          Escuela de inversión más elegida de España
        </SectionBadge>
      </div>
    </header>
  );
}

function Hero({ titulo, finOferta }: Pick<LandingDescuento, "titulo" | "finOferta">) {
  return (
    <section className={`tbs-grid-dark ${styles.hero}`}>
      <div className={`${styles.contenedor} ${styles.heroGrid}`}>
        <div>
          <SectionBadge tone="green">Exclusivo por tiempo limitado</SectionBadge>
          <h1 className={styles.titulo}>
            {titulo.map((linea) => (
              <span key={linea}>{linea} </span>
            ))}
          </h1>
          <div className={styles.pruebaSocial}>
            <SocialProof light />
          </div>
        </div>
        <CuentaAtras fin={finOferta} />
      </div>
    </section>
  );
}

function IconoComunidad() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="4.5" r="2" />
      <circle cx="5" cy="15.5" r="2" />
      <circle cx="12" cy="15.5" r="2" />
      <circle cx="19" cy="15.5" r="2" />
      <path d="M12 7v4M5 13.5V11h14v2.5M2 22a3 3 0 0 1 6 0M9 22a3 3 0 0 1 6 0M16 22a3 3 0 0 1 6 0" />
    </svg>
  );
}

function IconoClases() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="13" rx="1" />
      <circle cx="8" cy="8.5" r="1.8" />
      <path d="M12 7.5h5M12 10h5M6 13h3M7 16l-2 5M17 16l2 5" />
    </svg>
  );
}

function IconoTutorias() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 9 12 4 2 9l10 5 10-5Z" />
      <path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5M22 9v5" />
    </svg>
  );
}

function Ventajas({ tutorias }: { tutorias: string }) {
  return (
    <ul className={styles.ventajas}>
      <li>
        <IconoComunidad />
        Acceso a Comunidad privada de Traders
      </li>
      <li>
        <IconoClases />
        Clases grupales en directo de por vida
      </li>
      <li>
        <IconoTutorias />
        <span>
          <strong>{tutorias.toUpperCase()}</strong> de tutorías individuales ilimitadas
        </span>
      </li>
    </ul>
  );
}

function TituloOpcion({ titulo, enfasis }: Pick<OpcionDescuento, "titulo" | "enfasis">) {
  return (
    <h3 className={styles.nombreOpcion}>
      {enfasis === 0 ? <em>{titulo[0]}</em> : titulo[0]}
      <br />
      {enfasis === 1 ? <em>{titulo[1]}</em> : titulo[1]}
    </h3>
  );
}

function Precio({ opcion }: { opcion: OpcionDescuento }) {
  return (
    <div className={styles.precio}>
      <div className={styles.importe}>
        <strong>{opcion.mensual}</strong>
        <div>
          <span>12 meses</span>
          <span>Aplazame</span>
        </div>
      </div>
      <p>Pago único {opcion.completo} con 15 días de garantía</p>
      <Link
        href={opcion.href}
        className={styles.inscribirme}
        aria-label={`Inscribirme hoy en ${opcion.nombre}`}
      >
        Inscribirme hoy
      </Link>
    </div>
  );
}

function Comparativa({
  etiquetaComparativa,
  tituloComparativa,
  incluye,
  curso,
  premium,
}: LandingDescuento) {
  const listaIncluye = (
    <ul className={styles.incluye}>
      {incluye.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );

  return (
    <section className={`tbs-grid-light ${styles.comparativa}`} id="inscripcion">
      <div className={styles.contenedor}>
        <Etiqueta>{etiquetaComparativa}</Etiqueta>
        <h2 className={styles.tituloComparativa}>{tituloComparativa}</h2>

        <div className={styles.opciones}>
          <article className={styles.opcion}>
            <div className={styles.panel}>
              <TituloOpcion titulo={curso.titulo} enfasis={curso.enfasis} />
              <p className={styles.descripcion}>{curso.descripcion}</p>
              {listaIncluye}
              <Ventajas tutorias={curso.tutorias} />
            </div>
            <Precio opcion={curso} />
          </article>

          <article className={`${styles.opcion} ${styles.opcionPremium}`}>
            <div className={styles.panel}>
              <TituloOpcion titulo={premium.titulo} enfasis={premium.enfasis} />
              <p className={styles.descripcion}>{premium.descripcion}</p>
              {listaIncluye}
              <div className={styles.certificacion}>
                <p>
                  Certificación <em>universitaria</em>
                </p>
                <Image
                  src="/home/ecosystem/utamed.svg"
                  alt="UTAMED Universidad"
                  width={104}
                  height={24}
                />
              </div>
              <Ventajas tutorias={premium.tutorias} />
              <p className={styles.bonus} aria-label="Bonus">
                {"BONUS".split("").map((letra) => (
                  <span key={letra} aria-hidden="true">{letra}</span>
                ))}
              </p>
              <ul className={styles.bonusLista}>
                {premium.bonus.map(({ texto, destacado }) => (
                  <li key={texto}>
                    <span>
                      {texto}
                      {destacado && <> <strong>{destacado}</strong></>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <Precio opcion={premium} />
          </article>
        </div>
      </div>
    </section>
  );
}

export function DescuentoLanding({ landing }: { landing: LandingDescuento }) {
  const fechaInicial = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Madrid",
  });

  return (
    <div className={`${packStyles.pagina} ${styles.pagina}`}>
      <Cabecera />
      <main>
        <Hero titulo={landing.titulo} finOferta={landing.finOferta} />
        <Comparativa {...landing} />
        <TestimonialsSection />
        <LlamadaSection
          landingSlug={landing.llamada.landingSlug}
          fechaInicial={fechaInicial}
          producto={landing.llamada.producto}
        />
      </main>
      <div className="tbs-grid-dark">
        <AppFooterSection showAppPromo={false} />
      </div>
    </div>
  );
}
