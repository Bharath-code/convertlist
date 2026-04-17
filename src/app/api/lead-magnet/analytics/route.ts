import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * Lead Magnet Analytics API
 * 
 * Provides analytics on lead magnet performance:
 * - Total captures by magnet type
 * - Recent captures
 * - Conversion tracking
 */

export async function GET(req: Request) {
  try {
    const { db } = await import("@/lib/db");

    // Get total captures by magnet type
    const capturesByType = await db.leadMagnetCapture.groupBy({
      by: ['magnetType'],
      _count: {
        id: true,
      },
    });

    // Get recent captures
    const recentCaptures = await db.leadMagnetCapture.findMany({
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get total captures
    const totalCaptures = await db.leadMagnetCapture.count();

    return NextResponse.json({
      success: true,
      data: {
        totalCaptures,
        capturesByType: capturesByType.map((item) => ({
          magnetType: item.magnetType,
          count: item._count.id,
        })),
        recentCaptures: recentCaptures.map((capture) => ({
          id: capture.id,
          email: capture.email,
          magnetType: capture.magnetType,
          name: capture.name,
          deliveredAt: capture.deliveredAt,
          createdAt: capture.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Lead magnet analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
