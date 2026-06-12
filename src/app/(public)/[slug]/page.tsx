import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await db.page.findUnique({ where: { slug } });
  if (!page || page.status !== "PUBLISHED") return {};
  return buildPageMetadata(page);
}

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const page = await db.page.findUnique({
    where: { slug },
    select: { status: true },
  });
  if (!page || page.status !== "PUBLISHED") notFound();

  let mod: { default?: React.ComponentType } & Record<string, React.ComponentType>;
  try {
    mod = await import(`@/generated/pages/${slug}.tsx`);
  } catch {
    notFound();
  }

  const Component =
    mod.default ?? Object.values(mod).find((v) => typeof v === "function");
  if (!Component) notFound();

  return <Component />;
}
