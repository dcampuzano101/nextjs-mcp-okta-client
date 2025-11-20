"use client";

import Image from "next/image";
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
    <div className="border-b border-white/10 bg-mulesoft">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/mulesoft-logo.png"
              alt="MuleSoft"
              width={202}
              height={58}
              priority
              className="h-14 w-auto"
            />
            <div className="h-8 w-px bg-white/20" />
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-mulesoft-light">
              MCP Client
            </h1>
            {isAuthenticated && (
              <Badge
                variant="default"
                className="gap-1 bg-mulesoft-light hover:bg-mulesoft-light-hover"
              >
                <Unlock className="h-3 w-3" />
                Connected
              </Badge>
            )}
          </div>
        </div>

        {/* Right: Auth Controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {userEmail && (
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <User className="h-4 w-4" />
                  <span>{userEmail}</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onClearToken}
                className="gap-2 border-white/20 text-white hover:bg-white/10"
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
              className="gap-2 bg-mulesoft-light hover:bg-mulesoft-light-hover text-white"
              size="sm"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
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
