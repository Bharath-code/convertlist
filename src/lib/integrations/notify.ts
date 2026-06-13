/**
 * Slack/Discord webhook notifier.
 *
 * Both platforms accept the same JSON:webhook payload shape with minor tweaks.
 * Discord requires `content`; Slack prefers `text`/`blocks`.
 * This helper auto-detects the platform from the URL and normalises the payload.
 */

export interface ReplyNotification {
  leadId: string;
  leadName: string | null;
  leadEmail: string;
  leadCompany: string | null;
  waitlistName: string;
  replySnippet: string | null;
  replyAt: Date;
  dashboardUrl: string;
}

function isDiscordUrl(url: string): boolean {
  return /discord(?:app)?\.com\/api\/webhooks\//i.test(url);
}

function isSlackUrl(url: string): boolean {
  return /hooks\.slack\.com\//i.test(url);
}

function buildSlackBlocks(n: ReplyNotification) {
  const leadLabel = n.leadName || n.leadEmail;
  const company = n.leadCompany ? ` (${n.leadCompany})` : "";
  const snippet = n.replySnippet
    ? `\n>${n.replySnippet.slice(0, 280).replace(/\n/g, "\n> ")}`
    : "";

  return {
    text: `🎉 ${leadLabel}${company} replied on "${n.waitlistName}"`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `🎉 New reply from ${leadLabel}` },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${leadLabel}*${company} replied to your outreach in *"${n.waitlistName}"*.${snippet}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Open in ConvertList" },
            url: n.dashboardUrl,
            style: "primary",
          },
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Reply at ${n.replyAt.toISOString()} • <${n.dashboardUrl}|View lead>`,
          },
        ],
      },
    ],
  };
}

function buildDiscordPayload(n: ReplyNotification) {
  const leadLabel = n.leadName || n.leadEmail;
  const company = n.leadCompany ? ` (${n.leadCompany})` : "";
  const snippet = n.replySnippet
    ? `\n> ${n.replySnippet.slice(0, 280).replace(/\n/g, "\n> ")}`
    : "";

  return {
    content: `🎉 **${leadLabel}**${company} replied to your outreach in *"${n.waitlistName}"*`,
    embeds: [
      {
        title: "New reply",
        description: snippet.trim() || "_No snippet captured_",
        color: 0x22c55e,
        timestamp: n.replyAt.toISOString(),
        url: n.dashboardUrl,
      },
    ],
  };
}

export interface NotifyResult {
  ok: boolean;
  platform: "slack" | "discord" | "unknown";
  status: number;
  error?: string;
}

export async function sendReplyNotification(
  webhookUrl: string,
  notification: ReplyNotification
): Promise<NotifyResult> {
  if (!webhookUrl) {
    return { ok: false, platform: "unknown", status: 0, error: "no webhook url" };
  }

  try {
    let body: unknown;
    let platform: NotifyResult["platform"] = "unknown";

    if (isSlackUrl(webhookUrl)) {
      body = buildSlackBlocks(notification);
      platform = "slack";
    } else if (isDiscordUrl(webhookUrl)) {
      body = buildDiscordPayload(notification);
      platform = "discord";
    } else {
      // Generic JSON:webhook — best-effort
      body = {
        text: `🎉 ${notification.leadName || notification.leadEmail} replied to "${notification.waitlistName}". Open: ${notification.dashboardUrl}`,
      };
      platform = "unknown";
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        platform,
        status: res.status,
        error: text.slice(0, 200) || res.statusText,
      };
    }

    return { ok: true, platform, status: res.status };
  } catch (err) {
    return {
      ok: false,
      platform: "unknown",
      status: 0,
      error: err instanceof Error ? err.message : "unknown error",
    };
  }
}
