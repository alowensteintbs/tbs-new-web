import "server-only";
import { db } from "@/lib/db";
import { EMAIL_TEMPLATES, getTemplateDef, type EmailTrigger } from "./templates";

/** A catalog template merged with its stored overrides (if any). */
export type MergedTemplate = {
  key: string;
  label: string;
  description: string;
  trigger: EmailTrigger;
  enabled: boolean;
  subject: string;
  html: string;
  /** Whether a DB row exists yet (vs. showing catalog defaults). */
  persisted: boolean;
};

function merge(
  def: (typeof EMAIL_TEMPLATES)[number],
  row: { enabled: boolean; subject: string; html: string } | null
): MergedTemplate {
  return {
    key: def.key,
    label: def.label,
    description: def.description,
    trigger: def.trigger,
    enabled: row?.enabled ?? false,
    subject: row?.subject ?? def.defaultSubject,
    html: row?.html ?? def.defaultHtml,
    persisted: !!row,
  };
}

/** All catalog templates, overlaid with any stored subject/html/enabled. */
export async function getMergedTemplates(): Promise<MergedTemplate[]> {
  const rows = await db.emailTemplate.findMany();
  const byKey = new Map(rows.map((r) => [r.key, r]));
  return EMAIL_TEMPLATES.map((def) => merge(def, byKey.get(def.key) ?? null));
}

/** One catalog template merged with its stored override, or null if unknown. */
export async function getMergedTemplate(
  key: string
): Promise<MergedTemplate | null> {
  const def = getTemplateDef(key);
  if (!def) return null;
  const row = await db.emailTemplate.findUnique({ where: { key } });
  return merge(def, row);
}
