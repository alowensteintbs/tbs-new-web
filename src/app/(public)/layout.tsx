import { Playfair_Display, Raleway, Space_Grotesk } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { getSiteUrl } from "@/lib/env";
import { getSetting } from "@/lib/settings";
import { JsonLd, organizationSchema } from "@/components/seo/json-ld";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  style: ["normal", "italic"],
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: "swap",
});

const raleway = Raleway({
  variable: "--font-tbs-raleway",
  subsets: ["latin"],
  display: "swap",
});

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The admin setting is the single source of truth. No environment fallback:
  // clearing the field must mean no third-party marketing/analytics script is
  // sent to the buyer's browser.
  const gtmId = await getSetting("gtm_id");
  const siteName = "Traders Business School";

  return (
    <>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}

      <JsonLd data={organizationSchema({ name: siteName, url: getSiteUrl() })} />
      <div
        className={`${spaceGrotesk.variable} ${playfairDisplay.variable} ${raleway.variable} contents`}
      >
        {children}
      </div>
    </>
  );
}
