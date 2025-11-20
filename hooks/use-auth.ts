import { useState, useEffect, useCallback } from "react";
import { OAuthConfig, TokenData } from "@/types";
import { TokenStorage } from "@/lib/oauth/token-storage";
import {
  startOAuthFlow,
  exchangeCodeForToken,
  validateState,
  refreshAccessToken,
} from "@/lib/oauth/client";
import { isTokenExpiringSoon } from "@/lib/utils";

export function useAuth() {
  const [tokens, setTokens] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tokens from storage on mount
  useEffect(() => {
    const storedTokens = TokenStorage.get();
    if (storedTokens && !TokenStorage.isExpired()) {
      setTokens(storedTokens);
    }
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    // Use a ref to prevent double execution in React StrictMode
    let executed = false;

    const handleCallback = async () => {
      // Guard against double execution
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
        // Clean up URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        return;
      }

      if (code && state) {
        // Check if this code has already been processed
        const processedCode = sessionStorage.getItem("processed_auth_code");
        if (processedCode === code) {
          console.log("⚠️ This authorization code was already processed");
          // Clean up URL
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

          // Validate state
          if (!validateState(state)) {
            throw new Error("Invalid state parameter - possible CSRF attack");
          }

          // Get OAuth config from storage (we'll need to store this when starting the flow)
          const configStr = sessionStorage.getItem("oauth_config");
          if (!configStr) {
            throw new Error("OAuth configuration not found");
          }
          const config: OAuthConfig = JSON.parse(configStr);

          // Mark this code as processed BEFORE making the request
          sessionStorage.setItem("processed_auth_code", code);

          // Exchange code for tokens
          const tokenData = await exchangeCodeForToken(code, config);
          setTokens(tokenData);

          console.log("✅ Authentication successful!");

          // Clean up URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } catch (err) {
          // Remove the processed code marker on error so user can retry
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

  // Auto-refresh token when expiring soon
  useEffect(() => {
    if (!tokens || !tokens.refreshToken) return;

    const checkAndRefresh = async () => {
      if (isTokenExpiringSoon(tokens.expiresAt)) {
        try {
          const configStr = sessionStorage.getItem("oauth_config");
          if (!configStr) return;
          const config: OAuthConfig = JSON.parse(configStr);

          const newTokens = await refreshAccessToken(
            config,
            tokens.refreshToken!
          );
          setTokens(newTokens);
        } catch (err) {
          console.error("Token refresh failed:", err);
          // Don't set error state - let user manually re-authenticate
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkAndRefresh, 60000);
    return () => clearInterval(interval);
  }, [tokens]);

  const authorize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build config from environment variables
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
          process.env.NEXT_PUBLIC_OKTA_SCOPES || "openid profile email"
        ).split(" "),
      };

      console.log("🔐 Starting OAuth flow with config:", {
        clientId: config.clientId,
        authEndpoint: config.authorizationEndpoint,
        scopes: config.scopes,
      });

      // Store config for callback handling
      sessionStorage.setItem("oauth_config", JSON.stringify(config));

      // Start OAuth flow (this will redirect)
      await startOAuthFlow(config);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start OAuth flow"
      );
      setIsLoading(false);
    }
  }, []);

  const clearTokens = useCallback(() => {
    TokenStorage.clear();
    setTokens(null);
    sessionStorage.removeItem("oauth_config");
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!tokens?.refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      setIsLoading(true);
      setError(null);

      const configStr = sessionStorage.getItem("oauth_config");
      if (!configStr) {
        throw new Error("OAuth configuration not found");
      }
      const config: OAuthConfig = JSON.parse(configStr);

      const newTokens = await refreshAccessToken(config, tokens.refreshToken);
      setTokens(newTokens);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Token refresh failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tokens]);

  return {
    tokens,
    isAuthenticated: !!tokens && !TokenStorage.isExpired(),
    isLoading,
    error,
    authorize,
    clearTokens,
    refresh,
  };
}
