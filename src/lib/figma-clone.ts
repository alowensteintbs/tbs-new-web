import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Deterministic Figma → React page cloner.
 *
 * Instead of asking an LLM to *reconstruct* a design (which is approximate and
 * non-deterministic), this walks the Figma node tree and translates each node's
 * exact geometry into an absolutely-positioned element with inline styles:
 *
 *  - TEXT           → real, selectable text with its exact typography.
 *  - solid/gradient → a <div> with a CSS background.
 *  - vectors/icons  → exported from Figma as SVG and embedded as <img>.
 *  - image fills    → exported from Figma as PNG@2x and embedded as <img>.
 *  - anything else  → rasterized to PNG as a safety net (never a gray box).
 *
 * The output uses inline styles (no Tailwind), so it renders identically
 * regardless of the app's CSS config. Assets are written to
 * `public/generated/<slug>/` and referenced by URL.
 */

// ---------------------------------------------------------------------------
// Figma data model (only the fields we use)
// ---------------------------------------------------------------------------

type Vec = { x: number; y: number };
type Box = { x: number; y: number; width: number; height: number };
type Color = { r: number; g: number; b: number; a: number };

type Paint = {
  type: string;
  visible?: boolean;
  opacity?: number;
  color?: Color;
  gradientHandlePositions?: Vec[];
  gradientStops?: { position: number; color: Color }[];
  scaleMode?: string;
  imageRef?: string;
};

type Effect = {
  type: string;
  visible?: boolean;
  radius?: number;
  spread?: number;
  color?: Color;
  offset?: Vec;
};

type TypeStyle = {
  fontFamily?: string;
  fontWeight?: number;
  fontSize?: number;
  lineHeightPx?: number;
  letterSpacing?: number;
  textAlignHorizontal?: string;
  textAlignVertical?: string;
  textDecoration?: string;
  textCase?: string;
  italic?: boolean;
};

type FigmaNode = {
  id: string;
  name?: string;
  type: string;
  visible?: boolean;
  opacity?: number;
  absoluteBoundingBox?: Box | null;
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  cornerRadius?: number;
  rectangleCornerRadii?: number[];
  characters?: string;
  style?: TypeStyle;
  effects?: Effect[];
  children?: FigmaNode[];
  clipsContent?: boolean;
};

type Style = Record<string, string | number>;

// A single absolutely-positioned element to emit, in paint order.
type Item =
  | { kind: "el"; style: Style; text?: string }
  | { kind: "img"; style: Style; exportId: string; format: "png" | "svg" };

const VECTOR_TYPES = new Set([
  "VECTOR",
  "BOOLEAN_OPERATION",
  "STAR",
  "LINE",
  "REGULAR_POLYGON",
]);
const CONTAINER_TYPES = new Set([
  "FRAME",
  "GROUP",
  "COMPONENT",
  "COMPONENT_SET",
  "INSTANCE",
  "SECTION",
]);

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/** Maps a Figma node id → the public URL of its exported asset. */
export type AssetManifest = Record<string, string>;

/** Raised when Figma keeps returning 429 while exporting images, even after
 *  backoff. The route maps it to a user-facing "wait and retry" message. */
export class FigmaRateLimitError extends Error {
  constructor(readonly retryAfterSeconds?: number) {
    super("Se alcanzó el límite de peticiones de Figma al exportar imágenes.");
    this.name = "FigmaRateLimitError";
  }
}

