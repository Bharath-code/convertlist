import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const { searchParams } = new URL(req.url);
    const plan = searchParams.get("plan");

    const prices: Record<string, string> = {
      pro: "price_pro_monthly",
      pro_plus: "price_pro_plus_monthly",
      lifetime: "price_lifetime",
    };

    if (!prices[plan || ""]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return NextResponse.redirect(
      `${baseUrl}/dashboard?checkout=${plan}`
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
