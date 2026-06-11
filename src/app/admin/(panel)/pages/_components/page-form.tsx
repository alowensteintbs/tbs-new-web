"use client";

import { useActionState, useRef, useState } from "react";
import { createPage, updatePage, type PageFormState } from "../actions";

type InitialValues = {
  id: string;
  name: string;
  slug: string;
  figmaFileKey: string;
  figmaNodeId: string;
  status: "DRAFT" | "PUBLISHED";
};

type FigmaParseState = { ok: true } | { ok: false; message: string } | null;

const inputCls =
  "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

function parseFigmaUrl(url: string): { fileKey: string; nodeId: string } | null {
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/(?:design|file)\/([^/]+)/);
    if (!match) return null;
    const rawNodeId = u.searchParams.get("node-id");
    if (!rawNodeId) return null;
    return { fileKey: match[1], nodeId: rawNodeId };
  } catch {
    return null;
  }
}

export function PageForm({ initialValues }: { initialValues?: InitialValues }) {
  const isEditing = !!initialValues;
  const action = isEditing ? updatePage : createPage;
  const [state, formAction, isPending] = useActionState<PageFormState, FormData>(action, {});

  const slugRef = useRef<HTMLInputElement>(null);
  const fileKeyRef = useRef<HTMLInputElement>(null);
  const nodeIdRef = useRef<HTMLInputElement>(null);
  const [figmaState, setFigmaState] = useState<FigmaParseState>(null);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isEditing) return;
    if (slugRef.current && !slugRef.current.dataset.touched) {
      slugRef.current.value = e.target.value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    }
  }

  function handleFigmaLinkChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.trim();
    if (!val) { setFigmaState(null); return; }
    const parsed = parseFigmaUrl(val);
    if (!parsed) {
      setFigmaState({ ok: false, message: "No se pudo parsear el link. Asegurate de que sea un link de Figma con un frame seleccionado." });
      return;
    }
    if (fileKeyRef.current) fileKeyRef.current.value = parsed.fileKey;
    if (nodeIdRef.current) nodeIdRef.current.value = parsed.nodeId;
    setFigmaState({ ok: true });
  }

  const figmaLinkDefault = initialValues
    ? `https://www.figma.com/design/${initialValues.figmaFileKey}/file?node-id=${initialValues.figmaNodeId}`
    : undefined;

  const figmaError =
    state.fieldErrors?.figmaFileKey?.[0] ?? state.fieldErrors?.figmaNodeId?.[0];

  return (
    <form action={formAction} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
      {isEditing && <input type="hidden" name="id" value={initialValues.id} />}
      <input ref={fileKeyRef} type="hidden" name="figmaFileKey" defaultValue={initialValues?.figmaFileKey} />
      <input ref={nodeIdRef} type="hidden" name="figmaNodeId" defaultValue={initialValues?.figmaNodeId} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Nombre de la página"
          name="name"
          placeholder="Landing Hero"
          defaultValue={initialValues?.name}
          error={state.fieldErrors?.name?.[0]}
          onChange={handleNameChange}
        />
        <Field
          label="Slug"
          name="slug"
          placeholder="landing-hero"
          defaultValue={initialValues?.slug}
          error={state.fieldErrors?.slug?.[0]}
          inputRef={slugRef}
          onInput={() => { if (slugRef.current) slugRef.current.dataset.touched = "1"; }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Link del frame en Figma
        </label>
        <input
          type="text"
          placeholder="https://www.figma.com/design/aBcDeFg/Mi-Proyecto?node-id=123-456"
          defaultValue={figmaLinkDefault}
          onChange={handleFigmaLinkChange}
          className={inputCls}
        />
        {figmaState?.ok === true && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Frame detectado correctamente
          </p>
        )}
        {figmaState?.ok === false && (
          <p className="mt-1.5 text-xs text-red-500">{figmaState.message}</p>
        )}
        {figmaError && <p className="mt-1.5 text-xs text-red-500">{figmaError}</p>}
        <p className="mt-1 text-xs text-gray-400">
          Seleccioná un frame en Figma, copiá el link (Ctrl+L) y pegalo acá.
        </p>
      </div>

      {isEditing && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
          <select
            name="status"
            defaultValue={initialValues.status}
            className={inputCls}
          >
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicada</option>
          </select>
        </div>
      )}

      {state.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear página"}
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInput?: React.ReactEventHandler<HTMLInputElement>;
  inputRef?: React.RefObject<HTMLInputElement | null>;
};

function Field({ label, name, placeholder, defaultValue, error, onChange, onInput, inputRef }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        ref={inputRef}
        type="text"
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        onChange={onChange}
        onInput={onInput}
        className={inputCls}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
