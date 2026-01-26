"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MultiUserStorage } from "@/lib/oauth/multi-user-storage";
import { getMCPSessionId } from "@/lib/mcp/client";

export function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const refreshDebugInfo = () => {
    const info = {
      localStorage: {
        sessions: MultiUserStorage.getAllSessions(),
        activeUserId: MultiUserStorage.getActiveUserId(),
        activeSession: MultiUserStorage.getActiveSession(),
        rawSessions: localStorage.getItem("mcp_user_sessions"),
        rawActiveUserId: localStorage.getItem("mcp_active_user_id"),
      },
      sessionStorage: {
        pkceVerifier: sessionStorage.getItem("pkce_code_verifier"),
        oauthState: sessionStorage.getItem("oauth_state"),
      },
      mcpSession: {
        sessionId: getMCPSessionId(),
      },
      timestamp: new Date().toISOString(),
    };
    setDebugInfo(info);
  };

  useEffect(() => {
    if (isOpen) {
      refreshDebugInfo();
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-900 border-yellow-400"
        >
          🐛 Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[500px] max-h-[600px] overflow-auto">
      <Card className="border-yellow-400 bg-yellow-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-yellow-900">Debug Info</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={refreshDebugInfo}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Refresh
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {debugInfo && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-2 text-yellow-900">
                  Active User
                </h3>
                <pre className="text-xs bg-white p-2 rounded border border-yellow-200 overflow-auto">
                  {JSON.stringify(
                    {
                      userId: debugInfo.localStorage.activeUserId,
                      hasSession: !!debugInfo.localStorage.activeSession,
                      email: debugInfo.localStorage.activeSession?.email,
                      hasToken: !!debugInfo.localStorage.activeSession?.tokens
                        ?.accessToken,
                      tokenPreview: debugInfo.localStorage.activeSession?.tokens
                        ?.accessToken
                        ? debugInfo.localStorage.activeSession.tokens.accessToken.substring(
                            0,
                            30
                          ) + "..."
                        : null,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 text-yellow-900">
                  All Sessions ({debugInfo.localStorage.sessions.length})
                </h3>
                <pre className="text-xs bg-white p-2 rounded border border-yellow-200 overflow-auto max-h-[150px]">
                  {JSON.stringify(
                    debugInfo.localStorage.sessions.map((s: any) => ({
                      userId: s.userId,
                      email: s.email,
                      hasToken: !!s.tokens?.accessToken,
                    })),
                    null,
                    2
                  )}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 text-yellow-900">
                  MCP Session
                </h3>
                <pre className="text-xs bg-white p-2 rounded border border-yellow-200 overflow-auto">
                  {JSON.stringify(debugInfo.mcpSession, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 text-yellow-900">
                  Raw Storage
                </h3>
                <pre className="text-xs bg-white p-2 rounded border border-yellow-200 overflow-auto max-h-[100px]">
                  {JSON.stringify(
                    {
                      localStorageKeys: Object.keys(localStorage),
                      sessionStorageKeys: Object.keys(sessionStorage),
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              <div>
                <Button
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to clear ALL storage? This will log you out."
                      )
                    ) {
                      localStorage.clear();
                      sessionStorage.clear();
                      refreshDebugInfo();
                      setTimeout(() => window.location.reload(), 500);
                    }
                  }}
                  variant="destructive"
                  size="sm"
                  className="w-full text-xs"
                >
                  🗑️ Clear All Storage & Reload
                </Button>
              </div>

              <div className="text-xs text-yellow-700">
                Last updated: {new Date(debugInfo.timestamp).toLocaleTimeString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

