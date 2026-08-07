import Script from "next/script";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import { env, getSiteUrl } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import { JsonLd, organizationSchema } from "@/components/seo/json-ld";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  // Tracking ids: a SiteSetting takes precedence, the env var is the fallback.
  const gtmId = settings.gtm_id || env.NEXT_PUBLIC_GTM_ID;
  const gaId = settings.ga_id;
  const hubspotId = settings.hubspot_id;
  const pixelId = settings.facebook_pixel_id;
  const siteName = settings.site_name || "TBS";

  return (
    <>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      {gaId && <GoogleAnalytics gaId={gaId} />}

      {hubspotId && (
        <Script
          id="hs-script-loader"
          strategy="afterInteractive"
          src={`//js.hs-scripts.com/${hubspotId}.js`}
        />
      )}

      {pixelId && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixelId}');fbq('track','PageView');`}
        </Script>
      )}

      <JsonLd data={organizationSchema({ name: siteName, url: getSiteUrl() })} />
      {children}
    </>
  );
}
