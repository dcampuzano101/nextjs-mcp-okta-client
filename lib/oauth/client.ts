import * as oauth from "oauth4webapi";
import { OAuthConfig, TokenData } from "@/types";
import { TokenStorage } from "./token-storage";
import { generateState } from "@/lib/utils";

/**
 * Start OAuth2 Authorization Code Flow with PKCE
 */
export async function startOAuthFlow(config: OAuthConfig): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("OAuth flow can only be started in browser");
  }

  console.log("🚀 startOAuthFlow called with:", {
    authEndpoint: config.authorizationEndpoint,
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    scopes: config.scopes,
  });

  // 1. Generate PKCE code verifier and challenge
  const codeVerifier = oauth.generateRandomCodeVerifier();
  const codeChallenge = await oauth.calculatePKCECodeChallenge(codeVerifier);

  console.log("✅ Generated PKCE challenge");

  // 2. Generate and store state parameter
  const state = generateState();
  TokenStorage.savePKCEVerifier(codeVerifier);
  TokenStorage.saveState(state);

  // 3. Build authorization URL
  const authUrl = new URL(config.authorizationEndpoint);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", config.clientId);
  authUrl.searchParams.set("redirect_uri", config.redirectUri);
  authUrl.searchParams.set("scope", config.scopes.join(" "));
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("state", state);

  console.log(
    "🔗 Redirecting to:",
    authUrl.toString().substring(0, 150) + "..."
  );

  // 4. Redirect to authorization endpoint
  window.location.href = authUrl.toString();
}

/**
 * Exchange authorization code for tokens (calls server-side API route)
 */
export async function exchangeCodeForToken(
  code: string,
  config: OAuthConfig
): Promise<TokenData> {
  // Get stored PKCE verifier
  const codeVerifier = TokenStorage.getPKCEVerifier();
  if (!codeVerifier) {
    throw new Error("PKCE code verifier not found");
  }

  console.log("🔐 Exchanging code for tokens via server API...");

  // Call server-side API route to exchange code for tokens
  // This keeps the client secret secure on the server
  const response = await fetch("/api/auth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      codeVerifier,
      config,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("❌ Token exchange failed:", errorData);
    throw new Error(
      `Token exchange failed: ${errorData.details || errorData.error}`
    );
  }

  const result = await response.json();
  console.log("✅ Token exchange successful");

  // Calculate expiry time
  const expiresIn = result.expires_in || 3600; // Default to 1 hour
  const expiresAt = Date.now() + expiresIn * 1000;

  // Decode token to get user email
  let userEmail: string | undefined;
  if (result.id_token) {
    const decoded = TokenStorage.decodeToken(result.id_token);
    userEmail = decoded?.email || decoded?.preferred_username;
  } else if (result.access_token) {
    const decoded = TokenStorage.decodeToken(result.access_token);
    userEmail = decoded?.email || decoded?.sub;
  }

  // Create token data object
  const tokenData: TokenData = {
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
    idToken: result.id_token,
    expiresAt,
    tokenType: result.token_type || "Bearer",
    userEmail,
  };

  // Save tokens
  TokenStorage.save(tokenData);

  // Clear PKCE verifier (one-time use)
  sessionStorage.removeItem("pkce_code_verifier");

  return tokenData;
}

/**
 * Refresh access token using refresh token (calls server-side API route)
 */
export async function refreshAccessToken(
  config: OAuthConfig,
  refreshToken: string
): Promise<TokenData> {
  console.log("🔄 Refreshing access token via server API...");

  // Call server-side API route to refresh tokens
  // This keeps the client secret secure on the server
  const response = await fetch("/api/auth/token", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refreshToken,
      config,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("❌ Token refresh failed:", errorData);
    throw new Error(
      `Token refresh failed: ${errorData.details || errorData.error}`
    );
  }

  const result = await response.json();
  console.log("✅ Token refresh successful");

  // Calculate expiry time
  const expiresIn = result.expires_in || 3600;
  const expiresAt = Date.now() + expiresIn * 1000;

  // Get user email from current token
  const currentToken = TokenStorage.get();
  const userEmail = currentToken?.userEmail;

  // Create updated token data
  const tokenData: TokenData = {
    accessToken: result.access_token,
    refreshToken: result.refresh_token || refreshToken, // Keep old refresh token if new one not provided
    idToken: result.id_token,
    expiresAt,
    tokenType: result.token_type || "Bearer",
    userEmail,
  };

  // Save updated tokens
  TokenStorage.save(tokenData);

  return tokenData;
}

/**
 * Validate OAuth state parameter
 */
export function validateState(receivedState: string): boolean {
  const storedState = TokenStorage.getState();
  return storedState === receivedState;
}
