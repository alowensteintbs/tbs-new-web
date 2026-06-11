import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { readPageFile } from "@/lib/page-files";
import { GeneratePanel } from "../../_components/generate-panel";

export const metadata: Metadata = { title: "Generar desde Figma" };

export default async function GenerarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await db.page.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      figmaFileKey: true,
      figmaNodeId: true,
    },
  });
  if (!page) notFound();

  const generatedCode = await readPageFile(page.slug);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/pages/${id}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Volver
        </Link>
        <span className="text-gray-300">/</span>
        <h2 className="text-xl font-bold text-gray-900">
          Generar — {page.name}
        </h2>
      </div>

      <GeneratePanel page={{ ...page, generatedCode }} />
    </div>
  );
}
