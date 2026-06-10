import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { resolveFigmaImageUrl } from "@/lib/figma";
import { getSession } from "@/lib/auth/dal";
import { writePageFile } from "@/lib/page-files";

const bodySchema = z.object({
  figmaFileKey: z.string().min(1),
  figmaNodeId: z.string().min(1),
  pageName: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
});

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const figmaToken = process.env.FIGMA_TOKEN;
  if (!figmaToken) {
    return NextResponse.json({ error: "FIGMA_TOKEN no configurado en el servidor" }, { status: 500 });
  }

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const { figmaFileKey, figmaNodeId, pageName, slug } = parsed.data;

  try {
    // Fetch JSON del nodo e imagen PNG en paralelo
    const [nodeRes, imgRes] = await Promise.all([
      fetch(
        `https://api.figma.com/v1/files/${figmaFileKey}/nodes?ids=${figmaNodeId}`,
        { headers: { "X-Figma-Token": figmaToken } }
      ),
      fetch(
        `https://api.figma.com/v1/images/${figmaFileKey}?ids=${figmaNodeId}&format=png&scale=2`,
        { headers: { "X-Figma-Token": figmaToken } }
      ),
    ]);

    if (!nodeRes.ok) {
      const err = await nodeRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: `Figma API error ${nodeRes.status}: ${(err as { err?: string }).err ?? "error desconocido"}` },
        { status: 502 }
      );
    }
    if (!imgRes.ok) {
      return NextResponse.json({ error: `Figma Images API error ${imgRes.status}` }, { status: 502 });
    }

    const [figmaJson, imgData] = await Promise.all([
      nodeRes.json(),
      imgRes.json() as Promise<{ images?: Record<string, string> }>,
    ]);

    const imageUrl = resolveFigmaImageUrl(imgData.images ?? {}, figmaNodeId);
    if (!imageUrl) {
      return NextResponse.json({ error: "Figma no devolvió URL de imagen. Verificá el Node ID." }, { status: 502 });
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: "No se pudo descargar la imagen de Figma" }, { status: 502 });
    }
    const base64Image = Buffer.from(await imageResponse.arrayBuffer()).toString("base64");

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: "image/png", data: base64Image },
            },
            {
              type: "text",
              text: buildPrompt(pageName, figmaJson),
            },
          ],
        },
      ],
    });

    const textBlock = message.content.find(
      (b): b is Extract<(typeof message.content)[number], { type: "text" }> => b.type === "text"
    );
    if (!textBlock) {
      return NextResponse.json({ error: "Sin respuesta de texto del modelo" }, { status: 500 });
    }

    const match = textBlock.text.match(/```(?:tsx|jsx|typescript|ts)?\n([\s\S]*?)```/);
    const code = match ? match[1].trim() : textBlock.text.trim();

    await writePageFile(slug, code);
    revalidatePath(`/${slug}`);

    return NextResponse.json({ code });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function buildPrompt(pageName: string, figmaJson: unknown): string {
  const componentName = toPascalCase(pageName);
  const jsonStr = JSON.stringify(figmaJson).slice(0, 8000);

  return `You are an expert frontend developer. Convert the provided Figma design screenshot and its JSON node structure into a production-ready React component.

Page name: "${pageName}"

Figma node structure (JSON):
${jsonStr}

Rules:
1. Output ONLY the TSX component code inside a single \`\`\`tsx code fence — no explanation, no prose.
2. Use Tailwind CSS v4 utility classes for ALL styling. No external CSS.
3. Use these TBS design tokens where applicable:
   - Dark backgrounds: bg-[#0A0F1E], bg-[#0D1424]
   - Text: text-[#F9FAFB], text-[#6B7280]
   - Border: border-[#1F2937]
   - Accent: bg-[#2563EB], hover:bg-[#1D4ED8]
4. The component must be a DEFAULT export: export default function ${componentName}Page() { ... }
5. Reproduce ALL sections visible in the screenshot as accurately as possible.
6. Use semantic HTML elements: header, main, section, footer, nav, article.
7. Make it fully responsive using Tailwind responsive prefixes (sm:, md:, lg:).
8. Do NOT import any external icon libraries — use inline SVG elements.
9. Do NOT import any images — use placeholder divs or CSS gradients instead.
10. The component must be self-contained with no external dependencies other than React.`;
}

function toPascalCase(str: string): string {
  return str
    .replace(/(?:^|\s|-|_)(\w)/g, (_, c: string) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}
