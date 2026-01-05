# Multi-User & JWT Display Feature

## 🎉 What's New

This branch adds **multi-user support** and **JWT token display** to the MCP Client, making it perfect for ABAC (Attribute-Based Access Control) demos!

---

## ✨ Key Features

### 1. **Multi-User Sessions** 👥
- **Add multiple users** by clicking "Authorize" multiple times
- Each user gets authenticated separately with their own tokens
- **Switch between users** instantly via dropdown menu
- No need to re-login when switching contexts!

### 2. **JWT Token Display** 🔍
- **Expandable panel** showing decoded JWT claims
- Highlights **ABAC-critical information**:
  - User email
  - **Groups** (the key for ABAC policies!)
  - OAuth scopes
  - Token expiration time
- **Copy tokens** to clipboard for debugging
- View full JSON token details

### 3. **User Switcher Dropdown** 🔄
- Shows all logged-in users
- Displays groups as badges for each user
- One-click switching between user contexts
- Remove individual users or clear all

---

## 🎯 Perfect for ABAC Demos

**Demo Flow:**
1. Log in as `MCP_Admin` (has `MCP_Admin` group)
2. Execute `get_accounts` → See all accounts
3. Click user dropdown → **Add Another User**
4. Log in as `MCP_User` (has limited groups)
5. **Switch to MCP_User** → Execute same request
6. See **filtered results** (ABAC in action!)
7. Expand JWT panel to show **why** different results (groups differ)

---

## 🏗️ Architecture

### New Components
- **`jwt-display-panel.tsx`** - Expandable JWT viewer with ABAC focus
- **`user-switcher.tsx`** - Dropdown for switching between users
- **`multi-user-storage.ts`** - localStorage wrapper for multi-user sessions
- **`jwt-utils.ts`** - JWT decoding and claim extraction utilities
- **`use-multi-user-auth.ts`** - React hook for multi-user authentication

### Updated Components
- **`navbar.tsx`** - Integrated user switcher and multi-user controls
- **`mcp-client.tsx`** - Uses multi-user auth, refreshes on user switch
- **`lib/mcp/client.ts`** - Gets token from active user session

### Type Additions
- `UserSession` - Complete user session with tokens and claims
- `JWTClaims` - Decoded JWT payload interface

---

## 📦 Storage Structure

**Multi-User Sessions** (`localStorage`):
```json
{
  "mcp_user_sessions": [
    {
      "userId": "00u1234...",
      "email": "admin@example.com",
      "displayName": "Admin User",
      "tokens": { ... },
      "claims": { "groups": ["MCP_Admin"], ... },
      "addedAt": 1736089000000
    },
    {
      "userId": "00u5678...",
      "email": "user@example.com",
      "displayName": "Regular User",
      "tokens": { ... },
      "claims": { "groups": ["Everyone"], ... },
      "addedAt": 1736089120000
    }
  ],
  "mcp_active_user_id": "00u1234..."
}
```

---

## 🎨 UI Updates

### JWT Display Panel (Collapsed)
```
🔑 Token Details - admin@example.com
   Groups: MCP_Admin, Everyone • Expires: 1h 23m
```

### JWT Display Panel (Expanded)
Shows:
- ✅ Email
- ✅ **Groups** (highlighted as badges)
- ✅ Scopes
- ✅ Expiration (with countdown)
- ✅ Issued time
- ✅ Subject (user ID)
- 📋 Copy buttons for access & ID tokens
- 🔍 Full JSON view (collapsible)

### User Switcher Dropdown
```
┌─────────────────────────────────────┐
│ Active Users (2)                    │
├─────────────────────────────────────┤
│ Admin User          [Active]        │
│ admin@example.com                   │
│ [MCP_Admin] [Everyone]              │
├─────────────────────────────────────┤
│ Regular User                        │
│ user@example.com                    │
│ [Everyone]                          │
├─────────────────────────────────────┤
│ + Add Another User                  │
└─────────────────────────────────────┘
```

---

## 🔧 Technical Details

### JWT Decoding
- **Client-side only** (for display purposes)
- Uses `atob()` with base64url decoding
- Extracts standard OAuth/OIDC claims
- No verification (handled by server)

### Session Persistence
- All sessions stored in `localStorage`
- Survives page refresh
- Active user ID tracked separately
- MCP requests automatically use active user's token

### User Switching
- **Instant context switch** - no page reload
- Clears MCP state (tools, response) on switch
- Fetches fresh tools with new user's token
- Maintains MCP session per user

---

## 🧪 Testing Checklist

✅ Log in first user → See JWT panel
✅ Add second user → Both appear in dropdown
✅ Switch between users → MCP requests use correct token
✅ Expand JWT panel → Shows groups, scopes, expiration
✅ Copy token → Works and shows confirmation
✅ Remove user → User disappears, switches to remaining
✅ Clear all → All users removed, returns to auth screen
✅ Page refresh → Users persist, active user restored

---

## 🚀 Usage

1. **Start the app**: `npm run dev`
2. **Click "Authorize"** → Log in as first user
3. **Expand JWT panel** → See token details
4. **Add another user**: Click dropdown → "Add Another User"
5. **Switch users**: Use dropdown to change active user
6. **Execute MCP tools** → See different results based on user groups
7. **Demo ABAC**: Show how groups in JWT affect API responses!

---

## 🎓 Key Benefits for ABAC Demos

1. **Visual JWT inspection** - Show groups without leaving the app
2. **Side-by-side comparison** - Switch users, compare results instantly
3. **No re-authentication** - Keep multiple users logged in
4. **Clear attribution** - Always see which user is active
5. **Copy tokens** - Debug or inspect in jwt.io

---

## 📝 Notes

- Users are stored **locally** (per browser)
- Each user maintains their own OAuth tokens
- MCP session is initialized per user
- Token refresh not yet implemented for background users
- No limit on number of concurrent users

---

## 🔜 Future Enhancements

- [ ] Auto-refresh tokens for all users
- [ ] Session expiry warnings
- [ ] User nicknames/labels
- [ ] Import/export user sessions
- [ ] Token introspection API integration

---

**Branch**: `feature/multi-user-jwt-display`
**Created**: January 5, 2026
**Status**: ✅ Ready for testing and demo!

