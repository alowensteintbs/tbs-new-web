import Script from "next/script";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import { env, getSiteUrl } from "@/lib/env";
import { JsonLd, organizationSchema } from "@/components/seo/json-ld";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gtmId = env.NEXT_PUBLIC_GTM_ID;
  const gaId = env.NEXT_PUBLIC_GA_ID;
  const hubspotId = env.NEXT_PUBLIC_HUBSPOT_ID;
  const pixelId = env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
  const siteName = env.NEXT_PUBLIC_SITE_NAME || "TBS";

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
