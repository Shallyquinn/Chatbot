# Admin Login Redirect Issue - Fixed

## Problem Description

After logging into the admin account with correct credentials, the admin dashboard briefly appears but then immediately redirects back to the chatbot homepage (http://localhost:5173/).

## Root Causes Identified

### 1. **Wrong Redirect Path in adminApi.ts**

- **Issue**: On 401 errors, the API service was redirecting to `/login` instead of `/admin/login`
- **Impact**: This would redirect to a non-existent route, causing the router to fall back to the home route
- **Fix**: Changed redirect URL from `/login` to `/admin/login`

### 2. **Immediate Redirect on 401**

- **Issue**: API calls failing with 401 would immediately trigger a redirect, even during initial page load
- **Impact**: If the token was slightly expired or invalid, the dashboard would load and then immediately redirect
- **Fix**: Added check to prevent redirect loops and small delay

### 3. **Missing localStorage Cleanup**

- **Issue**: User data wasn't being removed on 401 errors
- **Impact**: Stale user data could cause authentication confusion
- **Fix**: Now removes `token`, `adminToken`, and `user` on 401

## Changes Made

### ✅ File 1: `honey/src/services/adminApi.ts` (Line 33-60)

**Before:**

```typescript
if (response.status === 401) {
  localStorage.removeItem("token");
  localStorage.removeItem("adminToken");
  window.location.href = "/login"; // ❌ Wrong URL
}
```

**After:**

```typescript
if (response.status === 401) {
  console.error("❌ 401 Unauthorized - Token invalid or expired");
  localStorage.removeItem("token");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("user"); // ✅ Also clear user data

  // Only redirect if not already on login page
  if (!window.location.pathname.includes("/login")) {
    console.log("🔄 Redirecting to admin login...");
    setTimeout(() => {
      window.location.href = "/admin/login"; // ✅ Correct URL
    }, 100); // ✅ Small delay to prevent loops
  }
}
```

### ✅ File 2: `honey/src/components/ProtectedRoute.tsx` (Enhanced Logging)

**Added:**

- More detailed console logging to track authentication flow
- Small 100ms delay before checking auth to ensure localStorage is fully written
- Better error messages showing what went wrong

**New Logging Output:**

```
🔐 ProtectedRoute Authentication Check:
  Required Role: admin
  Has Token: true
  Has User Data: true
  User Type: admin
  User Email: admin@honeychatbot.com
  User Name: Admin User
✅ Authentication successful - User has correct role
✅ Rendering protected content for admin
```

### ✅ File 3: `honey/src/hooks/useDashboardData.ts` (Better Error Handling)

**Added comments:** Clarified that errors should be caught and not thrown to prevent disrupting the component.

## How to Test the Fix

### Step 1: Clear All Cached Data

```bash
# Open browser console (F12) and run:
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Step 2: Login Fresh

1. Go to: http://localhost:5173/admin/login
2. Enter credentials:
   - Email: `admin@honeychatbot.com`
   - Password: `admin123`
3. Click "Sign In"

### Step 3: Watch Console Output

Open browser console (F12 → Console tab) and look for:

**✅ Expected Success Flow:**

```
🔐 Admin login attempt: admin@honeychatbot.com
✅ Login response received: {...}
💾 Stored in localStorage:
  - token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - user: {id: "...", email: "admin@honeychatbot.com", type: "admin"}
✅ Verification - user stored: true
✅ Verification - token stored: true
🚀 Navigating to /admin/dashboard

🔐 ProtectedRoute Authentication Check:
  Required Role: admin
  Has Token: true
  Has User Data: true
  User Type: admin
✅ Authentication successful - User has correct role
✅ Rendering protected content for admin
```

**❌ If You See This (Problem):**

```
❌ 401 Unauthorized - Token invalid or expired
🔄 Redirecting to admin login...
```

### Step 4: Verify Dashboard Stays Open

- Admin dashboard should load and stay open
- You should see the interface for at least 5-10 seconds
- No automatic redirect to chatbot page

## Debugging Steps if Issue Persists

### Debug 1: Check Token in API Response

```bash
# In AdminLogin.tsx, the response should look like:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "...",
    "email": "admin@honeychatbot.com",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

**Problem if:** Token is missing or empty string

### Debug 2: Check localStorage After Login

```javascript
// Run in browser console immediately after login:
console.log("Token:", localStorage.getItem("token"));
console.log("User:", localStorage.getItem("user"));
```

**Expected Output:**

```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
User: {"id":"...","email":"admin@honeychatbot.com","name":"Admin User","type":"admin"}
```

**Problem if:** Either is `null` or `undefined`

### Debug 3: Check Backend Server Response

```bash
# Run this to test backend directly:
curl -X POST http://localhost:3000/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@honeychatbot.com",
    "password": "admin123"
  }'
```

**Expected Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "...",
    "email": "admin@honeychatbot.com",
    "name": "Admin",
    "role": "ADMIN"
  }
}
```

**Problem if:** 401 Unauthorized or 404 Not Found

### Debug 4: Network Tab Analysis

1. Open DevTools (F12) → Network tab
2. Login as admin
3. Filter by "Fetch/XHR"
4. Look for these requests:

**During Login:**

- `POST /auth/admin/login` → Should be 200 OK

**After Dashboard Loads:**

- `GET /admin/metrics` → Should be 200 OK
- `GET /admin/agents` → Should be 200 OK
- `GET /admin/queue` → Should be 200 OK
- `GET /admin/profile` → Should be 200 OK

**Problem if:** Any request returns 401 Unauthorized

### Debug 5: Check Token Format

The JWT token should have 3 parts separated by dots:

```
header.payload.signature
eyJhbGc...OiJIUzI1Ni.eyJzdW...IjoxNjk5MD.SflKxwRJ...SQExURTJ
```

**Problem if:** Token is not in this format or is an empty string

## Common Issues & Solutions

### Issue 1: "Token is undefined"

**Cause:** Backend not returning `access_token` in response
**Solution:** Check backend auth controller and ensure it returns `access_token` field

### Issue 2: "401 Unauthorized immediately after login"

**Cause:** Token format mismatch or backend validation failing
**Solution:** Check backend JWT secret and token validation logic

### Issue 3: "Dashboard loads but redirects after 1 second"

**Cause:** One of the API calls (metrics/agents/queue/profile) is failing with 401
**Solution:** Check which API endpoint is failing in Network tab

### Issue 4: "Redirect loop - keeps going to login then dashboard"

**Cause:** Token exists but is invalid
**Solution:** Clear localStorage completely and login fresh

### Issue 5: "User type mismatch"

**Cause:** User stored with wrong type (e.g., "ADMIN" instead of "admin")
**Solution:** Ensure AdminLogin.tsx sets `type: 'admin'` (lowercase)

## Backend Checklist

Ensure your backend has these endpoints working:

- ✅ `POST /auth/admin/login` - Returns token and admin data
- ✅ `GET /admin/metrics` - Returns dashboard metrics (requires auth)
- ✅ `GET /admin/agents` - Returns agents list (requires auth)
- ✅ `GET /admin/queue` - Returns conversation queue (requires auth)
- ✅ `GET /admin/profile` - Returns admin profile (requires auth)

## Testing Checklist

Run through this checklist to verify everything works:

- [ ] Clear browser cache and localStorage
- [ ] Navigate to http://localhost:5173/admin/login
- [ ] Enter correct credentials
- [ ] Click "Sign In" button
- [ ] Observe console logs for authentication flow
- [ ] Verify token and user are stored in localStorage
- [ ] Admin dashboard loads and renders
- [ ] Dashboard stays open for at least 10 seconds
- [ ] No automatic redirect to chatbot page
- [ ] Can navigate dashboard tabs (Admin, Users, Agents, etc.)
- [ ] Logout button works (clears localStorage and redirects)

## Emergency Reset

If nothing works, do a complete reset:

```bash
# 1. Stop both servers
Ctrl+C in both terminal windows