export async function buildClonedPage(opts: {
  figmaJson: unknown;
  fileKey: string;
  token: string;
  slug: string;
  componentName: string;
  /** Manifest from a previous run; reused (zero Figma renders) when every
   *  referenced asset is still on disk. Pass when the Figma version is unchanged. */
  cachedAssets?: AssetManifest;
}): Promise<{ code: string; assets: AssetManifest }> {
  const root = extractRootNode(opts.figmaJson);
  const rootBox = root.absoluteBoundingBox;
  if (!rootBox) {
    throw new Error("El nodo de Figma no tiene dimensiones (absoluteBoundingBox).");
  }

  const items: Item[] = [];
  const fonts = new Map<string, Set<number>>();

  // Root background is applied to the canvas div itself; only its children
  // become positioned items.
  for (const child of root.children ?? []) {
    walk(child, rootBox, items, fonts);
  }

  const assetMap = await exportAssets(
    opts.fileKey,
    opts.token,
    items,
    opts.slug,
    opts.cachedAssets ? new Map(Object.entries(opts.cachedAssets)) : undefined
  );

  const code = emitComponent({
    componentName: opts.componentName,
    rootBox,
    canvasBackground: cssBackground(root.fills, rootBox) ?? "transparent",
    pageBackground: flatBackground(root.fills) ?? "#ffffff",
    items,
    assetMap,
    fontLink: googleFontsLink(fonts),
  });

  return { code, assets: Object.fromEntries(assetMap) };
}

// ---------------------------------------------------------------------------
// Tree walk → flat list of absolutely-positioned items
// ---------------------------------------------------------------------------

function walk(
  node: FigmaNode,
  rootBox: Box,
  items: Item[],
  fonts: Map<string, Set<number>>
): void {
  if (node.visible === false) return;

  const box = node.absoluteBoundingBox;
  // No geometry of its own (e.g. a bare group) — still descend into children.
  if (!box) {
    for (const child of node.children ?? []) walk(child, rootBox, items, fonts);
    return;
  }

  // All lengths are emitted as `cqw` (relative to the canvas width) so the
  // whole composition scales uniformly and fluidly — see cq().
  const w = rootBox.width;
  const rect: Style = {
    position: "absolute",
    left: cq(box.x - rootBox.x, w),
    top: cq(box.y - rootBox.y, w),
    width: cq(box.width, w),
    height: cq(box.height, w),
  };
  if (node.opacity !== undefined && node.opacity < 1) rect.opacity = round(node.opacity);

  const kind = classify(node);

  if (kind === "text") {
    items.push(textItem(node, rect, fonts, w));
    return;
  }

  if (kind === "vector") {
    items.push({ kind: "img", style: { ...rect, ...boxDecoration(node, w) }, exportId: node.id, format: "svg" });
    return;
  }

  if (kind === "image" || kind === "raster") {
    items.push({ kind: "img", style: { ...rect, ...boxDecoration(node, w), objectFit: "cover" }, exportId: node.id, format: "png" });
    return;
  }

  // Container or simple box: paint its own background/border behind children.
  const decoration = { ...boxDecoration(node, w) };
  const bg = cssBackground(node.fills, box);
  if (bg) decoration.background = bg;
  if (Object.keys(decoration).length > 0) {
    items.push({ kind: "el", style: { ...rect, ...decoration } });
  }

  for (const child of node.children ?? []) walk(child, rootBox, items, fonts);
}

function classify(
  node: FigmaNode
): "text" | "vector" | "image" | "raster" | "container" {
  if (node.type === "TEXT") return "text";
  if (VECTOR_TYPES.has(node.type)) return "vector";
  if (hasImageFill(node)) return "image";
  if (CONTAINER_TYPES.has(node.type)) return "container";
  if (node.type === "RECTANGLE" || node.type === "ELLIPSE") {
    // Reproducible in CSS as long as its fills are solid/gradient; otherwise
    // fall back to rasterizing so we never lose the visual.
    return fillsAreCssable(node.fills) ? "container" : "raster";
  }
  // Unknown node type → rasterize rather than drop it.
  return "raster";
}

// ---------------------------------------------------------------------------
// Item builders
// ---------------------------------------------------------------------------

