/**
 * Collaboration types for real-time features
 */

export interface User {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

export interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  timestamp: number;
}

export interface PresenceStatus {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
  currentView?: string;
}

export interface RowLock {
  rowId: string;
  lockedBy: User;
  lockedAt: Date;
  expiresAt: Date;
}

export type CollaborationEvent =
  | { type: "CURSOR_MOVE"; payload: CursorPosition }
  | { type: "PRESENCE_UPDATE"; payload: PresenceStatus }
  | { type: "ROW_LOCK"; payload: RowLock }
  | { type: "ROW_UNLOCK"; payload: { rowId: string; userId: string } }
  | { type: "USER_JOIN"; payload: User }
  | { type: "USER_LEAVE"; payload: string };

export interface CollaborationAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(event: CollaborationEvent): void;
  subscribe(callback: (event: CollaborationEvent) => void): () => void;
  broadcastPresence(status: PresenceStatus): void;
  requestRowLock(rowId: string, user: User): Promise<boolean>;
  releaseRowLock(rowId: string): void;
}
