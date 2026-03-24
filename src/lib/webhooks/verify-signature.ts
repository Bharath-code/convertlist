import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verify webhook signature for Resend or DodoPayments
 * 
 * @param req - The incoming request
 * @param provider - The webhook provider ('resend' | 'dodo')
 * @returns true if signature is valid, false otherwise
 */
export async function verifyWebhookSignature(
  req: Request,
  provider: "resend" | "dodo"
): Promise<boolean> {
  try {
    const secret =
      provider === "resend"
        ? process.env.RESEND_WEBHOOK_SECRET
        : process.env.DODO_WEBHOOK_SECRET;

    if (!secret) {
      console.warn(`No webhook secret configured for ${provider}`);
      return false;
    }

    const signatureHeader = req.headers.get(
      provider === "resend" ? "x-resend-signature" : "x-dodo-signature"
    );

    if (!signatureHeader) {
      console.warn(`No signature header found for ${provider}`);
      return false;
    }

    // Get the raw body as text for signature verification
    const rawBody = await req.text();

    // Create HMAC signature
    const signature = createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    // Use timing-safe comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signatureHeader, "utf8");
    const expectedBuffer = Buffer.from(signature, "utf8");

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    console.error(`Error verifying ${provider} webhook signature:`, error);
    return false;
  }
}
