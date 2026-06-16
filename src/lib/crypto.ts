import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";
import { env } from "@/lib/env";

/**
 * Symmetric encryption for secrets at rest (payment gateway credentials).
 *
 * AES-256-GCM with a per-value random salt + IV. The 32-byte key is derived
 * from `SESSION_SECRET` via scrypt, so no extra env var is required — but the
 * stored ciphertext is unreadable to anyone with only DB access.
 *
 * Output format (base64 parts, dot-separated): `salt.iv.authTag.ciphertext`.
 */

const ALGO = "aes-256-gcm";
const KEY_LEN = 32;
const SALT_LEN = 16;
const IV_LEN = 12;

function deriveKey(salt: Buffer): Buffer {
  return scryptSync(env.SESSION_SECRET, salt, KEY_LEN);
}

export function encrypt(plaintext: string): string {
  const salt = randomBytes(SALT_LEN);
  const iv = randomBytes(IV_LEN);
  const key = deriveKey(salt);

  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [salt, iv, authTag, ciphertext]
    .map((b) => b.toString("base64"))
    .join(".");
}

export function decrypt(payload: string): string {
  const [saltB64, ivB64, tagB64, dataB64] = payload.split(".");
  if (!saltB64 || !ivB64 || !tagB64 || !dataB64) {
    throw new Error("Malformed ciphertext");
  }

  const salt = Buffer.from(saltB64, "base64");
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(dataB64, "base64");

  const key = deriveKey(salt);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}
