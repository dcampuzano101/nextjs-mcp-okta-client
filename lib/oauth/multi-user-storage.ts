import { UserSession } from "@/types";
import { decodeJWT, getUserId, getDisplayName, getUserEmail } from "./jwt-utils";

const MULTI_USER_SESSIONS_KEY = "mcp_user_sessions";
const ACTIVE_USER_ID_KEY = "mcp_active_user_id";
const PKCE_VERIFIER_KEY = "pkce_code_verifier";
const OAUTH_STATE_KEY = "oauth_state";

export class MultiUserStorage {
  /**
   * Get all user sessions
   */
  static getAllSessions(): UserSession[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(MULTI_USER_SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Save all user sessions
   */
  static saveAllSessions(sessions: UserSession[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(MULTI_USER_SESSIONS_KEY, JSON.stringify(sessions));
  }

  /**
   * Add a new user session
   */
  static addSession(accessToken: string, idToken?: string, refreshToken?: string, expiresAt?: number): UserSession | null {
    if (typeof window === "undefined") return null;

    // Decode the Access token (has ABAC groups and email claim)
    const claims = decodeJWT(accessToken);
    if (!claims) {
      console.error("Failed to decode access token");
      return null;
    }

    console.log("📝 Decoded access token claims:", claims);

    const userId = getUserId(claims);
    const email = getUserEmail(claims);
    const displayName = getDisplayName(claims);

    console.log("✅ Extracted user info:", { userId, email, displayName });

    const newSession: UserSession = {
      userId,
      email,
      displayName,
      tokens: {
        accessToken,
        idToken,
        refreshToken,
        expiresAt: expiresAt || claims.exp * 1000,
        userEmail: email,
        tokenType: "Bearer",
        userId,
      },
      claims,
      addedAt: Date.now(),
    };

    // Get existing sessions
    const sessions = this.getAllSessions();

    // Check if user already exists, replace if so
    const existingIndex = sessions.findIndex((s) => s.userId === userId);
    if (existingIndex >= 0) {
      sessions[existingIndex] = newSession;
    } else {
      sessions.push(newSession);
    }

    // Save updated sessions
    this.saveAllSessions(sessions);

    // Set as active user
    this.setActiveUserId(userId);

    return newSession;
  }

  /**
   * Get a specific user session
   */
  static getSession(userId: string): UserSession | null {
    const sessions = this.getAllSessions();
    return sessions.find((s) => s.userId === userId) || null;
  }

  /**
   * Remove a user session
   */
  static removeSession(userId: string): void {
    const sessions = this.getAllSessions();
    const filtered = sessions.filter((s) => s.userId !== userId);
    this.saveAllSessions(filtered);

    // If removing active user, clear active user or switch to another
    if (this.getActiveUserId() === userId) {
      if (filtered.length > 0) {
        this.setActiveUserId(filtered[0].userId);
      } else {
        this.clearActiveUserId();
      }
    }
  }

  /**
   * Get active user ID
   */
  static getActiveUserId(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACTIVE_USER_ID_KEY);
  }

  /**
   * Set active user ID
   */
  static setActiveUserId(userId: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACTIVE_USER_ID_KEY, userId);
  }

  /**
   * Clear active user ID
   */
  static clearActiveUserId(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACTIVE_USER_ID_KEY);
  }

  /**
   * Get active user session
   */
  static getActiveSession(): UserSession | null {
    const userId = this.getActiveUserId();
    if (!userId) return null;
    return this.getSession(userId);
  }

  /**
   * Clear all sessions
   */
  static clearAll(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(MULTI_USER_SESSIONS_KEY);
    localStorage.removeItem(ACTIVE_USER_ID_KEY);
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);
    sessionStorage.removeItem(OAUTH_STATE_KEY);
  }

  /**
   * Check if active user token is expired
   */
  static isActiveUserExpired(): boolean {
    const session = this.getActiveSession();
    if (!session) return true;
    return Date.now() >= session.tokens.expiresAt;
  }

  /**
   * Save PKCE code verifier to session storage
   */
  static savePKCEVerifier(verifier: string): void {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
  }

  /**
   * Get PKCE code verifier from session storage
   */
  static getPKCEVerifier(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(PKCE_VERIFIER_KEY);
  }

  /**
   * Save OAuth state to session storage
   */
  static saveState(state: string): void {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(OAUTH_STATE_KEY, state);
  }

  /**
   * Get OAuth state from session storage
   */
  static getState(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(OAUTH_STATE_KEY);
  }

  /**
   * Get count of stored sessions
   */
  static getSessionCount(): number {
    return this.getAllSessions().length;
  }
}

