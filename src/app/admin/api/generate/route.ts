import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getSession } from "@/lib/auth/dal";
import { writePageFile } from "@/lib/page-files";

export const maxDuration = 120;

const bodySchema = z.object({
  figmaFileKey: z.string().min(1),
  figmaNodeId: z.string().min(1),
  pageName: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
});

const client = new Anthropic();

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
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const { figmaFileKey, figmaNodeId, pageName, slug } = parsed.data;

  try {
    const figmaJson = await fetchNodeTree(figmaFileKey, figmaNodeId, figmaToken);
    const code = await generateCode(pageName, figmaJson);

    const validationError = validateGeneratedCode(code);
    if (validationError) {
      return NextResponse.json({ error: validationError, code }, { status: 502 });
    }

    await writePageFile(slug, code);
    revalidatePath(`/${slug}`);

    return NextResponse.json({ code });
  } catch (e) {
    console.error("[generate] error:", e);
    const status = e instanceof FigmaError ? 502 : 500;
    const message = e instanceof Error ? e.message : "Error interno";
    return NextResponse.json({ error: message }, { status });
  }
}

// --- Figma -----------------------------------------------------------------

class FigmaError extends Error {}

const FIGMA_TIMEOUT_MS = 20_000;
const FIGMA_MAX_RETRIES = 4;

/** Fetch a la API de Figma que reintenta ante 429/503, respetando Retry-After. */
async function figmaFetch(url: string, token: string): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      headers: { "X-Figma-Token": token },
      signal: AbortSignal.timeout(FIGMA_TIMEOUT_MS),
    });

    if ((res.status !== 429 && res.status !== 503) || attempt >= FIGMA_MAX_RETRIES) {
      return res;
    }

    const retryAfter = Number(res.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1_000
      : 1_000 * 2 ** attempt;
    await new Promise((r) => setTimeout(r, Math.min(delay, 30_000)));
  }
}

// Cache del árbol por (file:node) durante 10 min: regenerar la misma página
// no vuelve a pegarle a Figma, evitando rate limits al iterar.
const nodeCache = new Map<string, { expires: number; tree: unknown }>();
const NODE_CACHE_TTL_MS = 10 * 60 * 1_000;

async function fetchNodeTree(fileKey: string, nodeId: string, token: string): Promise<unknown> {
  const key = `${fileKey}:${nodeId}`;
  const cached = nodeCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.tree;

  const res = await figmaFetch(
    `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`,
    token
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { err?: string };
    throw new FigmaError(`Figma API error ${res.status}: ${err.err ?? "error desconocido"}`);
  }

  const tree = await res.json();
  nodeCache.set(key, { expires: Date.now() + NODE_CACHE_TTL_MS, tree });
  return tree;
}

// --- Generación ------------------------------------------------------------

async function generateCode(pageName: string, figmaJson: unknown): Promise<string> {
  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildPrompt(pageName, figmaJson) }],
  });

  const message = await stream.finalMessage();
  if (message.stop_reason === "max_tokens") {
    throw new FigmaError("La respuesta se cortó por límite de tokens. Probá con una sección más chica.");
  }

  const text = message.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") {
    throw new Error("Sin respuesta de texto del modelo.");
  }
  return extractCode(text.text);
}

const SYSTEM_PROMPT = `You are an expert Next.js 16 + React developer. You convert a Figma design's JSON node structure into production-ready Next.js page components.

You receive the Figma node tree (JSON): each node has its type, name, text content, colors (fills/strokes), typography (font family, size, weight, line height), layout (auto-layout direction, spacing, padding, alignment), corner radius, and absolute size. Derive the visual design entirely from this tree.

Output format (CRITICAL):
- Output ONLY raw TSX code. No markdown fences, no \`\`\`tsx wrapper, no explanation, no prose before or after.
- The very first character MUST be "import" or "export". The very last character MUST be the closing brace of the component.

Code requirements:
1. Default export named after the page (PascalCase + "Page" suffix).
2. MUST be a React Server Component:
   - NO "use client". NO useState/useEffect/useRef/any hook. NO onClick/onChange/onSubmit/any event handler.
   - <form>: static markup only (inputs, labels, button). No onSubmit, no action prop.
3. Next.js primitives: import Link from "next/link" for internal navigation (href starting with "/"). Use <a> only for external links.
4. Icons/vectors: inline <svg> matching the design. Do NOT import any icon library.
5. Images: do NOT import real images. Use placeholder <div> with bg-gradient-to-br + the right colors and aspect ratios, sized correctly.
6. Styling: Tailwind CSS v4 utilities only. Use the EXACT colors (hex), spacing, sizes and typography from the JSON. TBS tokens where they fit: bg-[#0A0F1E], bg-[#0D1424], text-[#F9FAFB], text-[#6B7280], border-[#1F2937], bg-[#2563EB], hover:bg-[#1D4ED8].
7. Semantic HTML (<header>, <main>, <section>, <footer>, <nav>, <article>), fully responsive (sm:/md:/lg:). Reproduce ALL nodes/sections in the tree, in order.
8. Self-contained. Only allowed imports: "next/link", "next/image". Do not import React.
9. No comments explaining JSX. Finish the component completely — never stop mid-element. If running out of space, simplify SVG icons rather than truncating.`;

function buildPrompt(pageName: string, figmaJson: unknown): string {
  return `Page name: "${pageName}"
Expected component: export default function ${toPascalCase(pageName)}Page() { ... }

Figma node tree (JSON):
${JSON.stringify(figmaJson).slice(0, 30000)}

Reproduce every section in the tree faithfully, using the exact colors, typography, spacing and layout encoded in the nodes.`;
}

// --- Helpers ---------------------------------------------------------------

function validateGeneratedCode(code: string): string | null {
  if (!code) return "El modelo no devolvió código.";
  if (!/export\s+default\s+function/.test(code)) return "El código no tiene un default export.";
  if (/^\s*["']use client["']/m.test(code)) return "El código usa \"use client\" — debería ser Server Component.";

  const open = (code.match(/\{/g) ?? []).length;
  const close = (code.match(/\}/g) ?? []).length;
  if (open !== close) return `Llaves desbalanceadas (${open}/${close}). Posible truncado.`;

  if (/<svg[^>]*$/.test(code) || /viewBox\s*=\s*"[^"]*$/.test(code)) {
    return "El código parece truncado dentro de un SVG.";
  }
  return null;
}

function extractCode(raw: string): string {
  const fenceMatch = raw.match(/```(?:tsx|jsx|typescript|ts)?\s*\n([\s\S]*?)```/);
  return (fenceMatch ? fenceMatch[1] : raw).trim();
}

function toPascalCase(str: string): string {
  return str
    .replace(/(?:^|\s|-|_)(\w)/g, (_, c: string) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}
