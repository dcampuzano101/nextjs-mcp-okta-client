"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, Trash2, User } from "lucide-react";

interface NavbarProps {
  isAuthenticated: boolean;
  userEmail?: string;
  onAuthorize: () => void;
  onClearToken: () => void;
  isLoading?: boolean;
}

export function Navbar({
  isAuthenticated,
  userEmail,
  onAuthorize,
  onClearToken,
  isLoading,
}: NavbarProps) {
  return (
    <div className="border-b bg-card">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: App Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">MCP Client</h1>
          {isAuthenticated && (
            <Badge variant="default" className="gap-1">
              <Unlock className="h-3 w-3" />
              Connected
            </Badge>
          )}
        </div>

        {/* Right: Auth Controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {userEmail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{userEmail}</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onClearToken}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear Token
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                console.log("🔘 Authorize button clicked");
                onAuthorize();
              }}
              disabled={isLoading}
              className="gap-2"
              size="sm"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                  Authorizing...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Authorize
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
