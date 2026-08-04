import type { Metadata } from "next";
import { getEmailSettings } from "@/lib/email/send";
import { getMergedTemplates } from "@/lib/email/store";
import { EmailSettingsForm } from "./_components/email-settings-form";
import { TemplateTable } from "./_components/template-table";

export const metadata: Metadata = { title: "Emails" };

export default async function EmailsPage() {
  const [settings, templates] = await Promise.all([
    getEmailSettings(),
    getMergedTemplates(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Emails</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configura el envío y edita los correos transaccionales que recibe el
          comprador según el estado de su pedido.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Envío (Resend)
        </h2>
        <EmailSettingsForm
          fromEmail={settings?.fromEmail ?? ""}
          fromName={settings?.fromName ?? ""}
          hasApiKey={!!settings?.apiKey}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Plantillas
        </h2>
        <TemplateTable templates={templates} />
      </section>
    </div>
  );
}
