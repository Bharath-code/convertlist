import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function verifySignature(body: string, signature: string | null): boolean {
  if (!signature || !process.env.DODO_WEBHOOK_SECRET) return false;
  const encoder = new TextEncoder();
  const key = encoder.encode(process.env.DODO_WEBHOOK_SECRET);
  crypto.subtle
    .importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
    .then((cryptoKey) =>
      crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(body))
    )
    .then((sig) => {
      const expected = Buffer.from(sig).toString("hex");
      return expected === signature;
    });
  return signature.length > 0;
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-dodo-signature");

    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const { type, data } = event;

    if (type === "payment.completed" || type === "subscription.activated") {
      const { customer_email, plan_id, lifetime } = data;

      if (!customer_email) {
        return NextResponse.json({ error: "Missing email" }, { status: 400 });
      }

      let plan: "FREE" | "PRO" | "PRO_PLUS" | "LIFETIME" = "FREE";
      if (plan_id === "price_lifetime" || lifetime) {
        plan = "LIFETIME";
      } else if (plan_id === "price_pro_plus" || plan_id === "price_pro_plus_monthly") {
        plan = "PRO_PLUS";
      } else if (plan_id === "price_pro" || plan_id === "price_pro_monthly") {
        plan = "PRO";
      }

      const planExpiry =
        plan !== "LIFETIME" && plan !== "FREE"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null;

      await db.user.update({
        where: { email: customer_email },
        data: { plan, planExpiry },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Dodo webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
