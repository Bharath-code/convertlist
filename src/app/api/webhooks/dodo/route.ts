import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/webhooks/verify-signature";

export async function POST(req: Request) {
  try {
    const isValid = await verifyWebhookSignature(req, "dodo");
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = await req.text();
    const event = JSON.parse(body);
    const { type, data } = event;

    if (type === "payment.completed" || type === "subscription.activated") {
      const { customer_email, plan_id, lifetime } = data;

      if (!customer_email) {
        return NextResponse.json({ error: "Missing email" }, { status: 400 });
      }

      let plan: "FREE" | "STARTER" | "PRO" | "LAUNCH" = "FREE";
      if (plan_id === "price_launch" || lifetime) {
        plan = "LAUNCH";
      } else if (plan_id === "price_pro" || plan_id === "price_pro_monthly") {
        plan = "PRO";
      } else if (plan_id === "price_starter" || plan_id === "price_starter_monthly") {
        plan = "STARTER";
      }

      const planExpiry =
        plan !== "LAUNCH" && plan !== "FREE"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null;

      await db.user.update({
        where: { email: customer_email },
        data: { plan: plan as any, planExpiry },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
