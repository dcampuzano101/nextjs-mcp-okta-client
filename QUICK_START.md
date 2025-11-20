# ⚡ Quick Start Guide

Get up and running in 5 minutes!

## 🚀 Setup

### 1. Copy Environment Template

```bash
cp env.example .env.local
```

### 2. Edit `.env.local` with Your Values

**Minimum Required:**

```bash
NEXT_PUBLIC_OKTA_CLIENT_ID=your-client-id
OKTA_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_OKTA_ISSUER=https://your-domain.okta.com/oauth2/default
NEXT_PUBLIC_OKTA_AUTH_ENDPOINT=https://your-domain.okta.com/oauth2/default/v1/authorize
NEXT_PUBLIC_OKTA_TOKEN_ENDPOINT=https://your-domain.okta.com/oauth2/default/v1/token
NEXT_PUBLIC_DEFAULT_MCP_ENDPOINT=https://your-mcp-endpoint/
```

### 3. Install & Run

```bash
npm install
npm run dev
```

### 4. Open Browser

```
http://localhost:3000
```

---

## 🔑 Get Okta Credentials

1. **Okta Admin Console** → **Applications** → **Your App**
2. Copy:
   - **Client ID**
   - **Client Secret**
3. Verify **Redirect URI**:
   - Add: `http://localhost:3000/api/auth/callback`

---

## 🎯 First Test

1. Click **"Authorize"** button
2. Login with Okta
3. See **"Connected"** badge + your email
4. Click a tool in the sidebar
5. Fill the form
6. Click **"Call Tool"**
7. See the response!

---

## 💾 Save Endpoints (Optional)

1. Click **"Saved Endpoints"** button
2. Click **"Save Current"**
3. Name it (e.g., "Dev Environment")
4. Done! Switch between endpoints anytime

---

## 🐛 Common Issues

### Can't login?

- ✅ Check Client ID & Secret in `.env.local`
- ✅ Verify redirect URI in Okta matches `http://localhost:3000/api/auth/callback`
- ✅ Restart dev server: `npm run dev`

### No tools loading?

- ✅ Verify MCP endpoint URL is correct
- ✅ Check you're authenticated (see "Connected")
- ✅ Check browser console for errors

### "Invalid Client" error?

- ✅ Make sure `OKTA_CLIENT_SECRET` has NO `NEXT_PUBLIC_` prefix
- ✅ Restart dev server after changing `.env.local`

---

## 📚 Need More Help?

See **SETUP.md** for detailed documentation.

---

**Ready to build! 🚀**
