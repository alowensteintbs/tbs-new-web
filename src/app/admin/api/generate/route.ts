import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/dal";
import { writePageFile } from "@/lib/page-files";
import { buildClonedPage, FigmaRateLimitError } from "@/lib/figma-clone";
import { readSourceCache, writeSourceCache } from "@/lib/figma-source";

export const maxDuration = 120;

const bodySchema = z.object({
  figmaFileKey: z.string().min(1),
  figmaNodeId: z.string().min(1),
  pageName: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  // Bypass the cache and re-fetch/re-render from Figma even if unchanged.
  force: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const figmaToken = process.env.FIGMA_TOKEN;
  if (!figmaToken) {
    return NextResponse.json({ error: "FIGMA_TOKEN no configurado" }, { status: 500 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { figmaFileKey, figmaNodeId, pageName, slug, force } = parsed.data;

  try {
    // Cheap call: just the file version. If it matches our cache we can reuse
    // the node tree AND the exported assets — skipping the expensive image
    // renders entirely (the endpoint that triggers Figma's rate limit).
    const version = await fetchFileVersion(figmaFileKey, figmaToken);
    const cache = await readSourceCache(slug);
    const fromCache = Boolean(
      !force &&
        cache &&
        cache.version === version &&
        cache.fileKey === figmaFileKey &&
        cache.nodeId === figmaNodeId
    );

    const figmaJson = fromCache
      ? cache!.figmaJson
      : await fetchNodeTree(figmaFileKey, figmaNodeId, figmaToken);

    const { code, assets } = await buildClonedPage({
      figmaJson,
      fileKey: figmaFileKey,
      token: figmaToken,
      slug,
      componentName: `${toPascalCase(pageName)}Page`,
      cachedAssets: fromCache ? cache!.assets : undefined,
    });

    await writePageFile(slug, code);
    await writeSourceCache(slug, {
      version,
      fileKey: figmaFileKey,
      nodeId: figmaNodeId,
      figmaJson,
      assets,
      savedAt: new Date().toISOString(),
    });
    revalidatePath(`/${slug}`);

    return NextResponse.json({ code, cached: fromCache });
  } catch (e) {
    if (e instanceof UserError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    if (e instanceof FigmaRateLimitError) {
      return NextResponse.json(
        { error: `Alcanzaste el límite de peticiones de Figma. ${retryWaitMessage(e.retryAfterSeconds)}` },
        { status: 429 }
      );
    }
    console.error("[generate] error:", e);
    return NextResponse.json({ error: "No se pudo generar la página. Probá de nuevo." }, { status: 500 });
  }
}

/** Error with a user-facing message (for designers), not a technical one. */
class UserError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

/** Turns a Retry-After value (seconds) into a human wait message. */
function retryWaitMessage(seconds?: number): string {
  if (!seconds || seconds <= 0) return "Esperá unos minutos y volvé a intentar.";
  if (seconds < 60) return "Esperá un minuto y volvé a intentar.";
  if (seconds < 3600) return `Volvé a intentar en unos ${Math.ceil(seconds / 60)} minutos.`;
  if (seconds < 86400) return `Volvé a intentar en unas ${Math.ceil(seconds / 3600)} horas.`;
  return `Volvé a intentar en ${Math.ceil(seconds / 86400)} días.`;
}

function retryAfterSeconds(res: Response): number | undefined {
  const v = Number(res.headers.get("retry-after"));
  return Number.isFinite(v) && v > 0 ? v : undefined;
}

/** One cheap request for the file's current version (changes on any edit). */
async function fetchFileVersion(fileKey: string, token: string): Promise<string> {
  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}?depth=1`, {
    headers: { "X-Figma-Token": token },
    signal: AbortSignal.timeout(20_000),
  });

  if (res.status === 429) {
    throw new UserError(`Alcanzaste el límite de peticiones de Figma. ${retryWaitMessage(retryAfterSeconds(res))}`, 429);
  }
  if (res.status === 403 || res.status === 404) {
    throw new UserError("No se pudo acceder al diseño. Revisá que el link de Figma sea correcto y tenga acceso.", 400);
  }
  if (!res.ok) {
    throw new UserError("Figma no respondió correctamente. Probá de nuevo en un momento.", 502);
  }

  const json = (await res.json()) as { version?: string; lastModified?: string };
  return String(json.version ?? json.lastModified ?? "");
}

async function fetchNodeTree(fileKey: string, nodeId: string, token: string): Promise<unknown> {
  const res = await fetch(
    `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`,
    { headers: { "X-Figma-Token": token }, signal: AbortSignal.timeout(20_000) }
  );

  if (res.status === 429) {
    throw new UserError(`Alcanzaste el límite de peticiones de Figma. ${retryWaitMessage(retryAfterSeconds(res))}`, 429);
  }
  if (res.status === 403 || res.status === 404) {
    throw new UserError("No se pudo acceder al diseño. Revisá que el link de Figma sea correcto y tenga acceso.", 400);
  }
  if (!res.ok) {
    throw new UserError("Figma no respondió correctamente. Probá de nuevo en un momento.", 502);
  }

  return res.json();
}

function toPascalCase(str: string): string {
  return str
    .replace(/(?:^|\s|-|_)(\w)/g, (_, c: string) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}