function textItem(node: FigmaNode, rect: Style, fonts: Map<string, Set<number>>, rootW: number): Item {
  const s = node.style ?? {};
  const style: Style = {
    ...rect,
    display: "flex",
    flexDirection: "column",
    justifyContent: vAlign(s.textAlignVertical),
    textAlign: hAlign(s.textAlignHorizontal),
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  };

  if (s.fontFamily) {
    style.fontFamily = `'${s.fontFamily}', sans-serif`;
    const weights = fonts.get(s.fontFamily) ?? new Set<number>();
    weights.add(s.fontWeight ?? 400);
    fonts.set(s.fontFamily, weights);
  }
  if (s.fontSize) style.fontSize = cq(s.fontSize, rootW);
  if (s.fontWeight) style.fontWeight = s.fontWeight;
  if (s.lineHeightPx) style.lineHeight = cq(s.lineHeightPx, rootW);
  if (s.letterSpacing) style.letterSpacing = cq(s.letterSpacing, rootW);
  if (s.italic) style.fontStyle = "italic";
  if (s.textCase === "UPPER") style.textTransform = "uppercase";
  else if (s.textCase === "LOWER") style.textTransform = "lowercase";
  else if (s.textCase === "TITLE") style.textTransform = "capitalize";
  if (s.textDecoration === "UNDERLINE") style.textDecoration = "underline";
  else if (s.textDecoration === "STRIKETHROUGH") style.textDecoration = "line-through";

  const color = solidColor(node.fills);
  if (color) style.color = color;

  return { kind: "el", style, text: node.characters ?? "" };
}

/** Border, radius, and shadow — everything except the fill/background. */
function boxDecoration(node: FigmaNode, rootW: number): Style {
  const style: Style = {};

  const radius = cornerRadius(node, rootW);
  if (radius) style.borderRadius = radius;
  else if (node.type === "ELLIPSE") style.borderRadius = "50%";

  const stroke = solidColor(node.strokes);
  if (stroke && node.strokeWeight) style.border = `${cq(node.strokeWeight, rootW)} solid ${stroke}`;

  const shadow = boxShadow(node.effects, rootW);
  if (shadow) style.boxShadow = shadow;

  const blur = layerBlur(node.effects, rootW);
  if (blur) style.filter = blur;

  return style;
}

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

function cornerRadius(node: FigmaNode, rootW: number): string | undefined {
  if (node.rectangleCornerRadii && node.rectangleCornerRadii.length === 4) {
    const [tl, tr, br, bl] = node.rectangleCornerRadii;
    if (tl || tr || br || bl) return `${cq(tl, rootW)} ${cq(tr, rootW)} ${cq(br, rootW)} ${cq(bl, rootW)}`;
  }
  if (node.cornerRadius) return cq(node.cornerRadius, rootW);
  return undefined;
}

function colorToCss(c: Color, opacity = 1): string {
  const a = round((c.a ?? 1) * opacity, 3);
  const to255 = (v: number) => Math.round(v * 255);
  return a >= 1
    ? `rgb(${to255(c.r)}, ${to255(c.g)}, ${to255(c.b)})`
    : `rgba(${to255(c.r)}, ${to255(c.g)}, ${to255(c.b)}, ${a})`;
}

function visibleFills(fills?: Paint[]): Paint[] {
  return (fills ?? []).filter((f) => f.visible !== false);
}

/** First solid fill as a CSS color (used for text color and strokes). */
function solidColor(fills?: Paint[]): string | undefined {
  const solid = visibleFills(fills).find((f) => f.type === "SOLID" && f.color);
  return solid?.color ? colorToCss(solid.color, solid.opacity ?? 1) : undefined;
}

function hasImageFill(node: FigmaNode): boolean {
  return visibleFills(node.fills).some((f) => f.type === "IMAGE");
}

function fillsAreCssable(fills?: Paint[]): boolean {
  const vis = visibleFills(fills);
  if (vis.length === 0) return true; // nothing to draw is fine
  return vis.every((f) => f.type === "SOLID" || f.type.startsWith("GRADIENT_"));
}

