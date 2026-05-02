"use client";

import * as React from "react";
import { useCollaboration } from "./collaboration-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PresenceList() {
  const { onlineUsers, currentUser } = useCollaboration();
  const [isVisible, setIsVisible] = React.useState(true);

  // Auto-hide after 3 seconds of inactivity
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onlineUsers]);

  const totalUsers = onlineUsers.length + 1; // Include current user

  if (totalUsers <= 1) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-40 transition-all duration-500 ease-in-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      )}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <div className="bg-background/80 backdrop-blur-md border rounded-xl shadow-lg p-3 min-w-[200px]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Online
          </h3>
          <Badge variant="secondary" className="text-xs">
            {totalUsers} active
          </Badge>
        </div>
        
        <div className="space-y-2">
          {/* Current User */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {currentUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 border-2 border-background rounded-full" />
            </div>
            <span className="text-sm font-medium">{currentUser.name} (You)</span>
          </div>

          {/* Other Users */}
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-2">
              <div className="relative">
                <Avatar className="h-6 w-6">
                  <AvatarFallback 
                    className="text-xs"
                    style={{ backgroundColor: user.color, color: "#fff" }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 border-2 border-background rounded-full" />
              </div>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
