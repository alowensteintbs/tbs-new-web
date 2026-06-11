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
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { figmaFileKey, figmaNodeId, pageName, slug } = parsed.data;

  try {
    const figmaJson = await fetchNodeTree(figmaFileKey, figmaNodeId, figmaToken);
    const code = await generateCode(pageName, figmaJson);

    await writePageFile(slug, code);
    revalidatePath(`/${slug}`);

    return NextResponse.json({ code });
  } catch (e) {
    if (e instanceof UserError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
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

/** Turns the Retry-After header (seconds) into a human wait message. */
function retryAfterMessage(res: Response): string {
  const seconds = Number(res.headers.get("retry-after"));
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "Esperá unos minutos y volvé a intentar.";
  }
  if (seconds < 60) return "Esperá un minuto y volvé a intentar.";
  if (seconds < 3600) return `Volvé a intentar en unos ${Math.ceil(seconds / 60)} minutos.`;
  if (seconds < 86400) return `Volvé a intentar en unas ${Math.ceil(seconds / 3600)} horas.`;
  return `Volvé a intentar en ${Math.ceil(seconds / 86400)} días.`;
}

async function fetchNodeTree(fileKey: string, nodeId: string, token: string): Promise<unknown> {
  const res = await fetch(
    `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`,
    { headers: { "X-Figma-Token": token }, signal: AbortSignal.timeout(20_000) }
  );

  if (res.status === 429) {
    throw new UserError(`Alcanzaste el límite de peticiones de Figma. ${retryAfterMessage(res)}`, 429);
  }
  if (res.status === 403 || res.status === 404) {
    throw new UserError("No se pudo acceder al diseño. Revisá que el link de Figma sea correcto y tenga acceso.", 400);
  }
  if (!res.ok) {
    throw new UserError("Figma no respondió correctamente. Probá de nuevo en un momento.", 502);
  }

  return res.json();
}

async function generateCode(pageName: string, figmaJson: unknown): Promise<string> {
  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildPrompt(pageName, figmaJson) }],
  });

  const message = await stream.finalMessage();
  const text = message.content.find((b) => b.type === "text");

  if (message.stop_reason === "max_tokens" || !text || text.type !== "text") {
    throw new UserError("El diseño es muy grande para generar de una. Probá con una sección más chica.", 502);
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
9. No comments explaining JSX. Finish the component completely — never stop mid-element.`;

function buildPrompt(pageName: string, figmaJson: unknown): string {
  return `Page name: "${pageName}"
Expected component: export default function ${toPascalCase(pageName)}Page() { ... }

Figma node tree (JSON):
${JSON.stringify(figmaJson).slice(0, 30000)}

Reproduce every section in the tree faithfully, using the exact colors, typography, spacing and layout encoded in the nodes.`;
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
