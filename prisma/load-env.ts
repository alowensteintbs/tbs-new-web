import { config as loadEnv } from "dotenv";

// Load env BEFORE any module that reads it (e.g. src/lib/env.ts) is imported.
// .env.local overrides .env — it holds SESSION_SECRET, used to encrypt gateway
// config. Mirrors Next.js' env file precedence. Import this first in scripts.
loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });
