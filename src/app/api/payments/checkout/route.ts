import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

/**
 * DodoPayments Checkout Integration
 *
 * Creates a checkout session and redirects to Dodo's hosted checkout page.
 *
 * Setup:
 * 1. Create products in Dodo dashboard:
 *    - price_starter_monthly ($29/mo)
 *    - price_pro_monthly ($79/mo)
 *    - price_launch ($97 one-time)
 * 2. Set DODO_PUBLIC_KEY in environment
 * 3. Configure webhook endpoint: /api/webhooks/dodo
 */

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const { db } = await import("@/lib/db");

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const plan = searchParams.get("plan");

    const plans: Record<string, { priceId: string; successUrl: string }> = {
      starter: {
        priceId: process.env.DODO_PRICE_ID_STARTER || "price_starter_monthly",
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?upgrade=success`,
      },
      pro: {
        priceId: process.env.DODO_PRICE_ID_PRO || "price_pro_monthly",
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?upgrade=success`,
      },
      launch: {
        priceId: process.env.DODO_PRICE_ID_LAUNCH || "price_launch",
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?upgrade=success`,
      },
    };

    if (!plans[plan || ""]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planConfig = plans[plan!];

    // Build Dodo checkout URL
    // Dodo uses a simple redirect-based checkout flow
    const dodoCheckoutUrl = new URL("https://dodopayments.com/checkout");
    dodoCheckoutUrl.searchParams.set("price_id", planConfig.priceId);
    dodoCheckoutUrl.searchParams.set("customer_email", user.email);
    dodoCheckoutUrl.searchParams.set("metadata[user_id]", user.clerkId);
    dodoCheckoutUrl.searchParams.set("success_url", planConfig.successUrl);
    dodoCheckoutUrl.searchParams.set("cancel_url", `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?checkout=cancelled`);

    return NextResponse.redirect(dodoCheckoutUrl.toString());
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
