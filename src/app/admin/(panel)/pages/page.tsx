import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { resolveFigmaImageUrl } from "@/lib/figma";
import { PageGallery } from "./_components/page-gallery";

export const metadata: Metadata = { title: "Maquetador" };

async function fetchThumbnails(
  pages: { id: string; figmaFileKey: string; figmaNodeId: string }[]
): Promise<Record<string, string>> {
  const token = process.env.FIGMA_TOKEN;
  if (!token || pages.length === 0) return {};

  const thumbnails: Record<string, string> = {};

  await Promise.all(
    pages.map(async (page) => {
      try {
        const res = await fetch(
          `https://api.figma.com/v1/images/${page.figmaFileKey}?ids=${page.figmaNodeId}&format=png&scale=1`,
          { headers: { "X-Figma-Token": token }, next: { revalidate: 3600 } }
        );
        if (!res.ok) return;
        const data = await res.json() as { images?: Record<string, string> };
        const url = resolveFigmaImageUrl(data.images ?? {}, page.figmaNodeId);
        if (url) thumbnails[page.id] = url;
      } catch {
        // thumbnail failures are non-fatal
      }
    })
  );

  return thumbnails;
}

export default async function PaginasPage() {
  const pages = await db.page.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      figmaFileKey: true,
      figmaNodeId: true,
      updatedAt: true,
    },
  });

  const thumbnails = await fetchThumbnails(pages);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Maquetador</h2>
          <p className="mt-1 text-sm text-gray-500">
            Genera componentes React desde Figma usando IA.
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Nueva página
        </Link>
      </div>

      <PageGallery pages={pages} thumbnails={thumbnails} />
    </div>
  );
}
