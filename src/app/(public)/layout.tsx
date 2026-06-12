import { GoogleTagManager } from "@next/third-parties/google";
import { env, getSiteUrl } from "@/lib/env";
import { getSetting } from "@/lib/settings";
import { JsonLd, organizationSchema } from "@/components/seo/json-ld";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // GTM id: SiteSetting takes precedence, env var is the fallback.
  const gtmId = (await getSetting("gtm_id")) ?? env.NEXT_PUBLIC_GTM_ID;
  const siteName = (await getSetting("site_name")) ?? "TBS";

  return (
    <>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      <JsonLd
        data={organizationSchema({ name: siteName, url: getSiteUrl() })}
      />
      {children}
    </>
  );
}
