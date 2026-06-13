/**
 * AES-256-GCM symmetric encryption for stored OAuth tokens / webhook secrets.
 *
 * Format: base64( iv (12 bytes) || tag (16 bytes) || ciphertext )
 * Key:    INTEGRATION_ENCRYPTION_KEY env var (base64, 32 bytes)
 *
 * Falls back to a derived dev key when the env var is missing so the build
 * still works in local-only environments. NEVER use the fallback in production.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;
const KEY_LEN = 32;

function getKey(): Buffer {
  const raw = process.env.INTEGRATION_ENCRYPTION_KEY;
  if (raw && raw.length >= 32) {
    try {
      const buf = Buffer.from(raw, "base64");
      if (buf.length === KEY_LEN) return buf;
    } catch {
      // fall through to derivation
    }
    // accept any string >= 32 chars and hash it
    return scryptSync(raw, "convertlist-salt", KEY_LEN);
  }
  // Dev fallback — derived from a hardcoded string. DO NOT use in production.
  return scryptSync("convertlist-dev-encryption-key", "convertlist-salt", KEY_LEN);
}

export function encryptSecret(plaintext: string): string {
  if (!plaintext) return "";
  const key = getKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptSecret(payload: string): string | null {
  if (!payload) return null;
  try {
    const key = getKey();
    const buf = Buffer.from(payload, "base64");
    if (buf.length < IV_LEN + TAG_LEN + 1) return null;
    const iv = buf.subarray(0, IV_LEN);
    const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
    const ciphertext = buf.subarray(IV_LEN + TAG_LEN);
    const decipher = createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}

/** Decrypt any of the encrypted fields on an Integration, returning null on failure. */
export function decryptIntegrationField(
  field: "accessToken" | "refreshToken" | "webhookSecret",
  value: string | null | undefined
): string | null {
  if (!value) return null;
  return decryptSecret(value);
}
