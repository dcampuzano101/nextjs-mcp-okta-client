// OAuth Configuration Types
export interface OAuthConfig {
  provider: "okta" | "auth0" | "custom";
  issuer: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

// Token Storage Types
export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: number;
  userEmail?: string;
  tokenType: string;
  userId?: string; // Unique identifier for multi-user support
}

// JWT Decoded Claims
export interface JWTClaims {
  // Standard claims
  sub: string; // Subject (user ID)
  iss: string; // Issuer
  aud: string | string[]; // Audience
  exp: number; // Expiration time
  iat: number; // Issued at
  
  // Okta-specific claims
  email?: string;
  name?: string;
  groups?: string[];
  scp?: string[]; // Scopes (in access token)
  scope?: string; // Scopes as string
  
  // Additional claims
  [key: string]: any;
}

// Multi-user session
export interface UserSession {
  userId: string;
  email: string;
  displayName: string;
  tokens: TokenData;
  claims: JWTClaims;
  addedAt: number;
}

// MCP Types (JSON-RPC 2.0 format)
export interface MCPRequest {
  jsonrpc?: string; // JSON-RPC version (optional for compatibility)
  id?: number | string; // Request ID (optional for notifications)
  method: string;
  params?: Record<string, any>;
}

export interface MCPResponse {
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, MCPToolProperty>;
    required?: string[];
  };
}

export interface MCPToolProperty {
  type: string;
  description?: string;
  items?: {
    type: string;
  };
  properties?: Record<string, MCPToolProperty>;
  minItems?: number;
  uniqueItems?: boolean;
}

// HTTP Method Types
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Response State Types
export interface ResponseState {
  status?: number;
  statusText?: string;
  data?: any;
  headers?: Record<string, string>;
  time?: number;
  error?: string;
}
