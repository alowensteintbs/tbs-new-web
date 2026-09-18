import "@/components/home/home.css";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { AppFooterSection } from "@/components/home/app-footer-section";
import { FreeCoursesSection } from "@/components/home/free-courses-section";
import { LlamadaSection } from "@/app/(public)/products/pack-premium/_components/inscripcion-section";
import { articulos, categorias } from "./_components/contenido";
import { TarjetaArticulo } from "./_components/tarjeta-articulo";
import styles from "./_components/blog.module.css";

export const metadata: Metadata = {
  title: "Blog de inversión, economía y finanzas",
  description: "Inversión, economía, actualidad y finanzas explicadas para que entiendas qué está pasando y por qué puede importarte.",
  robots: { index: false, follow: false },
};

export default async function BlogPage({ searchParams }: {
  searchParams: Promise<{ categoria?: string | string[] }>;
}) {
  const { categoria: filtro } = await searchParams;
  const categoria = filtro === "todo" || categorias.some(({ id }) => id === filtro) ? filtro : "economia";
  const visibles = articulos.filter((articulo) => categoria === "todo" || articulo.categoria === categoria);
  const fechaInicial = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Madrid" });
  const enlacesCategorias = categorias.map(({ id, nombre }) => (
    <Link key={id} href={`/blog?categoria=${id}#articulos`} aria-current={categoria === id ? "page" : undefined}>{nombre}</Link>
  ));

  return (
    <div className={`tbs-grid-dark min-h-screen overflow-clip font-raleway text-white ${styles.blog}`}>
      <SiteHeader />
      <main>
        <section className={styles.hero} aria-labelledby="titulo-blog">
          <div className={styles.contenedor}>
            <h1 id="titulo-blog">Hablemos<br />de <em>actualidad</em></h1>
            <p className={styles.descripcion}>Inversión, economía, actualidad y finanzas explicadas para que<br className="hidden md:block" /> entiendas qué está pasando y por qué puede importarte.</p>
            <div className={styles.destacados} aria-label="Artículos destacados" tabIndex={0}>
              {articulos.slice(0, 3).map((articulo) => <TarjetaArticulo key={articulo.id} articulo={articulo} destacada />)}
            </div>
          </div>
        </section>
        <section id="articulos" className={`tbs-grid-light ${styles.catalogo}`} aria-label="Artículos del blog">
          <div className={styles.contenedor}>
            <div className={styles.barra}>
              <nav aria-label="Categorías del blog" className={`${styles.filtros} ${styles.filtrosEscritorio}`}>
                {enlacesCategorias}
              </nav>
              <details className={styles.filtrosMoviles}>
                <summary>Filtrar</summary>
                <nav aria-label="Categorías del blog" className={styles.filtros}>{enlacesCategorias}</nav>
              </details>
              <div className={styles.migas}><Link href="/blog?categoria=todo#articulos" aria-current={categoria === "todo" ? "page" : undefined}>Todo</Link><span aria-hidden="true">›</span><span>Blog TBS</span></div>
            </div>
            {visibles.length ? <div className={styles.grilla}>
              {visibles.map((articulo) => <TarjetaArticulo key={articulo.id} articulo={articulo} />)}
            </div> : <p className={styles.vacio}>Próximamente encontrarás artículos en esta categoría.</p>}
          </div>
        </section>
        <FreeCoursesSection className="!h-auto pb-[160px] xl:min-h-[910px]" showIntro={false} />
        <LlamadaSection landingSlug="blog" fechaInicial={fechaInicial} producto="Blog" ocultarDatosContacto />
      </main>
      <AppFooterSection showAppPromo={false} />
    </div>
  );
}
