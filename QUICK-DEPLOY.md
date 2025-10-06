# ⚡ 5-Minute Deploy Checklist

## Prerequisites

- [ ] GitHub account
- [ ] Code pushed to GitHub repository

---

## Step 1: Deploy Backend (Railway) - 2 minutes

1. **Go to Railway.app** → Sign up with GitHub
2. **New Project** → Deploy from GitHub → Select your repo
3. **Add PostgreSQL** → Click "+ New" → Database → PostgreSQL
4. **Add Environment Variables:**
   ```
   JWT_SECRET=change-this-secret-key-123
   NODE_ENV=production
   FRONTEND_URL=temp-will-update-later
   ```
5. **Settings:**
   - Root Directory: `server`
   - Build: `npm install && npx prisma generate && npm run build`
   - Start: `npm run start:prod`
6. **Deploy** → Wait ~2 minutes
7. **Run in Terminal:**
   ```
   npx prisma migrate deploy
   npm run seed:auth
   ```
8. **Copy Backend URL** (e.g., `https://xxx.up.railway.app`)

✅ **Backend Live!**

---

## Step 2: Deploy Frontend (Vercel) - 2 minutes

1. **Go to Vercel.com** → Sign up with GitHub
2. **New Project** → Import your repo
3. **Settings:**
   - Root Directory: `honey`
   - Framework: Vite
4. **Add Environment Variable:**
   ```
   VITE_API_URL=https://[your-backend-url-from-step-1]
   ```
5. **Deploy** → Wait ~1 minute
6. **Copy Frontend URL** (e.g., `https://xxx.vercel.app`)

✅ **Frontend Live!**

---

## Step 3: Connect Them - 1 minute

1. **Update Backend on Railway:**

   - Go to your backend service
   - Variables → Edit
   - Change `FRONTEND_URL` to your Vercel URL
   - Redeploy

2. **Update CORS in code:**
   - Edit `server/src/main.ts`
   - Update origin to your Vercel URL
   - Push to GitHub (auto-deploys)

✅ **Connected!**

---

## Step 4: Test

Visit your URLs:

1. **Main Chatbot:** `https://your-app.vercel.app` ✅
2. **Admin Login:** `https://your-app.vercel.app/admin/login` ✅
   - Email: `admin@honeychatbot.com`
   - Password: `admin123`
3. **Agent Login:** `https://your-app.vercel.app/agent/login` ✅
   - Email: `sarah@honeychatbot.com`
   - Password: `agent123`

✅ **ALL DONE! You're Live! 🎉**

---

## Quick Commands

### Check Backend Health

```bash
curl https://your-backend.up.railway.app/auth/setup
```

### View Logs

```bash
# Railway
railway logs

# Vercel
vercel logs
```

### Rollback

```bash
# Railway
railway rollback

# Vercel
vercel rollback
```

---

## Common Issues

**"Invalid credentials"**
→ Run: `railway run npm run seed:auth`

**"CORS error"**
→ Update FRONTEND_URL in Railway variables

**"Build failed"**
→ Check logs, verify package.json scripts

---

## URLs to Bookmark

- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Your Live App: https://[your-app].vercel.app

---

**Total Time: 5 minutes! 🚀**
