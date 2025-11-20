# 🚀 MCP Client with OAuth2 - Setup Guide

A production-ready MCP (Model Context Protocol) client with OAuth2 authentication, similar to Postman.

## ✨ Features

- ✅ **OAuth2 + PKCE Authentication** with Okta
- ✅ **Secure Token Management** (server-side client secret)
- ✅ **Postman-Style UI** (3-column layout)
- ✅ **Save MCP Endpoints** (like Postman collections)
- ✅ **Dynamic Tool Discovery** and form generation
- ✅ **MCP Session Management** with automatic header injection
- ✅ **Auto Token Refresh**
- ✅ **CORS-free** via server-side proxy

---

## 📋 Prerequisites

- Node.js 18+ and npm
- Okta account with an application configured
- MCP endpoint URL

---

## 🔧 Quick Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd okta-mcp-ui

# Install dependencies
npm install
```

### 2. Configure Environment Variables

```bash
# Copy the example file
cp env.example .env.local

# Edit .env.local with your actual values
# NEVER commit .env.local to git!
```

**Required Variables:**

```bash
# Okta Configuration
NEXT_PUBLIC_OKTA_ISSUER=https://your-domain.okta.com/oauth2/default
NEXT_PUBLIC_OKTA_AUTH_ENDPOINT=https://your-domain.okta.com/oauth2/default/v1/authorize
NEXT_PUBLIC_OKTA_TOKEN_ENDPOINT=https://your-domain.okta.com/oauth2/default/v1/token
NEXT_PUBLIC_OKTA_CLIENT_ID=your-client-id
OKTA_CLIENT_SECRET=your-client-secret

# OAuth Scopes (add 'groups' if using ABAC)
NEXT_PUBLIC_OKTA_SCOPES=openid profile groups

# MCP Endpoint
NEXT_PUBLIC_DEFAULT_MCP_ENDPOINT=https://your-mcp-endpoint/

# Redirect URI
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

### 3. Configure Okta Application

1. **Login to Okta Admin Console**
2. **Applications** → **Create App Integration**
3. **Select**: OIDC - Web Application
4. **Configure:**
   - **Sign-in redirect URIs**: `http://localhost:3000/api/auth/callback`
   - **Sign-out redirect URIs**: `http://localhost:3000`
   - **Assignments**: Select users/groups who can access
5. **Save** and copy:
   - Client ID
   - Client Secret

### 4. Run the Application

```bash
# Development mode
npm run dev

# Open browser
open http://localhost:3000
```

---

## 🎯 How to Use

### 1. **Authorize**

- Click the **"Authorize"** button in the navbar
- Login with your Okta credentials
- You'll be redirected back with authentication

### 2. **Save Endpoints** (Optional)

- Click **"Saved Endpoints"** button
- Click **"Save Current"**
- Enter a name (e.g., "Production CRM")
- Click **"Save Endpoint"**
- Switch between saved endpoints anytime

### 3. **Select a Tool**

- Tools will load automatically after authorization
- Click on any tool in the left sidebar

### 4. **Execute Tool**

- Fill in the dynamically generated form
- Click **"Call Tool"**
- View the response in the right panel

### 5. **Logout**

- Click **"Clear Token"** to logout
- All state is cleared for a fresh start

---

## 🏗️ Architecture

### Key Components

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── callback/route.ts    # OAuth callback handler
│   │   │   └── token/route.ts       # Token exchange (server-side)
│   │   └── mcp/route.ts             # MCP proxy (handles CORS)
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Main page
├── components/
│   └── mcp-client/
│       ├── mcp-client.tsx           # Main client component
│       ├── navbar.tsx               # Auth navbar
│       ├── tools-sidebar.tsx        # Tools list
│       ├── tool-form.tsx            # Dynamic form generator
│       ├── response-viewer.tsx      # Response display
│       └── endpoint-manager.tsx     # Save/manage endpoints
├── hooks/
│   └── use-auth.ts                  # Auth state management
├── lib/
│   ├── oauth/
│   │   ├── client.ts                # OAuth flow logic
│   │   └── token-storage.ts         # Token persistence
│   └── mcp/
│       ├── client.ts                # MCP client functions
│       └── endpoint-storage.ts      # Endpoint persistence
└── types/
    └── index.ts                     # TypeScript types
