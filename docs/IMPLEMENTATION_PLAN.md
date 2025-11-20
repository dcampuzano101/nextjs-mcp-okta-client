# 🚀 MCP Client UI - Implementation Plan

## Overview

Building a Postman-like MCP (Model Context Protocol) Client with OAuth2 authentication, token management, and a modern UI using Next.js and Shadcn/ui.

---

## 🎨 Architecture

### Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **UI Components**: Shadcn/ui (Radix UI + Tailwind CSS)
- **OAuth2 Library**: `oauth4webapi` (lightweight, provider-agnostic)
- **State Management**: React Context + Local Storage
- **HTTP Client**: Native Fetch API
- **Styling**: Tailwind CSS

### Why `oauth4webapi` over Okta-Auth-JS?

✅ Provider-agnostic (works with Okta, Auth0, Google, etc.)
✅ Smaller bundle size (~20kb vs ~100kb)
✅ PKCE support built-in
✅ TypeScript native
✅ Better for developer tools
✅ Easier token management

---

## 📁 Project Structure

```
okta-mcp-ui/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Main MCP client page
│   ├── api/
│   │   └── auth/
│   │       ├── callback/route.ts  # OAuth callback handler
│   │       └── token/route.ts     # Token refresh endpoint
│   └── globals.css
├── components/
│   ├── ui/                        # Shadcn components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── tabs.tsx
│   │   ├── select.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── mcp-client/
│   │   ├── request-builder.tsx    # HTTP method + URL input
│   │   ├── authorization-tab.tsx  # OAuth2 configuration
│   │   ├── headers-tab.tsx        # Request headers
│   │   ├── message-tab.tsx        # MCP message body
│   │   ├── tools-list.tsx         # Available MCP tools
│   │   ├── response-viewer.tsx    # Response display
│   │   └── settings-tab.tsx       # App settings
│   └── auth/
│       ├── oauth-config.tsx       # OAuth provider config form
│       └── token-manager.tsx      # Token display/clear
├── lib/
│   ├── oauth/
│   │   ├── client.ts              # OAuth2 client setup
│   │   ├── pkce.ts                # PKCE utilities
│   │   └── token-storage.ts       # Token management
│   ├── mcp/
│   │   ├── client.ts              # MCP protocol client
│   │   └── types.ts               # MCP type definitions
│   └── utils.ts
├── hooks/
│   ├── use-auth.ts                # Auth state management
│   ├── use-mcp.ts                 # MCP requests
│   └── use-token.ts               # Token management
├── types/
│   └── index.ts
├── .env.local                     # Environment variables
└── package.json
```

---

## 🔐 OAuth2 Flow Implementation

### 1. Authorization Code Flow with PKCE

```typescript
// lib/oauth/client.ts
import * as oauth from "oauth4webapi";

export async function startOAuthFlow(config: OAuthConfig) {
  // 1. Generate PKCE code verifier and challenge
  const codeVerifier = oauth.generateRandomCodeVerifier();
  const codeChallenge = await oauth.calculatePKCECodeChallenge(codeVerifier);

  // 2. Store code verifier in session storage
  sessionStorage.setItem("pkce_code_verifier", codeVerifier);

  // 3. Build authorization URL
  const authUrl = new URL(config.authorizationEndpoint);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", config.clientId);
  authUrl.searchParams.set("redirect_uri", config.redirectUri);
  authUrl.searchParams.set("scope", config.scopes.join(" "));
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("state", generateState());

  // 4. Redirect to authorization endpoint
  window.location.href = authUrl.toString();
}

export async function exchangeCodeForToken(code: string, config: OAuthConfig) {
  const codeVerifier = sessionStorage.getItem("pkce_code_verifier");

  const response = await oauth.authorizationCodeGrantRequest(
    { url: config.tokenEndpoint },
    { clientId: config.clientId },
    code,
    config.redirectUri,
    codeVerifier
  );

  const tokens = await oauth.processAuthorizationCodeResponse(
    { url: config.tokenEndpoint },
    { clientId: config.clientId },
    response
  );

  return tokens;
}
```

### 2. Token Storage & Management

