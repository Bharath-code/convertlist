"use client";

import * as React from "react";
import { createContext, useContext, useEffect, useRef, useCallback } from "react";
import {
  CollaborationAdapter,
  CollaborationEvent,
  User,
  PresenceStatus,
  CursorPosition,
  RowLock,
} from "@/lib/collaboration/types";
import { BroadcastAdapter } from "@/lib/collaboration/broadcast-adapter";

interface CollaborationContextType {
  adapter: CollaborationAdapter | null;
  currentUser: User;
  onlineUsers: User[];
  cursors: CursorPosition[];
  lockedRows: Map<string, RowLock>;
  requestRowLock: (rowId: string) => Promise<boolean>;
  releaseRowLock: (rowId: string) => void;
  updateCursor: (x: number, y: number) => void;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error("useCollaboration must be used within a CollaborationProvider");
  }
  return context;
}

interface CollaborationProviderProps {
  children: React.ReactNode;
  userId?: string;
  userName?: string;
}

export function CollaborationProvider({
  children,
  userId,
  userName,
}: CollaborationProviderProps) {
  const [adapter, setAdapter] = React.useState<CollaborationAdapter | null>(null);
  const [onlineUsers, setOnlineUsers] = React.useState<User[]>([]);
  const [cursors, setCursors] = React.useState<CursorPosition[]>([]);
  const [lockedRows, setLockedRows] = React.useState<Map<string, RowLock>>(new Map());
  
  const currentUser = React.useMemo<User>(
    () => ({
      id: userId || `user-${Math.random().toString(36).substr(2, 9)}`,
      name: userName || "You",
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    }),
    [userId, userName]
  );

  useEffect(() => {
    const newAdapter = new BroadcastAdapter(userId, userName);
    
    newAdapter.connect().then(() => {
      setAdapter(newAdapter);
    });

    const unsubscribe = newAdapter.subscribe((event) => {
      switch (event.type) {
        case "PRESENCE_UPDATE": {
          const { payload } = event;
          if (payload.isOnline && payload.userId !== currentUser.id) {
            setOnlineUsers((prev) => {
              const exists = prev.find((u) => u.id === payload.userId);
              if (!exists) {
                return [
                  ...prev,
                  {
                    id: payload.userId,
                    name: "User",
                    color: `hsl(${Math.random() * 360}, 70%, 50%)`,
                  },
                ];
              }
              return prev;
            });
          } else if (!payload.isOnline) {
            setOnlineUsers((prev) => prev.filter((u) => u.id !== payload.userId));
          }
          break;
        }
        case "CURSOR_MOVE": {
          const { payload } = event;
          setCursors((prev) => {
            const filtered = prev.filter((c) => c.userId !== payload.userId);
            return [...filtered, payload];
          });
          break;
        }
        case "ROW_LOCK": {
          const { payload } = event;
          setLockedRows((prev) => new Map(prev).set(payload.rowId, payload));
          break;
        }
        case "ROW_UNLOCK": {
          const { payload } = event;
          setLockedRows((prev) => {
            const next = new Map(prev);
            next.delete(payload.rowId);
            return next;
          });
          break;
        }
      }
    });

    return () => {
      unsubscribe();
      newAdapter.disconnect();
    };
  }, [userId, userName, currentUser.id]);

  const updateCursor = useCallback(
    (x: number, y: number) => {
      if (!adapter) return;
      
      const position: CursorPosition = {
        x,
        y,
        userId: currentUser.id,
        timestamp: Date.now(),
      };
      
      adapter.send({ type: "CURSOR_MOVE", payload: position });
    },
    [adapter, currentUser.id]
  );

  const requestRowLock = useCallback(
    async (rowId: string): Promise<boolean> => {
      if (!adapter) return false;
      return adapter.requestRowLock(rowId, currentUser);
    },
    [adapter, currentUser]
  );

  const releaseRowLock = useCallback(
    (rowId: string) => {
      if (!adapter) return;
      adapter.releaseRowLock(rowId);
    },
    [adapter]
  );

  const value = React.useMemo(
    () => ({
      adapter,
      currentUser,
      onlineUsers,
      cursors,
      lockedRows,
      requestRowLock,
      releaseRowLock,
      updateCursor,
    }),
    [
      adapter,
      currentUser,
      onlineUsers,
      cursors,
      lockedRows,
      requestRowLock,
      releaseRowLock,
      updateCursor,
    ]
  );

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}
