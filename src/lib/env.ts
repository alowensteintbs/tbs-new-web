import { z } from "zod";

/**
 * Validated environment variables. Importing this module throws at boot if a
 * required variable is missing or malformed, so the rest of the app can read
 * `env.*` without re-checking. Add new server vars here as features land.
 */
const schema = z.object({
  // Auth
  SESSION_SECRET: z.string().min(1, "SESSION_SECRET is required"),
  // Database (MariaDB/MySQL connection string consumed by the Prisma adapter)
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection URL"),
  // Figma → IA page generator
  FIGMA_TOKEN: z.string().min(1, "FIGMA_TOKEN is required"),
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
  // Public site base URL (used for canonical URLs, sitemap, OG). Optional in dev.
  SITE_URL: z.string().url().optional(),
  // Google Tag Manager container id (fallback when no SiteSetting is stored)
  NEXT_PUBLIC_GTM_ID: z.string().optional(),
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

/** Public site base URL with a sensible local fallback. No trailing slash. */
export function getSiteUrl(): string {
  return (env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