```typescript
// lib/oauth/token-storage.ts
export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  userEmail?: string;
  tokenType: string;
}

export class TokenStorage {
  private static KEY = "mcp_oauth_tokens";

  static save(tokens: TokenData): void {
    localStorage.setItem(this.KEY, JSON.stringify(tokens));
  }

  static get(): TokenData | null {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : null;
  }

  static clear(): void {
    localStorage.removeItem(this.KEY);
    sessionStorage.removeItem("pkce_code_verifier");
  }

  static isExpired(): boolean {
    const tokens = this.get();
    return tokens ? Date.now() > tokens.expiresAt : true;
  }
}
```

---

## 🎨 UI Components

### Main Interface Layout

```
┌─────────────────────────────────────────────────────────┐
│ MCP Client                              [Clear Token]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [POST ▼] [https://...endpoint        ] [Settings] [Run]│
│                                                         │
│ ┌─Message─┬─Authorization─┬─Headers─┬─Settings────┐   │
│ │                                                   │   │
│ │  Left Panel: Request Builder                     │   │
│ │  - Tabs: Message, Authorization, Headers         │   │
│ │                                                   │   │
│ └───────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─Tools───────────────────────────────────────────┐    │
│ │ 🔍 Search tools...                              │    │
│ │                                                 │    │
│ │ 1. get_accounts                                 │    │
│ │    Enables retrieval of account info...         │    │
│ │                                                 │    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
│ ┌─Response────────────────────────────────────────┐    │
│ │ Status: 200 OK                                  │    │
│ │ Time: 245ms                                     │    │
│ │                                                 │    │
│ │ {                                               │    │
│ │   "result": { ... }                             │    │
│ │ }                                               │    │
│ └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Key Features

1. **Authorization Tab**

   - OAuth2 Provider Selection (Okta, Auth0, Custom)
   - Configuration Form:
     - Client ID
     - Authorization Endpoint
     - Token Endpoint
     - Scopes
     - Redirect URI
   - Current Token Display
   - [Authorize] Button
   - [Clear Token] Button
   - Token expiry indicator

2. **Message Tab**

   - MCP Method selector (tools/call, tools/list, etc.)
   - JSON editor for request params
   - Quick insert from Tools list

3. **Tools List Sidebar**

   - Searchable tool list
   - Click to insert into message
   - Tool descriptions
   - Parameter hints

4. **Response Viewer**
   - JSON formatting
   - Status code indicator
   - Response time
   - Headers view
   - Copy button

---

## 🔧 Core Features

### 1. Multi-Provider OAuth Support

```typescript
// Preset configurations
const OAUTH_PRESETS = {
  okta: {
    name: "Okta",
    authorizationEndpoint: "https://{domain}/oauth2/default/v1/authorize",
    tokenEndpoint: "https://{domain}/oauth2/default/v1/token",
    scopes: ["openid", "profile", "email"],
  },
  auth0: {
    name: "Auth0",
    authorizationEndpoint: "https://{domain}/authorize",
    tokenEndpoint: "https://{domain}/oauth/token",
    scopes: ["openid", "profile", "email"],
  },
  custom: {
    name: "Custom",
    // User fills in all fields
  },
};
```

### 2. Token Management Features

- **Auto-refresh**: Automatically refresh tokens before expiry
- **Clear token**: Remove token and force re-authentication
- **User email tracking**: Associate tokens with user email
- **Expiry indicator**: Visual countdown to token expiry
- **Token inspection**: View decoded JWT claims

### 3. MCP Protocol Support

```typescript
// lib/mcp/client.ts
export async function callMCPTool(
  endpoint: string,
  method: string,
  params: any,
  accessToken: string
) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      method,
      params,
    }),
  });

  return response.json();
}
```

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "oauth4webapi": "^2.4.0",
    "next-themes": "^0.2.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "lucide-react": "^0.316.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33"
  }
}
```

---

## 🚀 Implementation Steps

### Phase 1: Project Setup (30 min)

1. Initialize Next.js project with TypeScript
2. Setup Tailwind CSS
3. Initialize Shadcn/ui
4. Install dependencies

### Phase 2: OAuth Infrastructure (1 hour)

1. Implement OAuth client utilities
2. Create PKCE flow
3. Build token storage system
4. Setup callback route

### Phase 3: Core UI Components (2 hours)

