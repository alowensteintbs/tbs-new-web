import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  claseGratisSlugs,
  clasesGratis,
  esClaseGratisSlug,
} from "../_components/contenido";
import { LandingClase } from "../_components/landing-clase";

export function generateStaticParams() {
  return claseGratisSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/clases-gratis/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (!esClaseGratisSlug(slug)) return {};
  return clasesGratis[slug].metadata;
}

export default async function ClaseGratisPage({
  params,
}: PageProps<"/clases-gratis/[slug]">) {
  const { slug } = await params;
  if (!esClaseGratisSlug(slug)) notFound();
  return <LandingClase clase={clasesGratis[slug]} />;
}

