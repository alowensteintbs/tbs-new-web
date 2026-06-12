import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/dal";
import { buildStoragePath, isBunnyConfigured, uploadToBunny } from "@/lib/bunny";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

/** Uploads a product image to Bunny Storage and returns its public CDN URL. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!isBunnyConfigured()) {
    return NextResponse.json(
      { error: "Bunny Storage no está configurado en el servidor." },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Formato no permitido. Usá JPG, PNG, WebP o AVIF." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen supera los 5 MB." }, { status: 400 });
  }

  try {
    const path = buildStoragePath(file.name);
    const { url } = await uploadToBunny(await file.arrayBuffer(), path, file.type);
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al subir la imagen." },
      { status: 500 }
    );
  }
}