```

### Authentication Flow

```
1. User clicks "Authorize"
   ↓
2. Redirect to Okta (with PKCE challenge)
   ↓
3. User logs in at Okta
   ↓
4. Okta redirects back with authorization code
   ↓
5. Server exchanges code for tokens (with client secret)
   ↓
6. Tokens stored in localStorage
   ↓
7. Access token injected into MCP requests
```

### MCP Flow

```
1. Initialize MCP session
   ↓
2. Send initialized notification
   ↓
3. List available tools
   ↓
4. User selects and executes tool
   ↓
5. Response displayed
```

---

## 🔐 Security Features

- ✅ **PKCE** - Protects against authorization code interception
- ✅ **State Parameter** - CSRF protection
- ✅ **Client Secret on Server** - Never exposed to browser
- ✅ **Basic Auth** - Client credentials in Authorization header
- ✅ **Session Management** - MCP session ID tracking
- ✅ **Secure Token Storage** - LocalStorage with expiry checks
- ✅ **Auto Token Refresh** - Seamless token renewal

---

## 🚀 Deployment

### Deploy to CloudHub 2.0 / Runtime Fabric

1. **Update Environment Variables** in your deployment platform
2. **Update Redirect URI** in Okta to your production URL
3. **Update `NEXT_PUBLIC_OAUTH_REDIRECT_URI`** to production callback
4. **Deploy:**

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables for Production

Make sure to set these in your deployment platform:

- All `NEXT_PUBLIC_*` variables
- `OKTA_CLIENT_SECRET` (keep secret!)
- Update URLs to production domains

---

## 🛠️ Customization

### Change OAuth Provider

Currently configured for Okta, but can be adapted for:

- Auth0
- Azure AD
- Google OAuth
- Any OAuth2/OIDC provider

Edit: `lib/oauth/client.ts` and `hooks/use-auth.ts`

### Add Custom Tools

Tools are discovered automatically from the MCP endpoint.
No code changes needed!

### Customize UI Theme

Edit: `app/globals.css` for Tailwind CSS variables

---

## 🐛 Troubleshooting

### "Invalid Client" Error

**Problem:** Client authentication failed

**Solutions:**

- ✅ Verify `OKTA_CLIENT_ID` is correct
- ✅ Verify `OKTA_CLIENT_SECRET` is correct
- ✅ Check that client secret is set (no `NEXT_PUBLIC_` prefix)
- ✅ Restart dev server after changing `.env.local`

### "Session Not Initialized" Error

**Problem:** MCP session ID not maintained

**Solutions:**

- ✅ Check browser console for session ID logs
- ✅ Verify MCP endpoint supports session management
- ✅ Clear browser cache and try again

### CORS Errors

**Problem:** Browser blocks direct MCP requests

**Solutions:**

- ✅ All MCP requests go through `/api/mcp` proxy
- ✅ Check that proxy is working: `POST /api/mcp`
- ✅ Verify MCP endpoint is accessible from server

### No Tools Loading

**Problem:** Tools list is empty

**Solutions:**

- ✅ Check MCP endpoint URL is correct
- ✅ Verify you're authenticated (see "Connected" badge)
- ✅ Check browser console and server logs
- ✅ Verify MCP endpoint returns tools in JSON-RPC format

### Saved Endpoints Not Persisting

**Problem:** Endpoints disappear after refresh

**Solutions:**

- ✅ Check browser localStorage is enabled
- ✅ Check for localStorage quota errors in console
- ✅ Try clearing browser cache

---

## 📚 Additional Resources

- **MCP Protocol**: https://modelcontextprotocol.io/
- **OAuth 2.0**: https://oauth.net/2/
- **PKCE**: https://oauth.net/2/pkce/
- **Okta Docs**: https://developer.okta.com/docs/
- **Next.js**: https://nextjs.org/docs

---

## 🤝 Contributing

This is a template for your team. Feel free to:

- Customize the UI/UX
- Add new features
- Adapt for different OAuth providers
- Extend for different MCP implementations

---

## 📝 License

[Your License Here]

---

## 👥 Support

For questions or issues, contact your team lead or create an issue in the repository.

---

**Built with ❤️ by the MuleSoft Team**
