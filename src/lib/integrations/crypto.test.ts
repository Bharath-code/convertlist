import { describe, it, expect } from "vitest";
import { encryptSecret, decryptSecret } from "./crypto";

describe("crypto", () => {
  const original = process.env.INTEGRATION_ENCRYPTION_KEY;
  beforeAll(() => {
    // Use a deterministic key for tests
    process.env.INTEGRATION_ENCRYPTION_KEY = "test-key-for-vitest-32-chars-long-string";
  });
  afterAll(() => {
    if (original === undefined) delete process.env.INTEGRATION_ENCRYPTION_KEY;
    else process.env.INTEGRATION_ENCRYPTION_KEY = original;
  });

  it("round-trips a string", () => {
    const enc = encryptSecret("https://hooks.slack.com/services/T0/B0/XXX");
    expect(enc).not.toContain("https://hooks.slack.com");
    const dec = decryptSecret(enc);
    expect(dec).toBe("https://hooks.slack.com/services/T0/B0/XXX");
  });

  it("returns null on invalid payload", () => {
    expect(decryptSecret("not-base64!@#$")).toBeNull();
    expect(decryptSecret("")).toBeNull();
    expect(decryptSecret(Buffer.from("too-short").toString("base64"))).toBeNull();
  });

  it("uses a fresh IV each encrypt", () => {
    const a = encryptSecret("same input");
    const b = encryptSecret("same input");
    expect(a).not.toBe(b);
    expect(decryptSecret(a)).toBe("same input");
    expect(decryptSecret(b)).toBe("same input");
  });
});

import { beforeAll, afterAll } from "vitest";
