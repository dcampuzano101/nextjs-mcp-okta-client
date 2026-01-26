# 🛡️ MCP Client - OAuth2 Tool

A modern, Postman-like MCP (Model Context Protocol) client with OAuth2 authentication support. Built with Next.js, TypeScript, and `oauth4webapi`.

![MCP Client](https://img.shields.io/badge/OAuth2-PKCE-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Features

- 🔐 **OAuth2 Authorization Code Flow with PKCE** - Secure authentication
- 👥 **Multi-User Support** - Manage multiple authenticated users simultaneously
- 🔄 **User Switching** - Seamlessly switch between authenticated users
- 🎯 **Provider Agnostic** - Works with Okta, Auth0, or any OAuth2 provider
- 🔄 **Token Management** - View, refresh, and clear tokens easily
- 👤 **User Email Tracking** - Displays authenticated user email
- 📝 **Request Builder** - HTTP method selector and URL input
- 📨 **MCP Message Editor** - JSON editor for MCP requests
- 🛠️ **MCP Tools** - Browse and execute available MCP tools
- 📊 **Response Viewer** - Pretty-printed JSON responses with status codes
- ⏱️ **Performance Metrics** - Response time tracking
- 📋 **Copy to Clipboard** - Easy response copying
- 🎨 **Modern UI** - Built with Shadcn/ui components and MuleSoft branding

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- An Okta account (or other OAuth2 provider)
- Okta application configured with:
  - **Application Type**: Single-Page Application (SPA)
  - **Grant Types**: Authorization Code with PKCE
  - **Redirect URI**: `http://localhost:3000/api/auth/callback`

> 📘 **Need help setting up Okta?** See the [Okta OAuth2 Setup Guide](https://docs.google.com/document/d/1vAugJAp8Jz7tRSNICyfzU-EHGn6xMGIaDNA_k_B5Ybw/edit?usp=sharing) by Vishwas Nallabelli

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### 1. Update `.env.local`

**Important**: You need to set your Okta Client ID!

```bash
# OAuth Configuration
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Okta Configuration (Update with your Okta domain and credentials)
NEXT_PUBLIC_OKTA_ISSUER=https://YOUR-OKTA-DOMAIN.okta.com/oauth2/default
NEXT_PUBLIC_OKTA_AUTH_ENDPOINT=https://YOUR-OKTA-DOMAIN.okta.com/oauth2/default/v1/authorize
NEXT_PUBLIC_OKTA_TOKEN_ENDPOINT=https://YOUR-OKTA-DOMAIN.okta.com/oauth2/default/v1/token
NEXT_PUBLIC_OKTA_CLIENT_ID=your-okta-client-id-here  # ← UPDATE THIS!

# ⚠️ Client Secret (SERVER-SIDE ONLY - DO NOT use NEXT_PUBLIC_ prefix!)
OKTA_CLIENT_SECRET=your-okta-client-secret-here  # ← UPDATE THIS!

# Default MCP Endpoint
NEXT_PUBLIC_DEFAULT_MCP_ENDPOINT=https://your-mcp-endpoint-here/

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Get Your Okta Client ID and Secret

1. Create an application in **Anypoint Exchange** → **MCP Server** → **Request Access**
2. Select grant types: **Authorization Code** + **Client Credentials**
3. Set redirect URI: `http://localhost:3000/api/auth/callback`
4. After creation, copy both the **Client ID** and **Client Secret**
5. Paste them in `.env.local`

**⚠️ Security Note:** The `OKTA_CLIENT_SECRET` variable does NOT have the `NEXT_PUBLIC_` prefix. This is intentional! It means the secret is only available server-side and is never exposed to the browser, keeping it secure.

## 📖 Usage

### Step 1: Authenticate

1. Open the app at `http://localhost:3000`
2. Click on the **Authorization** tab
3. Your Okta configuration is pre-filled
4. Enter your **Client ID**
5. Click **Authorize**
6. Login with your Okta credentials
7. You'll be redirected back with a token

### Step 2: Make MCP Requests

1. Go to the **Message** tab
2. Enter your MCP request in JSON format:

```json
{
  "method": "tools/list",
  "params": {}
}
```

3. Click **Run** to send the request
4. View the response below

### Step 3: Manage Tokens

- **View Token**: See your current token, expiry time, and user email
- **Refresh Token**: Manually refresh your token
- **Clear Token**: Remove token and log out

## 🎯 Common MCP Requests

### List Available Tools

```json
{
  "method": "tools/list",
  "params": {}
}
```

### Call a Specific Tool

```json
{
  "method": "tools/call",
  "params": {
    "name": "get_accounts",
    "arguments": {
      "Name": ""
    }
  }
}
```

## 🏗️ Project Structure

```
okta-mcp-ui/
├── app/
│   ├── api/auth/callback/       # OAuth callback handler
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # Shadcn UI components
│   ├── auth/                    # Auth components
│   │   ├── oauth-config-form.tsx
│   │   └── token-display.tsx
│   └── mcp-client/              # MCP client components
│       ├── mcp-client.tsx       # Main client
│       ├── authorization-tab.tsx
│       ├── message-tab.tsx
│       ├── headers-tab.tsx
│       ├── request-builder.tsx
│       └── response-viewer.tsx
├── lib/
│   ├── oauth/                   # OAuth utilities
│   │   ├── client.ts            # OAuth client
│   │   └── token-storage.ts     # Token management
│   ├── mcp/                     # MCP utilities
│   │   └── client.ts            # MCP client
│   └── utils.ts                 # Utilities
├── hooks/
│   └── use-auth.ts              # Auth hook
├── types/
│   └── index.ts                 # TypeScript types
└── .env.local                   # Environment variables
```

## 🔐 Security Features

- ✅ **PKCE (Proof Key for Code Exchange)** - Protection against authorization code interception
- ✅ **State Parameter** - CSRF protection
- ✅ **Secure Token Storage** - localStorage for tokens, sessionStorage for PKCE verifier
- ✅ **Token Expiry Tracking** - Automatic expiry detection
- ✅ **Auto-Refresh** - Automatic token refresh before expiry
- ✅ **No Client Secret** - Public client, no secrets in frontend

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check

# Lint
npm run lint
```

## 📚 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **OAuth Library**: [oauth4webapi](https://github.com/panva/oauth4webapi)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/) (Radix UI + Tailwind CSS)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## 🤔 Why oauth4webapi?

`oauth4webapi` is a lightweight, standards-compliant OAuth 2.0 library that offers:

- ✅ Lighter (20KB vs 100KB+ for provider-specific SDKs)
- ✅ Provider-agnostic (works with any OAuth2 provider)
- ✅ More control over token management
- ✅ Perfect for developer tools like this
- ✅ Full PKCE support for security

## 🔄 Token Management

### Auto-Refresh

Tokens are automatically refreshed 5 minutes before expiry if a refresh token is available.

### Manual Refresh

Click the **Refresh Token** button in the Authorization tab.

### Clear Token

Click **Clear Token** to:

- Remove access token
- Remove refresh token
- Clear PKCE verifier
- Clear OAuth state
- Log out completely

### Generate New Token

1. Click **Clear Token**
2. Click **Authorize** in the Authorization tab
3. Login again to get a new token

## 🐛 Troubleshooting

### Issue: "Invalid state parameter"

**Solution**: Clear your browser's localStorage and sessionStorage, then try again.

```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
```

### Issue: "CORS error"

**Solution**: Verify your Okta app settings:

- **Trusted Origins** includes `http://localhost:3000`
- **Redirect URIs** includes `http://localhost:3000/api/auth/callback`

### Issue: "Token expired"

**Solution**: Click **Refresh Token** or **Clear Token** and re-authenticate.

### Issue: "Missing Client ID"

**Solution**: Update `.env.local` with your actual Okta Client ID.

## 📝 Environment Variables

| Variable                           | Description                                         | Required    |
| ---------------------------------- | --------------------------------------------------- | ----------- |
| `NEXT_PUBLIC_OKTA_CLIENT_ID`       | Your Okta application client ID                     | ✅ Yes      |
| `OKTA_CLIENT_SECRET`               | Your Okta client secret (server-side only, secured) | ✅ Yes      |
| `NEXT_PUBLIC_OKTA_ISSUER`          | Okta issuer URL                                     | ✅ Yes      |
| `NEXT_PUBLIC_OKTA_AUTH_ENDPOINT`   | OAuth authorization endpoint                        | ✅ Yes      |
| `NEXT_PUBLIC_OKTA_TOKEN_ENDPOINT`  | OAuth token endpoint                                | ✅ Yes      |
| `NEXT_PUBLIC_OAUTH_REDIRECT_URI`   | OAuth redirect URI                                  | ✅ Yes      |
| `NEXT_PUBLIC_DEFAULT_MCP_ENDPOINT` | Default MCP endpoint URL                            | ⚠️ Optional |
| `NEXT_PUBLIC_APP_URL`              | Application URL                                     | ⚠️ Optional |

## 🎯 Next Steps

1. **Update Client ID** in `.env.local`
2. **Start the app** with `npm run dev`
3. **Authenticate** with Okta
4. **Make MCP requests** to your endpoint

## 📄 License

MIT

## 🙏 Credits

Built with ❤️ using:

- [Next.js](https://nextjs.org/)
- [oauth4webapi](https://github.com/panva/oauth4webapi)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Need help?** Open an issue or check the inline code documentation for implementation details.
