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