# 2. Clear browser data
# In browser console (F12):
localStorage.clear()
sessionStorage.clear()
indexedDB.deleteDatabase('chatbot')

# 3. Restart backend
cd "C:/Users/Omotowa Shalom/Downloads/Chatbot-responses-api/Chatbot/server"
npm run start:dev

# 4. Restart frontend
cd "C:/Users/Omotowa Shalom/Downloads/Chatbot-responses-api/Chatbot/honey"
npm run dev

# 5. Hard refresh browser
Ctrl+Shift+R (or Cmd+Shift+R on Mac)

# 6. Try login again
```

## Success Criteria

✅ **Login is successful when:**

1. Console shows all authentication logs
2. localStorage has both `token` and `user`
3. Dashboard loads and displays data
4. No redirect happens for at least 10 seconds
5. You can see the admin interface clearly
6. Tabs are clickable and functional

## Next Steps After Fix

Once login works correctly:

1. **Test Agent Management Modal**: Click "Onboard Agent" button
2. **Test Agent Operations**: Add and delete test agents
3. **Test Dashboard Data**: Verify metrics, agents list, and queue display
4. **Test Logout**: Ensure logout clears data and redirects properly
5. **Test Refresh**: Reload page while logged in - should stay logged in

---

**If the issue persists after these fixes, please share:**

1. Full console output from login attempt
2. Network tab showing all requests and responses
3. Contents of localStorage after login (`localStorage.getItem('token')` and `localStorage.getItem('user')`)
4. Backend server logs showing the login request