/**
 * Builds a CSS `background` value from Figma fills. Solid + linear/radial
 * gradients become CSS; anything else returns null (the caller rasterizes).
 * Fills are layered top-most first, matching Figma's paint order (last = top).
 */
function cssBackground(fills: Paint[] | undefined, box: Box): string | null {
  const vis = visibleFills(fills);
  if (vis.length === 0) return null;

  const layers: string[] = [];
  for (const paint of [...vis].reverse()) {
    if (paint.type === "SOLID" && paint.color) {
      const c = colorToCss(paint.color, paint.opacity ?? 1);
      layers.push(`linear-gradient(${c}, ${c})`);
    } else if (paint.type === "GRADIENT_LINEAR") {
      const g = linearGradient(paint);
      if (g) layers.push(g);
      else return null;
    } else if (paint.type === "GRADIENT_RADIAL") {
      const g = radialGradient(paint);
      if (g) layers.push(g);
      else return null;
    } else {
      return null; // image / angular / diamond — rasterize instead
    }
  }
  return layers.length ? layers.join(", ") : null;
}

function gradientStops(paint: Paint): string {
  return (paint.gradientStops ?? [])
    .map((s) => `${colorToCss(s.color)} ${round(s.position * 100, 1)}%`)
    .join(", ");
}

function linearGradient(paint: Paint): string | null {
  const h = paint.gradientHandlePositions;
  const stops = gradientStops(paint);
  if (!h || h.length < 2 || !stops) return null;
  const dx = h[1].x - h[0].x;
  const dy = h[1].y - h[0].y;
  // CSS angle: 0deg points up, grows clockwise; Figma y grows downward.
  const angle = round((Math.atan2(dx, -dy) * 180) / Math.PI, 1);
  return `linear-gradient(${angle}deg, ${stops})`;
}

function radialGradient(paint: Paint): string | null {
  const stops = gradientStops(paint);
  if (!stops) return null;
  const h = paint.gradientHandlePositions;
  const center = h && h[0] ? `${round(h[0].x * 100, 1)}% ${round(h[0].y * 100, 1)}%` : "50% 50%";
  return `radial-gradient(circle at ${center}, ${stops})`;
}

/** A single flat color representing the fills — for the page's outer margins. */
function flatBackground(fills?: Paint[]): string | undefined {
  const vis = visibleFills(fills);
  for (const paint of [...vis].reverse()) {
    if (paint.type === "SOLID" && paint.color) return colorToCss(paint.color, paint.opacity ?? 1);
    if (paint.type.startsWith("GRADIENT_") && paint.gradientStops?.length) {
      return colorToCss(paint.gradientStops[paint.gradientStops.length - 1].color);
    }
  }
  return undefined;
}

