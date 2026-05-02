import {
  CollaborationAdapter,
  CollaborationEvent,
  PresenceStatus,
  User,
  RowLock,
} from "./types";

/**
 * BroadcastChannel adapter for multi-tab collaboration in the same browser
 * For production multi-user support, replace with WebSocket/Pusher adapter
 */
export class BroadcastAdapter implements CollaborationAdapter {
  private channel: BroadcastChannel | null = null;
  private subscribers: Set<(event: CollaborationEvent) => void> = new Set();
  private userId: string;
  private userName: string;

  constructor(userId?: string, userName?: string) {
    this.userId = userId || `user-${Math.random().toString(36).substr(2, 9)}`;
    this.userName = userName || "Anonymous";
  }

  async connect(): Promise<void> {
    if (typeof window === "undefined") return;

    this.channel = new BroadcastChannel("convertlist-collaboration");
    
    this.channel.onmessage = (event) => {
      const collaborationEvent = event.data as CollaborationEvent;
      this.subscribers.forEach((callback) => callback(collaborationEvent));
    };

    // Announce presence
    this.broadcastPresence({
      userId: this.userId,
      isOnline: true,
      lastSeen: new Date(),
      currentView: window.location.pathname,
    });
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      this.broadcastPresence({
        userId: this.userId,
        isOnline: false,
        lastSeen: new Date(),
      });
      this.channel.close();
      this.channel = null;
    }
    this.subscribers.clear();
  }

  send(event: CollaborationEvent): void {
    if (this.channel) {
      this.channel.postMessage(event);
    }
  }

  subscribe(callback: (event: CollaborationEvent) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  broadcastPresence(status: PresenceStatus): void {
    this.send({ type: "PRESENCE_UPDATE", payload: status });
  }

  async requestRowLock(rowId: string, user: User): Promise<boolean> {
    // In a real implementation, this would check with a server
    // For now, we'll just simulate a successful lock
    const lock: RowLock = {
      rowId,
      lockedBy: user,
      lockedAt: new Date(),
      expiresAt: new Date(Date.now() + 30000), // 30 seconds
    };
    
    this.send({ type: "ROW_LOCK", payload: lock });
    return true;
  }

  releaseRowLock(rowId: string): void {
    this.send({
      type: "ROW_UNLOCK",
      payload: { rowId, userId: this.userId },
    });
  }
}
