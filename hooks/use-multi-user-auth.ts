import { useState, useEffect, useCallback } from "react";
import { OAuthConfig, UserSession } from "@/types";
import { MultiUserStorage } from "@/lib/oauth/multi-user-storage";
import {
  startOAuthFlow,
  exchangeCodeForToken,
  validateState,
} from "@/lib/oauth/client";

export function useMultiUserAuth() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sessions from storage on mount
  useEffect(() => {
    const storedSessions = MultiUserStorage.getAllSessions();
    const storedActiveUserId = MultiUserStorage.getActiveUserId();
    setSessions(storedSessions);
    setActiveUserId(storedActiveUserId);
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    let executed = false;

    const handleCallback = async () => {
      if (executed) {
        console.log("⚠️ Callback already executed, skipping");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const error = params.get("error");

      if (error) {
        setError(error);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        return;
      }

      if (code && state) {
        const processedCode = sessionStorage.getItem("processed_auth_code");
        if (processedCode === code) {
          console.log("⚠️ This authorization code was already processed");
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          return;
        }

        executed = true;

        try {
          setIsLoading(true);
          setError(null);

          console.log("🔄 Processing authorization code...");

          if (!validateState(state)) {
            throw new Error("Invalid state parameter - possible CSRF attack");
          }

          const configStr = sessionStorage.getItem("oauth_config");
          if (!configStr) {
            throw new Error("OAuth configuration not found");
          }
          const config: OAuthConfig = JSON.parse(configStr);

          sessionStorage.setItem("processed_auth_code", code);

          // Exchange code for tokens
          const tokenData = await exchangeCodeForToken(code, config);

          // Add session to multi-user storage
          const newSession = MultiUserStorage.addSession(
            tokenData.accessToken,
            tokenData.idToken,
            tokenData.refreshToken,
            tokenData.expiresAt
          );

          if (newSession) {
            // Reload sessions
            const updatedSessions = MultiUserStorage.getAllSessions();
            setSessions(updatedSessions);
            setActiveUserId(newSession.userId);
            console.log("✅ User added:", newSession.email);
          }

          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } catch (err) {
          sessionStorage.removeItem("processed_auth_code");
          setError(
            err instanceof Error ? err.message : "Authentication failed"
          );
          console.error("❌ Authentication error:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleCallback();
  }, []);

  const authorize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const config: OAuthConfig = {
        provider: "okta",
        issuer: process.env.NEXT_PUBLIC_OKTA_ISSUER || "",
        authorizationEndpoint: process.env.NEXT_PUBLIC_OKTA_AUTH_ENDPOINT || "",
        tokenEndpoint: process.env.NEXT_PUBLIC_OKTA_TOKEN_ENDPOINT || "",
        clientId: process.env.NEXT_PUBLIC_OKTA_CLIENT_ID || "",
        redirectUri:
          process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI ||
          "http://localhost:3000/api/auth/callback",
        scopes: (
          process.env.NEXT_PUBLIC_OKTA_SCOPES || "openid profile email groups"
        ).split(" "),
      };

      console.log("🔐 Starting OAuth flow with config:", {
        clientId: config.clientId,
        authEndpoint: config.authorizationEndpoint,
        scopes: config.scopes,
      });

      sessionStorage.setItem("oauth_config", JSON.stringify(config));

      // Start OAuth flow
      await startOAuthFlow(config);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start OAuth flow"
      );
      setIsLoading(false);
    }
  }, []);

  const switchUser = useCallback((userId: string) => {
    MultiUserStorage.setActiveUserId(userId);
    setActiveUserId(userId);
    console.log("🔄 Switched to user:", userId);
  }, []);

  const removeUser = useCallback((userId: string) => {
    MultiUserStorage.removeSession(userId);
    const updatedSessions = MultiUserStorage.getAllSessions();
    setSessions(updatedSessions);
    
    // Update active user if removed
    const newActiveUserId = MultiUserStorage.getActiveUserId();
    setActiveUserId(newActiveUserId);
    
    console.log("🗑️ Removed user:", userId);
  }, []);

  const clearAllUsers = useCallback(() => {
    MultiUserStorage.clearAll();
    setSessions([]);
    setActiveUserId(null);
    setError(null);
    console.log("🗑️ Cleared all users");
  }, []);

  const getActiveSession = useCallback((): UserSession | null => {
    if (!activeUserId) return null;
    return sessions.find((s) => s.userId === activeUserId) || null;
  }, [activeUserId, sessions]);

  const getActiveToken = useCallback((): string | null => {
    const session = getActiveSession();
    return session?.tokens.accessToken || null;
  }, [getActiveSession]);

  return {
    sessions,
    activeUserId,
    activeSession: getActiveSession(),
    activeToken: getActiveToken(),
    isAuthenticated: !!activeUserId && sessions.length > 0,
    isLoading,
    error,
    authorize,
    switchUser,
    removeUser,
    clearAllUsers,
  };
}

