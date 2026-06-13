import { describe, it, expect, vi, afterEach } from "vitest";
import { sendReplyNotification } from "./notify";

const originalFetch = global.fetch;
afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("sendReplyNotification", () => {
  const baseNotification = {
    leadId: "lead_1",
    leadName: "Sarah Chen",
    leadEmail: "sarah@acme.co",
    leadCompany: "AcmeCo",
    waitlistName: "My waitlist",
    replySnippet: "Yes, I'd pay for this!",
    replyAt: new Date("2026-06-13T12:00:00Z"),
    dashboardUrl: "https://app.convertlist.ai/results/wl_1?lead=lead_1",
  };

  it("posts a Slack-formatted payload to hooks.slack.com", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await sendReplyNotification(
      "https://hooks.slack.com/services/T0/B0/XXX",
      baseNotification
    );

    expect(result.ok).toBe(true);
    expect(result.platform).toBe("slack");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://hooks.slack.com/services/T0/B0/XXX");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.text).toContain("Sarah Chen");
    expect(body.blocks).toBeDefined();
    expect(body.blocks[1].text.text).toContain("I'd pay for this");
  });

  it("posts a Discord-formatted payload to discord.com", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await sendReplyNotification(
      "https://discord.com/api/webhooks/123/abcdef",
      baseNotification
    );

    expect(result.ok).toBe(true);
    expect(result.platform).toBe("discord");
    const body = JSON.parse((fetchMock.mock.calls[0]! as any)[1].body);
    expect(body.content).toContain("Sarah Chen");
    expect(body.embeds[0].description).toContain("I'd pay for this");
  });

  it("truncates long snippets", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const long = "x".repeat(1000);
    await sendReplyNotification("https://hooks.slack.com/services/T0/B0/XXX", {
      ...baseNotification,
      replySnippet: long,
    });

    const body = JSON.parse((fetchMock.mock.calls[0]! as any)[1].body);
    const blockText = body.blocks[1].text.text as string;
    expect(blockText.length).toBeLessThan(long.length);
  });

  it("returns ok=false on HTTP error", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response("no_service", { status: 503 })) as unknown as typeof fetch;

    const result = await sendReplyNotification(
      "https://hooks.slack.com/services/T0/B0/XXX",
      baseNotification
    );
    expect(result.ok).toBe(false);
    expect(result.status).toBe(503);
  });

  it("returns ok=false with error on no URL", async () => {
    const result = await sendReplyNotification("", baseNotification);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("no webhook url");
  });

  it("falls back to generic JSON for unknown hosts", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await sendReplyNotification(
      "https://example.com/webhook",
      baseNotification
    );
    expect(result.ok).toBe(true);
    expect(result.platform).toBe("unknown");
    const body = JSON.parse((fetchMock.mock.calls[0]! as any)[1].body);
    expect(body.text).toContain("Sarah Chen");
  });
});
