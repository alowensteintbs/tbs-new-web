import "server-only";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";

/** Decrypted email transport settings. */
export type EmailSettings = {
  fromEmail: string;
  fromName: string;
  apiKey: string;
};

/** Read the singleton transport settings, or null if not configured yet. */
export async function getEmailSettings(): Promise<EmailSettings | null> {
  const row = await db.emailSettings.findUnique({ where: { id: "singleton" } });
  if (!row) return null;
  let apiKey = "";
  try {
    apiKey = (JSON.parse(decrypt(row.config)) as { apiKey?: string }).apiKey ?? "";
  } catch {
    apiKey = "";
  }
  return { fromEmail: row.fromEmail, fromName: row.fromName, apiKey };
}

export type SendResult = { sent: boolean; skipped?: string; error?: string };

/**
 * Send one email through Resend's HTTP API (no SDK dependency). Returns a
 * result instead of throwing so callers (e.g. the payment webhook) never fail
 * because of an email problem. Skips silently when the transport isn't set up.
 */
export async function sendEmail(msg: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const settings = await getEmailSettings();
  if (!settings?.apiKey || !settings.fromEmail) {
    return { sent: false, skipped: "transport not configured" };
  }

  const from = settings.fromName
    ? `${settings.fromName} <${settings.fromEmail}>`
    : settings.fromEmail;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${settings.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { sent: false, error: `Resend ${res.status}: ${detail}` };
    }
    return { sent: true };
  } catch (err) {
    return { sent: false, error: String(err) };
  }
}
