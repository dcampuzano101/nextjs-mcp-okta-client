# MCP Client - Quick Setup Guide

## Prerequisites

1. **Complete ABAC Demo Setup**  
   Follow: https://docs.google.com/document/d/1vAugJAp8Jz7tRSNICyfzU-EHGn6xMGIaDNA_k_B5Ybw/edit?tab=t.0#heading=h.uhtdqclysi0p

   - Okta Client Provider on Anypoint
   - MCP Server on Managed Flex
   - Policies applied to MCP Server on Gateway

2. **Local Requirements**
   - Node.js installed
   - Git installed

---

## Setup Steps

### 1. Clone Repository

```bash
git clone https://github.com/dcampuzano101/nextjs-mcp-okta-client.git
cd nextjs-mcp-okta-client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp env.example .env.local
```

### 4. Request Access to MCP Server

1. Go to **Anypoint Exchange**
2. Find your **MCP Server** asset
3. Click **Request Access**
4. Select grant types: **Authorization Code** + **Client Credentials**
5. Set redirect URI: `http://localhost:3000/api/auth/callback`
6. Copy **Client ID** and **Client Secret**

### 5. Assign Groups in Okta

1. Go to **Okta Admin Console**
2. Navigate to **Applications** → Your MCP Application
3. Go to **Assignments** tab
4. Assign appropriate **MCP groups** to the application

### 6. Update `.env.local`

Get your Okta metadata from: `https://your-domain.okta.com/oauth2/default/.well-known/oauth-authorization-server`

Update these values in `.env.local`:

```bash
# From Anypoint Exchange
NEXT_PUBLIC_OKTA_CLIENT_ID=<your-client-id>
OKTA_CLIENT_SECRET=<your-client-secret>

# From Okta Metadata URI
NEXT_PUBLIC_OKTA_ISSUER=https://your-domain.okta.com/oauth2/default
NEXT_PUBLIC_OKTA_AUTH_ENDPOINT=https://your-domain.okta.com/oauth2/default/v1/authorize
NEXT_PUBLIC_OKTA_TOKEN_ENDPOINT=https://your-domain.okta.com/oauth2/default/v1/token

# Your MCP Endpoint
NEXT_PUBLIC_DEFAULT_MCP_ENDPOINT=https://your-gateway.cloudhub.io/your-mcp-path/
```

### 7. Run the Application

```bash
npm run dev
```

Open: http://localhost:3000

---

## Usage

1. Click **Authorize** button
2. Login with Okta
3. Select a tool from the sidebar
4. Fill in parameters
5. Click **Run**

---

## Troubleshooting

**"Invalid Client" error**

- Verify Client ID and Secret in `.env.local`
- Restart dev server: `npm run dev`

**No tools loading**

- Check MCP endpoint URL
- Verify you're authenticated (see "Connected" badge)
- Check policies are applied to MCP Server on Gateway

**CORS errors**

- Already handled by built-in proxy (no action needed)

---

**Done!** 🚀
