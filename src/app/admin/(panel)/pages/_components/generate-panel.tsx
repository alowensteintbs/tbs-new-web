"use client";

import { useState, useEffect, useRef } from "react";
import { CodeViewer } from "./code-viewer";

type Page = {
  id: string;
  name: string;
  slug: string;
  figmaFileKey: string;
  figmaNodeId: string;
  generatedCode: string | null;
};

type Status = "idle" | "generating" | "done" | "error";

const STATUS_LABEL: Record<Status, string> = {
  idle:       "Generar componente",
  generating: "Clonando el diseño de Figma...",
  done:       "Generar de nuevo",
  error:      "Reintentar",
};

export function GeneratePanel({ page }: { page: Page }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(page.generatedCode);
  const [force, setForce] = useState(false);
  const [cached, setCached] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const isLoading = status === "generating";

  async function handleGenerate() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("generating");
    setErrorMsg(null);

    try {
      const res = await fetch("/admin/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          figmaFileKey: page.figmaFileKey,
          figmaNodeId:  page.figmaNodeId,
          pageName:     page.name,
          slug:         page.slug,
          force,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Error al generar código");
      }

      const { code, cached } = await res.json() as { code: string; cached?: boolean };
      setGeneratedCode(code);
      setCached(Boolean(cached));
      setStatus("done");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Error desconocido");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Generar componente React</h3>
          <p className="mt-1 text-xs text-gray-500">
            Se clona el diseño de Figma pixel-perfect a un componente TSX. Si el diseño no
            cambió, se reutiliza la caché (sin volver a renderizar imágenes en Figma).
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500 space-y-1">
          <p><span className="font-medium text-gray-700">Página:</span> {page.name}</p>
          <p><span className="font-medium text-gray-700">File Key:</span> {page.figmaFileKey}</p>
          <p><span className="font-medium text-gray-700">Node ID:</span> {page.figmaNodeId}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading && (
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent align-middle" />
            )}
            {STATUS_LABEL[status]}
          </button>

          {status === "done" && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {cached ? "Sin cambios en Figma — reusé la caché" : "Guardado"}
            </span>
          )}
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={force}
            onChange={(e) => setForce(e.target.checked)}
            disabled={isLoading}
            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Volver a traer de Figma (ignorar caché)
        </label>

        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMsg}
          </div>
        )}
      </div>

      {generatedCode && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Código generado</h3>
          <CodeViewer code={generatedCode} />
        </section>
      )}
    </div>
  );
}
