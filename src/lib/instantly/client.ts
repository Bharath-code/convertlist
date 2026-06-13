/**
 * Instantly.ai API client.
 *
 * Single-workspace mode: uses the global INSTANTLY_API_KEY env var.
 * (Instantly's public API is key-based, not OAuth — this matches real usage.)
 *
 * All methods are pure HTTP — the caller is responsible for persisting the
 * returned `campaign_id` / `lead_id` so webhook events can be correlated.
 */

const BASE = "https://api.instantly.ai/api/v1";

export type CampaignStatus = "running" | "paused" | "completed" | "draft";

export interface CreateCampaignInput {
  name: string;
  fromEmail: string;
  subject?: string;
  body?: string;
}

export interface CampaignSummary {
  id: string;
  name: string;
  status: CampaignStatus;
}

export interface CampaignLead {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  // Custom variables for the {%first_name|default:"there"%} merge fields
  customVariables?: Record<string, string>;
}

export interface ReplyEvent {
  campaignId: string;
  leadEmail: string;
  replyTextSnippet?: string;
  replyAt: Date;
  /** The Instantly-assigned lead id (different from ConvertList lead id) */
  instantlyLeadId?: string;
}

function getApiKey(): string {
  const key = process.env.INSTANTLY_API_KEY;
  if (!key) throw new Error("INSTANTLY_API_KEY not configured");
  return key;
}

async function instantly<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Instantly API ${res.status} ${res.statusText} on ${path}: ${text.slice(0, 500)}`
    );
  }

  // Instantly returns 200 + { success: false, error: "..." } for soft errors
  const json = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string } & T;
  if ((json as { success?: boolean }).success === false) {
    throw new Error(
      `Instantly soft-fail on ${path}: ${(json as { error?: string }).error || "unknown"}`
    );
  }
  return json;
}

// ── Campaigns ─────────────────────────────────────────────────────────────

export async function createCampaign(input: CreateCampaignInput): Promise<{ id: string }> {
  const data = await instantly<{ id: string }>("/campaigns", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      from_email: input.fromEmail,
    }),
  });
  return { id: data.id };
}

export async function setCampaignSequence(
  campaignId: string,
  steps: Array<{ subject: string; body: string; delayDays: number }>
): Promise<void> {
  await instantly(`/campaigns/${campaignId}/sequences`, {
    method: "POST",
    body: JSON.stringify({
      sequences: [
        {
          steps: steps.map((s) => ({
            type: "email",
            subject: s.subject,
            body: s.body,
            delay: s.delayDays * 24 * 60, // minutes
          })),
        },
      ],
    }),
  });
}

export async function activateCampaign(campaignId: string): Promise<void> {
  await instantly(`/campaigns/${campaignId}/activate`, { method: "POST" });
}

export async function listCampaigns(): Promise<CampaignSummary[]> {
  const data = await instantly<{ items?: CampaignSummary[] }>("/campaigns", {
    method: "GET",
  });
  return data.items ?? [];
}

export async function getCampaignReplies(
  campaignId: string,
  sinceIso?: string
): Promise<ReplyEvent[]> {
  const params = new URLSearchParams({ campaign_id: campaignId });
  if (sinceIso) params.set("since", sinceIso);
  const data = await instantly<{
    items?: Array<{
      campaign_id: string;
      email: string;
      lead_id?: string;
      reply_body?: string;
      reply_received_at?: string;
    }>;
  }>(`/campaigns/${campaignId}/replies?${params}`, { method: "GET" });

  return (data.items ?? []).map((r) => ({
    campaignId: r.campaign_id,
    leadEmail: r.email,
    replyTextSnippet: r.reply_body,
    replyAt: r.reply_received_at ? new Date(r.reply_received_at) : new Date(),
    instantlyLeadId: r.lead_id,
  }));
}

// ── Leads ─────────────────────────────────────────────────────────────────

export async function addLeadsToCampaign(
  campaignId: string,
  leads: CampaignLead[]
): Promise<{ added: number }> {
  await instantly(`/campaigns/${campaignId}/leads`, {
    method: "POST",
    body: JSON.stringify({ leads }),
  });
  return { added: leads.length };
}

// ── Convenience ───────────────────────────────────────────────────────────

export async function launchOutreachCampaign(input: {
  campaignName: string;
  fromEmail: string;
  leads: CampaignLead[];
  emailSteps: Array<{ subject: string; body: string; delayDays: number }>;
}): Promise<{ campaignId: string; leadCount: number }> {
  const { id: campaignId } = await createCampaign({
    name: input.campaignName,
    fromEmail: input.fromEmail,
  });
  await setCampaignSequence(campaignId, input.emailSteps);
  await addLeadsToCampaign(campaignId, input.leads);
  await activateCampaign(campaignId);
  return { campaignId, leadCount: input.leads.length };
}

export function isInstantlyConfigured(): boolean {
  return !!process.env.INSTANTLY_API_KEY;
}
