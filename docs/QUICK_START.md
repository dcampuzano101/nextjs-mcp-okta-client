# ⚡ Quick Start Guide - MCP Client UI

This guide will get you from zero to a working MCP Client in under 15 minutes.

---

## 🚀 Setup Commands

### 1. Initialize Next.js Project

```bash
# Create Next.js app with TypeScript and Tailwind
npx create-next-app@latest mcp-client-ui \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd mcp-client-ui
```

### 2. Install Shadcn/ui

```bash
# Initialize Shadcn
npx shadcn-ui@latest init

# When prompted:
# - TypeScript: Yes
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
```

### 3. Install Dependencies

```bash
# Install OAuth library and utilities
npm install oauth4webapi

# Install Shadcn components
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

# Install additional utilities
npm install lucide-react class-variance-authority clsx tailwind-merge
```

---

## 📁 Create Project Structure

```bash
# Create directory structure
mkdir -p app/api/auth/callback
mkdir -p app/api/auth/token
mkdir -p components/{ui,mcp-client,auth}
mkdir -p lib/{oauth,mcp}
mkdir -p hooks
mkdir -p types
```

---

## 🔧 Environment Setup

Create `.env.local`:

```bash
cat > .env.local << 'EOF'
# OAuth Configuration
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Okta Configuration (from your metadata.json)
NEXT_PUBLIC_OKTA_ISSUER=https://trial-3882279.okta.com/oauth2/default
NEXT_PUBLIC_OKTA_AUTH_ENDPOINT=https://trial-3882279.okta.com/oauth2/default/v1/authorize
NEXT_PUBLIC_OKTA_TOKEN_ENDPOINT=https://trial-3882279.okta.com/oauth2/default/v1/token
NEXT_PUBLIC_OKTA_CLIENT_ID=your-okta-client-id-here

# Default MCP Endpoint
NEXT_PUBLIC_DEFAULT_MCP_ENDPOINT=https://agent-network-ingress-gw-205q5y.s7le3r.usa-e2.cloudhub.io/crm-mcp/

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

---

## 📝 Copy Okta Configuration

Since you already have `okta-metadata.json`, let's use it:

```bash
# Copy your metadata for reference
cp okta-metadata.json public/okta-metadata.json
```

---

## 🎨 Tailwind Configuration

Verify `tailwind.config.ts` includes:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 🔥 Development Server

```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
```

---

## 📦 Package.json Scripts

Your `package.json` should include:

```json
{
  "name": "mcp-client-ui",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "oauth4webapi": "^2.4.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "lucide-react": "^0.316.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1"
  }
}
```

---

## 🎯 Implementation Checklist

After setup, follow these steps:

### Phase 1: Core Infrastructure ✅

- [ ] Create OAuth utilities (`lib/oauth/`)
- [ ] Create token storage (`lib/oauth/token-storage.ts`)
- [ ] Setup callback route (`app/api/auth/callback/route.ts`)
- [ ] Create auth context/hook (`hooks/use-auth.ts`)

### Phase 2: UI Components ✅

- [ ] Build main layout (`app/page.tsx`)
- [ ] Create request builder (`components/mcp-client/request-builder.tsx`)
- [ ] Build authorization tab (`components/mcp-client/authorization-tab.tsx`)
- [ ] Create message tab (`components/mcp-client/message-tab.tsx`)
- [ ] Build tools list (`components/mcp-client/tools-list.tsx`)
- [ ] Create response viewer (`components/mcp-client/response-viewer.tsx`)

### Phase 3: MCP Integration ✅

- [ ] Create MCP client (`lib/mcp/client.ts`)
- [ ] Define MCP types (`lib/mcp/types.ts`)
- [ ] Build request/response handling
- [ ] Add error handling

### Phase 4: Polish ✅

- [ ] Add loading states
- [ ] Implement error boundaries
- [ ] Add keyboard shortcuts
- [ ] Test with real Okta credentials

---

## 🧪 Quick Test

Once basic structure is in place, test with:

```bash
# 1. Start dev server
npm run dev

# 2. Open browser to http://localhost:3000

# 3. Navigate to Authorization tab

# 4. Enter Okta credentials:
#    - Issuer: https://trial-3882279.okta.com/oauth2/default
#    - Client ID: (your client ID)
#    - Scopes: openid profile email

# 5. Click "Authorize"

# 6. Login with Okta

# 7. Should redirect back and show token

# 8. Make test MCP request to:
#    POST https://your-mcp-endpoint.com
```

---

## 🔍 Verify Setup

Run these commands to ensure everything is ready:

```bash
# Check TypeScript setup
npm run type-check

# Check for linting issues
npm run lint

# Build to verify no errors
npm run build
```

---

## 📚 Next Steps

1. **Read**: `IMPLEMENTATION_PLAN.md` for detailed architecture
2. **Compare**: `LIBRARY_COMPARISON.md` for library choices
3. **Review**: `okta-metadata.json` for your Okta config
4. **Code**: Start implementing following the plan

---

## 🐛 Common Issues

### Issue: Shadcn components not found

```bash
# Solution: Verify components are in components/ui/
ls components/ui/

# Re-add if missing
npx shadcn-ui@latest add button
```

### Issue: OAuth redirect fails

```bash
# Solution: Check .env.local
cat .env.local | grep REDIRECT

# Verify matches Okta app settings
# Should be: http://localhost:3000/api/auth/callback
```

### Issue: CORS errors

```bash
# Solution: Verify Okta app settings allow:
# - Trusted Origins: http://localhost:3000
# - Redirect URIs: http://localhost:3000/api/auth/callback
```

---

## 💡 Pro Tips

1. **Use the metadata**: Your `okta-metadata.json` has all endpoints
2. **Test incrementally**: Don't build everything at once
3. **Use browser DevTools**: Network tab shows OAuth flow
4. **Token debugging**: Use jwt.io to decode tokens
5. **Local storage**: Check Application tab for stored tokens

---

## ✅ Success Criteria

You'll know setup is complete when:

- ✅ Next.js dev server runs without errors
- ✅ All Shadcn components are installed
- ✅ TypeScript compiles successfully
- ✅ `.env.local` has all required variables
- ✅ Directory structure matches plan

---

## 🚀 Ready to Code!

Setup is complete! Now you can start implementing the MCP Client following the `IMPLEMENTATION_PLAN.md`.

**Estimated time to working prototype**: 3-4 hours
**Estimated time to production-ready**: 6-8 hours

Good luck! 🎉
