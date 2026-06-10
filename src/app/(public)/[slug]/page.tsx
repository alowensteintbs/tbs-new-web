import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamicParams = true;

export async function generateStaticParams() {
  const pages = await db.page.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return pages.map((p) => ({ slug: p.slug }));
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
