/**
 * Instantly.ai Integration
 * 
 * Provides one-click cold email sending functionality.
 * Workflow: Score leads → Generate outreach → Send via Instantly.ai
 */

const INSTANTLY_API_BASE = "https://api.instantly.ai/api";

export interface InstantlyCampaign {
  id: string;
  name: string;
  status: "running" | "paused" | "completed";
}

export interface InstantlyLead {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

export interface InstantlyEmailStep {
  subject: string;
  body: string;
  delayDays: number;
}

/**
 * Create a new campaign in Instantly.ai
 */
export async function createCampaign(
  name: string,
  fromEmail: string
): Promise<InstantlyCampaign> {
  const apiKey = process.env.INSTANTLY_API_KEY;
  if (!apiKey) {
    throw new Error("INSTANTLY_API_KEY not configured");
  }

  const response = await fetch(`${INSTANTLY_API_BASE}/campaigns/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name,
      from_email: fromEmail,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create campaign: ${response.statusText}`);
  }

  const data = await response.json();
  return data.campaign;
}

/**
 * Add leads to an Instantly.ai campaign
 */
export async function addLeadsToCampaign(
  campaignId: string,
  leads: InstantlyLead[]
): Promise<void> {
  const apiKey = process.env.INSTANTLY_API_KEY;
  if (!apiKey) {
    throw new Error("INSTANTLY_API_KEY not configured");
  }

  const response = await fetch(
    `${INSTANTLY_API_BASE}/campaigns/${campaignId}/leads/add`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        leads,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to add leads: ${response.statusText}`);
  }
}

/**
 * Set up email sequence for a campaign
 */
export async function setCampaignSequence(
  campaignId: string,
  steps: InstantlyEmailStep[]
): Promise<void> {
  const apiKey = process.env.INSTANTLY_API_KEY;
  if (!apiKey) {
    throw new Error("INSTANTLY_API_KEY not configured");
  }

  const response = await fetch(
    `${INSTANTLY_API_BASE}/campaigns/${campaignId}/sequence/set`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        steps,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to set sequence: ${response.statusText}`);
  }
}

/**
 * Start a campaign
 */
export async function startCampaign(campaignId: string): Promise<void> {
  const apiKey = process.env.INSTANTLY_API_KEY;
  if (!apiKey) {
    throw new Error("INSTANTLY_API_KEY not configured");
  }

  const response = await fetch(
    `${INSTANTLY_API_BASE}/campaigns/${campaignId}/start`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to start campaign: ${response.statusText}`);
  }
}

/**
 * Complete workflow: Create campaign, add leads, set sequence, start
 */
export async function launchOutreachCampaign(
  campaignName: string,
  fromEmail: string,
  leads: InstantlyLead[],
  emailSteps: InstantlyEmailStep[]
): Promise<{ campaignId: string }> {
  // Create campaign
  const campaign = await createCampaign(campaignName, fromEmail);

  // Add leads
  await addLeadsToCampaign(campaign.id, leads);

  // Set sequence
  await setCampaignSequence(campaign.id, emailSteps);

  // Start campaign
  await startCampaign(campaign.id);

  return { campaignId: campaign.id };
}

/**
 * Check if Instantly.ai is configured
 */
export function isInstantlyConfigured(): boolean {
  return !!process.env.INSTANTLY_API_KEY;
}
