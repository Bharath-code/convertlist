import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getConversionBenchmarks } from "@/lib/scoring/conversion-analytics";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const benchmarks = await getConversionBenchmarks();

    return NextResponse.json({ benchmarks });
  } catch (error) {
    console.error("Conversion benchmarks error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