function boxShadow(effects: Effect[] | undefined, rootW: number): string | undefined {
  const shadows = (effects ?? [])
    .filter((e) => e.visible !== false && (e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW"))
    .map((e) => {
      const c = e.color ? colorToCss(e.color) : "rgba(0,0,0,0.25)";
      const x = cq(e.offset?.x ?? 0, rootW);
      const y = cq(e.offset?.y ?? 0, rootW);
      const blur = cq(e.radius ?? 0, rootW);
      const spread = cq(e.spread ?? 0, rootW);
      const inset = e.type === "INNER_SHADOW" ? "inset " : "";
      return `${inset}${x} ${y} ${blur} ${spread} ${c}`;
    });
  return shadows.length ? shadows.join(", ") : undefined;
}

function layerBlur(effects: Effect[] | undefined, rootW: number): string | undefined {
  const blur = (effects ?? []).find((e) => e.visible !== false && e.type === "LAYER_BLUR");
  return blur?.radius ? `blur(${cq(blur.radius, rootW)})` : undefined;
}

function vAlign(v?: string): string {
  return v === "CENTER" ? "center" : v === "BOTTOM" ? "flex-end" : "flex-start";
}
function hAlign(v?: string): string {
  return v === "CENTER" ? "center" : v === "RIGHT" ? "right" : v === "JUSTIFIED" ? "justify" : "left";
}

// ---------------------------------------------------------------------------
// Asset export
// ---------------------------------------------------------------------------

async function exportAssets(
  fileKey: string,
  token: string,
  items: Item[],
  slug: string,
  reuse?: Map<string, string>
): Promise<Map<string, string>> {
  const imgItems = items.filter((i): i is Extract<Item, { kind: "img" }> => i.kind === "img");
  if (imgItems.length === 0) return new Map();

  const dir = path.join(process.cwd(), "public", "generated", slug);

  // Fast path: the design is unchanged and every asset it needs is still on
  // disk from a previous run. Reuse them — no Figma image renders at all.
  if (reuse && (await canReuseAssets(imgItems, reuse, dir))) {
    return new Map(imgItems.map((i) => [i.exportId, reuse.get(i.exportId)!]));
  }

  const map = new Map<string, string>();
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });

  for (const format of ["png", "svg"] as const) {
    const ids = imgItems.filter((i) => i.format === format).map((i) => i.exportId);
    for (const chunk of chunkArray(ids, 40)) {
      const urls = await requestImageUrls(fileKey, token, chunk, format);
      for (const [id, url] of Object.entries(urls)) {
        const saved = await downloadAsset(url, dir, slug, id, format);
        if (saved) map.set(id, saved);
      }
    }
  }
  return map;
}

/** True only if every image item has a cached URL whose file exists on disk. */
async function canReuseAssets(
  imgItems: Extract<Item, { kind: "img" }>[],
  reuse: Map<string, string>,
  dir: string
): Promise<boolean> {
  for (const item of imgItems) {
    const rel = reuse.get(item.exportId);
    if (!rel) return false;
    try {
      await fs.access(path.join(dir, path.basename(rel)));
    } catch {
      return false;
    }
  }
  return true;
}

async function requestImageUrls(
  fileKey: string,
  token: string,
  ids: string[],
  format: "png" | "svg"
): Promise<Record<string, string>> {
  const scale = format === "png" ? "&scale=2" : "";
  const url = `https://api.figma.com/v1/images/${fileKey}?ids=${ids
    .map(encodeURIComponent)
    .join(",")}&format=${format}${scale}`;

  const MAX_ATTEMPTS = 4;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, { headers: { "X-Figma-Token": token }, signal: AbortSignal.timeout(30_000) });
    } catch {
      // Network/timeout — retry a couple of times, then give up on this chunk.
      if (attempt < MAX_ATTEMPTS - 1) {
        await sleep(backoffMs(attempt));
        continue;
      }
      return {};
    }

    // The images endpoint is the tightly rate-limited one. Back off honoring
    // Retry-After instead of silently returning a page with missing assets.
    if (res.status === 429) {
      const retry = parseRetryAfterSeconds(res);
      if (attempt < MAX_ATTEMPTS - 1) {
        await sleep(retry ? retry * 1000 : backoffMs(attempt));
        continue;
      }
      throw new FigmaRateLimitError(retry);
    }
    if (res.status >= 500) {
      if (attempt < MAX_ATTEMPTS - 1) {
        await sleep(backoffMs(attempt));
        continue;
      }
      return {};
    }
    if (!res.ok) return {};

    const json = (await res.json()) as { images?: Record<string, string | null> };
    const out: Record<string, string> = {};
    for (const [id, u] of Object.entries(json.images ?? {})) if (u) out[id] = u;
    return out;
  }
  return {};
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffMs(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, 8000);
}

function parseRetryAfterSeconds(res: Response): number | undefined {
  const v = Number(res.headers.get("retry-after"));
  return Number.isFinite(v) && v > 0 ? v : undefined;
}

