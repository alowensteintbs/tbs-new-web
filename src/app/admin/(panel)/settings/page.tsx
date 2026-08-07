import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/dal";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./_components/settings-form";

export const metadata: Metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  await requireSession();

  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ajustes del sitio</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configuración general y códigos de analítica/marketing que se cargan en
          la tienda pública.
        </p>
      </div>

      <SettingsForm
        values={{
          site_name: settings.site_name ?? "",
          gtm_id: settings.gtm_id ?? "",
          ga_id: settings.ga_id ?? "",
          hubspot_id: settings.hubspot_id ?? "",
          facebook_pixel_id: settings.facebook_pixel_id ?? "",
        }}
      />
    </div>
  );
}
