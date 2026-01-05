import { JWTClaims } from "@/types";

/**
 * Decode a JWT token (without verification)
 * Note: This is for display purposes only. Token validation happens server-side.
 */
export function decodeJWT(token: string): JWTClaims | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Invalid JWT format");
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // JWT uses base64url encoding, need to convert to standard base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    
    // Add padding if needed
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    
    // Decode and parse
    const decoded = atob(padded);
    const claims = JSON.parse(decoded) as JWTClaims;
    
    return claims;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(claims: JWTClaims): boolean {
  if (!claims.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = claims.exp * 1000;
  return Date.now() >= expirationTime;
}

/**
 * Get time remaining until token expiration
 */
export function getTimeUntilExpiry(claims: JWTClaims): {
  expired: boolean;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} {
  if (!claims.exp) {
    return { expired: true, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  const expirationTime = claims.exp * 1000;
  const now = Date.now();
  const diff = expirationTime - now;

  if (diff <= 0) {
    return { expired: true, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { expired: false, hours, minutes, seconds, totalSeconds };
}

/**
 * Format timestamp to readable date
 */
export function formatTokenDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

/**
 * Extract user identifier from token claims
 */
export function getUserId(claims: JWTClaims): string {
  return claims.sub || claims.email || "unknown";
}

/**
 * Get display name from token claims
 */
export function getDisplayName(claims: JWTClaims): string {
  return claims.name || claims.email || claims["email-claim"] || claims.preferred_username || claims.sub || "Unknown User";
}

/**
 * Get user email from token claims
 */
export function getUserEmail(claims: JWTClaims): string {
  // Check multiple possible email fields
  // Note: Okta often puts email in 'sub' field for access tokens
  return claims.email || claims["email-claim"] || claims.preferred_username || claims.sub || "No email in token";
}

/**
 * Get user groups from token claims (for ABAC)
 */
export function getUserGroups(claims: JWTClaims): string[] {
  return claims.groups || [];
}

/**
 * Get scopes from token claims
 */
export function getScopes(claims: JWTClaims): string[] {
  // Handle both array format (scp) and string format (scope)
  if (claims.scp && Array.isArray(claims.scp)) {
    return claims.scp;
  }
  
  if (claims.scope && typeof claims.scope === "string") {
    return claims.scope.split(" ");
  }
  
  return [];
}

