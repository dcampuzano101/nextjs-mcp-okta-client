import { TokenData } from "@/types";

const TOKEN_STORAGE_KEY = "mcp_oauth_tokens";
const PKCE_VERIFIER_KEY = "pkce_code_verifier";
const OAUTH_STATE_KEY = "oauth_state";

export class TokenStorage {
  /**
   * Save tokens to localStorage
   */
  static save(tokens: TokenData): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  }

  /**
   * Get tokens from localStorage
   */
  static get(): TokenData | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(TOKEN_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Clear all tokens and auth data
   */
  static clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);
    sessionStorage.removeItem(OAUTH_STATE_KEY);
  }

  /**
   * Check if token is expired
   */
  static isExpired(): boolean {
    const tokens = this.get();
    if (!tokens) return true;
    return Date.now() >= tokens.expiresAt;
  }

  /**
   * Check if token exists
   */
  static exists(): boolean {
    return this.get() !== null;
  }

  /**
   * Get time until expiry in milliseconds
   */
  static getTimeUntilExpiry(): number {
    const tokens = this.get();
    if (!tokens) return 0;
    return Math.max(0, tokens.expiresAt - Date.now());
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
   * Decode JWT token (without verification - for display purposes only)
   */
  static decodeToken(token: string): any {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}
