import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { readPageFile } from "@/lib/page-files";
import { PageForm } from "../_components/page-form";
import { CodeViewer } from "../_components/code-viewer";

export const metadata: Metadata = { title: "Editar página" };

export default async function PageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await db.page.findUnique({ where: { id } });
  if (!page) notFound();

  const generatedCode = await readPageFile(page.slug);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{page.name}</h2>
          <p className="mt-1 text-sm text-gray-500">/{page.slug}</p>
        </div>
        <Link
          href={`/admin/pages/${id}/generate`}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Generar desde Figma
        </Link>
      </div>

      <PageForm
        initialValues={{
          id: page.id,
          name: page.name,
          slug: page.slug,
          figmaFileKey: page.figmaFileKey,
          figmaNodeId: page.figmaNodeId,
          status: page.status,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          ogImage: page.ogImage,
          canonical: page.canonical,
          noindex: page.noindex,
        }}
      />

      {generatedCode && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Código generado
          </h3>
          <CodeViewer code={generatedCode} />
        </section>
      )}
    </div>
  );
}
