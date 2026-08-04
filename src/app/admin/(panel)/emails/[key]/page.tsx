import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMergedTemplate } from "@/lib/email/store";
import { getTemplateDef } from "@/lib/email/templates";
import { TemplateForm } from "../_components/template-form";

export const metadata: Metadata = { title: "Editar email" };

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const template = await getMergedTemplate(key);
  const def = getTemplateDef(key);
  if (!template || !def) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/emails"
          className="text-sm text-gray-500 hover:underline"
        >
          ← Volver a Emails
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {template.label}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{template.description}</p>
      </div>

      <TemplateForm
        templateKey={template.key}
        subject={template.subject}
        html={template.html}
        variables={def.variables}
      />
    </div>
  );
}
