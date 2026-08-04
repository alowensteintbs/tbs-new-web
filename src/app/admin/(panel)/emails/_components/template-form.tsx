"use client";

import { useActionState, useState, useTransition } from "react";
import { inputCls } from "@/app/admin/_components/form-field";
import {
  updateTemplate,
  resetTemplate,
  type EmailFormState,
} from "../actions";

type Variable = { name: string; description: string };

/** Client-side sample data for the live preview (mirrors sampleVars server-side). */
const SAMPLE: Record<string, string> = {
  customerName: "María García",
  orderNumber: "TBS-000123",
  orderDate: "4 de agosto de 2026",
  paymentMethod: "Tarjeta (Stripe)",
  total: "297,00 €",
  itemsList:
    '<div style="display:flex;justify-content:space-between;font-size:14px;padding:4px 0"><span>Curso de Trading Avanzado</span><span>297,00 €</span></div>',
  orderUrl: "#",
  siteName: "Traders Business School",
};

function renderPreview(tpl: string): string {
  return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, n: string) => SAMPLE[n] ?? "");
}

export function TemplateForm({
  templateKey,
  subject,
  html,
  variables,
}: {
  templateKey: string;
  subject: string;
  html: string;
  variables: Variable[];
}) {
  const [state, formAction, isPending] = useActionState<EmailFormState, FormData>(
    updateTemplate,
    {}
  );
  const [subjectValue, setSubjectValue] = useState(subject);
  const [htmlValue, setHtmlValue] = useState(html);
  const [isResetting, startReset] = useTransition();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Editor */}
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="key" value={templateKey} />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Asunto
          </label>
          <input
            name="subject"
            value={subjectValue}
            onChange={(e) => setSubjectValue(e.target.value)}
            className={inputCls}
          />
          {state.fieldErrors?.subject && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.subject[0]}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            HTML
          </label>
          <textarea
            name="html"
            value={htmlValue}
            onChange={(e) => setHtmlValue(e.target.value)}
            rows={18}
            spellCheck={false}
            className={`${inputCls} font-mono text-xs leading-relaxed`}
          />
          {state.fieldErrors?.html && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.html[0]}
            </p>
          )}
        </div>

        <div className="rounded-lg bg-gray-50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Variables disponibles
          </p>
          <div className="flex flex-wrap gap-1.5">
            {variables.map((v) => (
              <span
                key={v.name}
                title={v.description}
                className="rounded bg-white px-2 py-1 font-mono text-[11px] text-gray-600 ring-1 ring-gray-200"
              >
                {`{{${v.name}}}`}
              </span>
            ))}
          </div>
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            {isPending ? "Guardando…" : "Guardar plantilla"}
          </button>
          <button
            type="button"
            disabled={isResetting}
            onClick={() => {
              if (!confirm("¿Restaurar el asunto y el HTML por defecto?")) return;
              startReset(async () => {
                await resetTemplate(templateKey);
                window.location.reload();
              });
            }}
            className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            Restaurar por defecto
          </button>
        </div>
      </form>

      {/* Live preview */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Vista previa
        </p>
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-2 text-sm">
            <span className="text-gray-400">Asunto: </span>
            <span className="font-medium text-gray-900">
              {renderPreview(subjectValue)}
            </span>
          </div>
          <iframe
            title="Vista previa del email"
            className="h-[520px] w-full rounded-b-xl"
            srcDoc={renderPreview(htmlValue)}
          />
        </div>
      </div>
    </div>
  );
}
