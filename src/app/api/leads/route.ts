import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { ListLeadsQuery, PaginatedLeadsResponse } from "@/types/lead";

export const dynamic = 'force-dynamic';

/**
 * Validate and parse query parameters
 */
function parseQueryParams(searchParams: URLSearchParams): { params: ListLeadsQuery; error?: string } {
  const waitlistId = searchParams.get("waitlistId") || undefined;
  const cursor = searchParams.get("cursor") || undefined;
  const limitParam = searchParams.get("limit");
  
  let limit = 20;
  if (limitParam) {
    const parsed = parseInt(limitParam, 10);
    if (isNaN(parsed) || parsed < 1) {
      return { params: {}, error: "Invalid limit parameter: must be a positive number" };
    }
    limit = Math.min(parsed, 100); // Max 100 per page
  }
  
  return {
    params: {
      waitlistId,
      cursor,
      limit,
    },
  };
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const { params, error } = parseQueryParams(searchParams);
    
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const { db } = await import("@/lib/db");

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const where: Record<string, unknown> = {
      waitlist: { userId: user.id },
    };
    if (params.waitlistId) {
      where.waitlistId = params.waitlistId;
    }

    const leads = await db.lead.findMany({
      where,
      include: {
        sequence: { select: { name: true } },
        statusHistory: { 
          take: 1, 
          orderBy: { changedAt: 'desc' },
          select: { status: true, changedAt: true }
        }
      },
      orderBy: { score: "desc" },
      take: params.limit + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
    });

    const hasMore = leads.length > params.limit;
    const items = hasMore ? leads.slice(0, params.limit) : leads;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const response: PaginatedLeadsResponse = {
      leads: items,
      nextCursor,
      hasMore,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Leads fetch error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
