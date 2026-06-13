import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock @/google/generative-ai and @/lib/db and @/lib/scoring/conversion-analytics
// so reply-detector can be tested in isolation.

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(function () {
    return {
      getGenerativeModel: () => ({
        generateContent: vi.fn().mockResolvedValue({ response: { text: () => "interested" } }),
      }),
    };
  }),
}));

const leadRecord: Record<string, any> = {};
let integrationRecord: any = null;

const fakeTx = {
  lead: { update: vi.fn().mockResolvedValue(undefined) },
  leadStatusHistory: { create: vi.fn().mockResolvedValue(undefined) },
};

vi.mock("@/lib/db", () => ({
  db: {
    lead: {
      findUnique: vi.fn(async ({ where }) => leadRecord[where.id] ?? null),
      findFirst: vi.fn(async ({ where }) => {
        const email = where?.OR?.[0]?.email || where?.OR?.[1]?.replyForwarder;
        return Object.values(leadRecord).find(
          (l: any) => l.email === email || l.replyForwarder === email
        ) ?? null;
      }),
      update: vi.fn(async ({ where, data }) => {
        if (leadRecord[where.id]) Object.assign(leadRecord[where.id], data);
        return leadRecord[where.id];
      }),
    },
    integration: {
      findUnique: vi.fn(async () => integrationRecord),
      update: vi.fn(async () => integrationRecord),
    },
    leadStatusHistory: { create: vi.fn(async () => undefined) },
    $transaction: vi.fn(async (ops) => {
      // For tests, just run them sequentially via the mock delegates
      if (Array.isArray(ops)) {
        const out: unknown[] = [];
        for (const op of ops) out.push(await op);
        return out;
      }
      return ops(fakeTx);
    }),
  },
}));

vi.mock("@/lib/scoring/conversion-analytics", () => ({
  trackConversion: vi.fn(),
}));

import { recordReply } from "./reply-detector";
import { encryptSecret } from "./crypto";
import * as notifyMod from "./notify";

beforeEach(() => {
  Object.keys(leadRecord).forEach((k) => delete leadRecord[k]);
  integrationRecord = null;
  vi.spyOn(notifyMod, "sendReplyNotification").mockResolvedValue({
    ok: true,
    platform: "slack",
    status: 200,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("recordReply", () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-key";
  });

  it("returns found=false when no lead matches", async () => {
    const r = await recordReply({ email: "nobody@nowhere.io", source: "instantly" });
    expect(r.found).toBe(false);
  });

  it("marks a lead as REPLIED and fires notification", async () => {
    leadRecord["lead_1"] = {
      id: "lead_1",
      email: "sarah@acme.co",
      name: "Sarah",
      company: "AcmeCo",
      status: "CONTACTED",
      waitlistId: "wl_1",
      waitlist: { id: "wl_1", name: "Waitlist A", userId: "user_1" },
    };
    integrationRecord = {
      id: "int_1",
      userId: "user_1",
      provider: "slack",
      enabled: true,
      webhookSecretEnc: encryptSecret("https://hooks.slack.com/services/T0/B0/XXX"),
    };

    const r = await recordReply({
      leadId: "lead_1",
      replyText: "Yes, I'd pay for this",
      source: "instantly",
    });

    expect(r.found).toBe(true);
    expect(r.updated).toBe(true);
    expect(r.notified).toBe(true);
    expect(leadRecord["lead_1"].status).toBe("INTERESTED"); // auto-promoted on "interested" intent
    expect(notifyMod.sendReplyNotification).toHaveBeenCalledOnce();
  });

  it("is idempotent — does not re-notify or re-update on second call", async () => {
    leadRecord["lead_1"] = {
      id: "lead_1",
      email: "sarah@acme.co",
      status: "REPLIED", // already replied
      waitlist: { id: "wl_1", name: "Waitlist A", userId: "user_1" },
    };
    integrationRecord = {
      id: "int_1",
      enabled: true,
      webhookSecretEnc: encryptSecret("https://hooks.slack.com/services/T0/B0/XXX"),
    };

    const r = await recordReply({ leadId: "lead_1", replyText: "more", source: "instantly" });

    expect(r.found).toBe(true);
    expect(r.updated).toBe(false); // already replied
    expect(r.notified).toBe(false); // idempotent
  });

  it("matches by email when leadId is not provided", async () => {
    leadRecord["lead_1"] = {
      id: "lead_1",
      email: "sarah@acme.co",
      status: "CONTACTED",
      waitlist: { id: "wl_1", name: "Waitlist A", userId: "user_1" },
    };
    integrationRecord = null; // no Slack configured

    const r = await recordReply({ email: "sarah@acme.co", source: "email_forward" });

    expect(r.found).toBe(true);
    expect(r.updated).toBe(true);
    expect(leadRecord["lead_1"].status).toBe("REPLIED");
  });

  it("continues when notification fails (does not throw)", async () => {
    leadRecord["lead_1"] = {
      id: "lead_1",
      email: "sarah@acme.co",
      status: "CONTACTED",
      waitlist: { id: "wl_1", name: "Waitlist A", userId: "user_1" },
    };
    integrationRecord = {
      id: "int_1",
      enabled: true,
      webhookSecretEnc: encryptSecret("https://hooks.slack.com/services/T0/B0/XXX"),
    };
    (notifyMod.sendReplyNotification as any).mockResolvedValueOnce({
      ok: false,
      platform: "slack",
      status: 404,
      error: "channel_not_found",
    });

    const r = await recordReply({ leadId: "lead_1", source: "instantly" });

    expect(r.notified).toBe(false);
    expect(r.notifyError).toBe("channel_not_found");
    expect(leadRecord["lead_1"].status).toBe("REPLIED"); // still updated
  });
});
