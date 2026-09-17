import { z } from "zod";

/** Public configuration shared by static and dynamic routes. */
const schema = z.object({
  SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_GTM_ID: z.string().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_HUBSPOT_ID: z.string().optional(),
  NEXT_PUBLIC_FACEBOOK_PIXEL_ID: z.string().optional(),
  NEXT_PUBLIC_SITE_NAME: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

function parseEnv() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = z.flattenError(parsed.error).fieldErrors;
    throw new Error(
      `Invalid environment variables:\n${JSON.stringify(issues, null, 2)}`
    );
  }
  return parsed.data;
}

export const env = parseEnv();

/** Validate private configuration only in the feature that actually needs it. */
export function requireEnv(name: "DATABASE_URL" | "SESSION_SECRET"): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

/** Public site base URL with a sensible local fallback. No trailing slash. */
export function getSiteUrl(): string {
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return (env.SITE_URL ?? (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000")).replace(/\/$/, "");
}
