"use client";

import * as React from "react";
import { useCollaboration } from "./collaboration-provider";
import { cn } from "@/lib/utils";

export function LiveCursors() {
  const { cursors, currentUser } = useCollaboration();
  const [containerRef, setContainerRef] = React.useState<HTMLDivElement | null>(null);

  // Filter out own cursor and old cursors (older than 2 seconds)
  const activeCursors = React.useMemo(() => {
    const now = Date.now();
    return cursors.filter(
      (c) => c.userId !== currentUser.id && now - c.timestamp < 2000
    );
  }, [cursors, currentUser.id]);

  if (!containerRef) {
    return <div ref={setContainerRef} className="fixed inset-0 pointer-events-none z-50" />;
  }

  return (
    <div ref={setContainerRef} className="fixed inset-0 pointer-events-none z-50">
      {activeCursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute transition-all duration-100 ease-out"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <svg
            width="24"
            height="36"
            viewBox="0 0 24 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
          >
            <path
              d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
              fill="currentColor"
              stroke="white"
              strokeWidth="2"
              style={{ color: getUserColor(cursor.userId) }}
            />
          </svg>
          <span
            className="absolute left-6 top-0 px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap bg-background/80 backdrop-blur-sm border shadow-sm"
            style={{ color: getUserColor(cursor.userId) }}
          >
            {getUserName(cursor.userId)}
          </span>
        </div>
      ))}
    </div>
  );
}

// Simple user name/color mapping (in production, this would come from the collaboration context)
const userColors = new Map<string, string>();
const userNames = new Map<string, string>();

function getUserColor(userId: string): string {
  if (!userColors.has(userId)) {
    userColors.set(userId, `hsl(${Math.random() * 360}, 70%, 50%)`);
  }
  return userColors.get(userId)!;
}

function getUserName(userId: string): string {
  if (!userNames.has(userId)) {
    userNames.set(userId, `User ${userId.slice(-4)}`);
  }
  return userNames.get(userId)!;
}
