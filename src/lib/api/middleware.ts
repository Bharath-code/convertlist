/**
 * API Middleware Utilities
 * 
 * Provides reusable middleware for API routes:
 * - Authentication verification
 * - User lookup and validation
 * - Error handling wrappers
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "../db";
import { logger } from "../logger";

export interface AuthenticatedUser {
  userId: string;
  user: Awaited<ReturnType<typeof db.user.findUnique>>;
}

/**
 * Wraps API route handlers with authentication and user lookup
 * Automatically returns 401/404 responses if auth fails
 */
export async function withAuth<T>(
  handler: (authContext: AuthenticatedUser) => Promise<T>
): Promise<T | NextResponse> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        waitlists: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      logger.warn("Authenticated user not found in database", { userId });
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return await handler({ userId, user });
  } catch (error) {
    logger.error("Authentication middleware failed", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Validates that a user has access to a specific waitlist
 */
export async function withWaitlistAccess<T>(
  waitlistId: string,
  handler: (context: AuthenticatedUser & { waitlist: Awaited<ReturnType<typeof db.waitlist.findUnique>> }) => Promise<T>
): Promise<T | NextResponse> {
  return withAuth(async ({ userId, user }) => {
    const waitlist = await db.waitlist.findFirst({
      where: {
        id: waitlistId,
        OR: [
          { userId: user.id },
          { collaborators: { some: { userId: user.id } } },
        ],
      },
      include: {
        _count: {
          select: { leads: true },
        },
      },
    });

    if (!waitlist) {
      return NextResponse.json(
        { error: "Waitlist not found or access denied" },
        { status: 404 }
      );
    }

    return handler({ userId, user, waitlist });
  });
}

/**
 * Standard API error response
 */
export function apiError(message: string, status = 400, details?: unknown): NextResponse {
  logger.warn(`API error: ${message}`, { status, details });
  
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Standard API success response
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}