1. Build main layout
2. Create request builder component
3. Implement tab system
4. Add authorization tab with OAuth config

### Phase 4: MCP Integration (1 hour)

1. Create MCP client utilities
2. Build tools list component
3. Implement message builder
4. Add response viewer

### Phase 5: Token Management (45 min)

1. Add clear token functionality
2. Implement auto-refresh
3. Build token inspector
4. Add user email tracking

### Phase 6: Polish & Testing (1 hour)

1. Add error handling
2. Implement loading states
3. Add keyboard shortcuts
4. Test OAuth flows with Okta

---

## 🔒 Security Considerations

1. **PKCE**: Mandatory for all OAuth flows
2. **State parameter**: Prevent CSRF attacks
3. **Token storage**: localStorage with proper cleanup
4. **No secrets in frontend**: Only public client credentials
5. **HTTPS only**: Enforce secure connections
6. **Token expiry**: Auto-refresh before expiry

---

## 🎯 User Workflow

### First Time Setup

1. User opens MCP Client
2. Clicks "Authorization" tab
3. Selects OAuth provider (or "Okta" preset)
4. Fills in configuration (or loads from your metadata.json)
5. Clicks "Authorize"
6. Redirected to Okta
7. Logs in with email
8. Redirected back with code
9. Token automatically exchanged and stored

### Making MCP Requests

1. Enter MCP endpoint URL
2. Go to "Message" tab
3. Select tool from sidebar OR manually build JSON
4. Click "Run"
5. View response

### Token Management

1. View current token in "Authorization" tab
2. See expiry countdown
3. Click "Clear Token" to logout
4. Click "Authorize" to get new token

---

## 📝 Environment Variables

```env
# .env.local
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/callback
NEXT_PUBLIC_DEFAULT_MCP_ENDPOINT=https://your-mcp-endpoint.com

# Optional: Pre-configure Okta
NEXT_PUBLIC_OKTA_DOMAIN=trial-3882279.okta.com
NEXT_PUBLIC_OKTA_CLIENT_ID=your-client-id
```

---

## 🎨 Shadcn/ui Components Needed

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add select
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add label
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add scroll-area
```

---

## 🧪 Testing Checklist

- [ ] OAuth authorization flow works
- [ ] PKCE code challenge/verifier validation
- [ ] Token storage and retrieval
- [ ] Token expiry and auto-refresh
- [ ] Clear token functionality
- [ ] MCP tool calls with bearer token
- [ ] Response display and formatting
- [ ] Error handling for auth failures
- [ ] Error handling for MCP failures
- [ ] Multiple provider support
- [ ] Token inspector shows correct data
- [ ] User email persists with token

---

## 🎁 Nice-to-Have Features

1. **Request History**: Save previous MCP requests
2. **Collections**: Group related MCP calls
3. **Environment Variables**: Switch between dev/prod
4. **Export/Import**: Share configurations
5. **Dark Mode**: Theme toggle
6. **Keyboard Shortcuts**: Power user features
7. **Response Diff**: Compare responses
8. **Mock Responses**: Test without backend

---

## 📊 Success Metrics

✅ User can authenticate with Okta via OAuth2 + PKCE
✅ User can clear token and re-authenticate
✅ User can make MCP tool calls with bearer token
✅ Token automatically refreshes before expiry
✅ UI is responsive and intuitive
✅ Support for any OAuth2 provider

---

## 🤔 Decision Points

**Question 1**: Should we support saving multiple OAuth configurations?

- **Recommendation**: Yes, store profiles in localStorage

**Question 2**: Should we support API key authentication as alternative to OAuth?

- **Recommendation**: Yes, add "API Key" option in Authorization tab

**Question 3**: Should we show raw HTTP request/response?

- **Recommendation**: Yes, add "Raw" tab in response viewer

**Question 4**: Should we support file uploads for MCP?

- **Recommendation**: Phase 2 feature

---

## 🚦 Ready to Implement?

This plan provides a complete, production-ready MCP Client with:

- ✅ Flexible OAuth2 authentication (not locked to Okta)
- ✅ Token management with clear/refresh
- ✅ Postman-like interface
- ✅ User email tracking
- ✅ Modern, maintainable codebase

**Estimated Total Time**: 5-6 hours

Would you like me to proceed with implementation?
