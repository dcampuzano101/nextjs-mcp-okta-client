"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UserSession } from "@/types";
import {
  getTimeUntilExpiry,
  formatTokenDate,
  getUserGroups,
  getScopes,
  decodeJWT,
} from "@/lib/oauth/jwt-utils";

interface JWTDisplayPanelProps {
  session: UserSession;
}

export function JWTDisplayPanel({ session }: JWTDisplayPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedToken, setCopiedToken] = useState<"access" | "id" | null>(null);

  // Use Access Token only (what ABAC uses)
  const claims = useMemo(() => {
    return decodeJWT(session.tokens.accessToken);
  }, [session.tokens.accessToken]);

  if (!claims) return null;

  const timeUntilExpiry = getTimeUntilExpiry(claims);
  const groups = getUserGroups(claims);
  const scopes = getScopes(claims);

  const copyToken = async (token: string, type: "access" | "id") => {
    await navigator.clipboard.writeText(token);
    setCopiedToken(type);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const formatExpiryTime = () => {
    if (timeUntilExpiry.expired) {
      return "Expired";
    }
    if (timeUntilExpiry.hours > 0) {
      return `${timeUntilExpiry.hours}h ${timeUntilExpiry.minutes}m`;
    }
    return `${timeUntilExpiry.minutes}m ${timeUntilExpiry.seconds}s`;
  };

  return (
    <div className="border-b border-mulesoft/20">
      {/* Collapsed view - Click to expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-3 flex items-center justify-between hover:bg-mulesoft/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔑</span>
          <div className="text-left">
            <div className="text-sm font-medium text-mulesoft">
              Token Details - {session.email}
            </div>
            <div className="text-xs text-mulesoft/70">
              {groups.length > 0 && (
                <>
                  Groups: {groups.join(", ")} • 
                </>
              )}
              Expires: {formatExpiryTime()}
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-mulesoft" />
        ) : (
          <ChevronDown className="h-5 w-5 text-mulesoft" />
        )}
      </button>

      {/* Expanded view */}
      {isExpanded && (
        <div className="px-6 py-4 bg-mulesoft/5 space-y-4">
          {/* Summary Card */}
          <Card className="p-4 bg-white border-mulesoft/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-mulesoft">
                ABAC Claims Summary
              </h3>
              <Badge variant="outline" className="text-xs text-mulesoft/70">
                For Quick Reference
              </Badge>
            </div>
            
            <div className="space-y-3 text-sm">
              {/* Email */}
              <div>
                <span className="text-mulesoft/70 font-medium">Email:</span>
                <span className="ml-2 text-mulesoft">
                  {claims.email || claims["email-claim"] || claims.preferred_username || claims.sub}
                </span>
              </div>

              {/* Groups - Most important for ABAC! */}
              <div>
                <span className="text-mulesoft/70 font-medium">Groups:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {groups.length > 0 ? (
                    groups.map((group) => (
                      <Badge
                        key={group}
                        variant="outline"
                        className="bg-mulesoft-light/10 text-mulesoft border-mulesoft-light"
                      >
                        {group}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-mulesoft/70 text-xs">No groups</span>
                  )}
                </div>
              </div>

              {/* Scopes */}
              <div>
                <span className="text-mulesoft/70 font-medium">Scopes:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {scopes.length > 0 ? (
                    scopes.map((scope) => (
                      <Badge
                        key={scope}
                        variant="outline"
                        className="bg-mulesoft/10 text-mulesoft border-mulesoft"
                      >
                        {scope}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-mulesoft/70 text-xs">No scopes</span>
                  )}
                </div>
              </div>

              {/* Expiration */}
              <div>
                <span className="text-mulesoft/70 font-medium">Expires:</span>
                <span
                  className={`ml-2 ${
                    timeUntilExpiry.expired
                      ? "text-red-600 font-semibold"
                      : "text-mulesoft"
                  }`}
                >
                  {formatExpiryTime()}
                </span>
              </div>
            </div>
          </Card>

          {/* Token Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToken(session.tokens.accessToken, "access")}
              className="gap-2 border-mulesoft text-mulesoft hover:bg-mulesoft/10"
            >
              {copiedToken === "access" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copiedToken === "access" ? "Copied!" : "Copy Access Token"}
            </Button>
          </div>

          {/* Full Token Details - Collapsed by default */}
          <details className="border border-mulesoft/20 rounded-md bg-white">
            <summary className="cursor-pointer p-3 text-mulesoft/70 hover:text-mulesoft hover:bg-mulesoft/5 font-medium text-sm rounded-md transition-colors">
              📋 Advanced: Full Access Token Claims (JSON)
            </summary>
            <div className="p-4 pt-2 space-y-3">
              {/* Access Token Claims */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-mulesoft">
                    Access Token (Used by ABAC)
                  </span>
                  <Badge variant="outline" className="text-xs bg-mulesoft-light/10">
                    Access Token
                  </Badge>
                </div>
                <pre className="p-3 bg-gray-50 border border-mulesoft/20 rounded overflow-x-auto text-xs text-mulesoft">
                  {JSON.stringify(claims, null, 2)}
                </pre>
              </div>

              {/* Metadata */}
              <div className="text-xs space-y-1 text-mulesoft/70">
                <div>
                  <span className="font-medium">Issued At:</span>{" "}
                  {formatTokenDate(claims.iat)}
                </div>
                <div>
                  <span className="font-medium">Issuer:</span> {claims.iss}
                </div>
                <div>
                  <span className="font-medium">Subject:</span>{" "}
                  <code className="text-xs">{claims.sub}</code>
                </div>
                <div>
                  <span className="font-medium">Audience:</span>{" "}
                  {Array.isArray(claims.aud) ? claims.aud.join(", ") : claims.aud}
                </div>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