async function downloadAsset(
  url: string,
  dir: string,
  slug: string,
  id: string,
  format: string
): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    const fileName = `${id.replace(/[^a-zA-Z0-9]/g, "-")}.${format}`;
    await fs.writeFile(path.join(dir, fileName), bytes);
    return `/generated/${slug}/${fileName}`;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Code emission
// ---------------------------------------------------------------------------

function emitComponent(opts: {
  componentName: string;
  rootBox: Box;
  canvasBackground: string;
  pageBackground: string;
  items: Item[];
  assetMap: Map<string, string>;
  fontLink: string | null;
}): string {
  const children = opts.items
    .map((item, i) => emitItem(item, i, opts.assetMap))
    .filter(Boolean)
    .join("\n");

  const pageStyle: Style = {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    background: opts.pageBackground,
  };
  // The canvas fills the available width (capped at the design's natural width)
  // and keeps the Figma frame's aspect ratio. `container-type: inline-size`
  // makes every child's `cqw` length resolve against this width, so the whole
  // composition scales uniformly and responsively — no fixed pixel canvas.
  const canvasStyle: Style = {
    position: "relative",
    width: "100%",
    maxWidth: round(opts.rootBox.width),
    aspectRatio: `${round(opts.rootBox.width)} / ${round(opts.rootBox.height)}`,
    containerType: "inline-size",
    background: opts.canvasBackground,
    overflow: "hidden",
  };

  const fontLink = opts.fontLink ? `\n      <link rel="stylesheet" href=${JSON.stringify(opts.fontLink)} />` : "";

  return `export default function ${opts.componentName}() {
  return (
    <>${fontLink}
      <div style={${styleLiteral(pageStyle)}}>
        <div style={${styleLiteral(canvasStyle)}}>
${children}
        </div>
      </div>
    </>
  );
}
`;
}

function emitItem(item: Item, i: number, assetMap: Map<string, string>): string {
  if (item.kind === "img") {
    const src = assetMap.get(item.exportId);
    if (!src) return ""; // export failed — skip rather than render a broken image
    return `          <img key={${i}} src=${JSON.stringify(src)} alt="" style={${styleLiteral(item.style)}} />`;
  }
  if (item.text !== undefined) {
    return `          <div key={${i}} style={${styleLiteral(item.style)}}>{${JSON.stringify(item.text)}}</div>`;
  }
  return `          <div key={${i}} style={${styleLiteral(item.style)}} />`;
}

/** Serializes a style object to a JS object literal: `{ a: 1, b: "x" }`. */
function styleLiteral(style: Style): string {
  const entries = Object.entries(style).map(([k, v]) => `${k}: ${typeof v === "number" ? v : JSON.stringify(v)}`);
  return `{ ${entries.join(", ")} }`;
}

// ---------------------------------------------------------------------------
// Misc helpers
// ---------------------------------------------------------------------------

function googleFontsLink(fonts: Map<string, Set<number>>): string | null {
  if (fonts.size === 0) return null;
  const families = [...fonts.entries()].map(([family, weights]) => {
    const w = [...weights].sort((a, b) => a - b).join(";");
    return `family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@${w}`;
  });
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

function extractRootNode(figmaJson: unknown): FigmaNode {
  const json = figmaJson as { nodes?: Record<string, { document?: FigmaNode }> };
  const first = json.nodes ? Object.values(json.nodes)[0] : undefined;
  if (!first?.document) {
    throw new Error("Respuesta de Figma inesperada: no se encontró el nodo.");
  }
  return first.document;
}

function round(n: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

/**
 * Formats a pixel length as a container-query-width unit (`cqw`), relative to
 * the canvas width. 1cqw = 1% of the canvas width, so expressing every length
 * this way makes the whole cloned frame scale uniformly with its container —
 * responsive on any screen while preserving the design's exact proportions.
 */
function cq(px: number, rootW: number): string {
  return `${round((px / rootW) * 100, 4)}cqw`;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
