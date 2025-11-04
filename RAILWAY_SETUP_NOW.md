# Railway Deployment - Complete Setup Instructions

## 🎯 CURRENT STATUS

✅ **Preparation Complete!**
- Backend scripts updated with `postinstall` and `railway:deploy`
- Frontend `nixpacks.toml` created for proper deployment
- `serve` package added to frontend dependencies

---

## 📝 STEP-BY-STEP DEPLOYMENT PROCESS

### STEP 1: Push Changes to GitHub (5 minutes)

Your code is ready for deployment! Now push the changes:

```bash
# Navigate to the Chatbot directory
cd "C:\Users\Omotowa Shalom\Downloads\Chatbot-responses-api\Chatbot"

# Check git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Prepare for Railway deployment - add deployment scripts"

# Push to GitHub
git push origin main
```

**If you don't have a GitHub repo yet:**

1. Go to https://github.com
2. Click "New Repository"
3. Name it: `honey-chatbot` (or your preferred name)
4. **Don't** initialize with README
5. Copy the commands GitHub shows:

```bash
cd "C:\Users\Omotowa Shalom\Downloads\Chatbot-responses-api\Chatbot"
git remote add origin https://github.com/YOUR_USERNAME/honey-chatbot.git
git branch -M main
git push -u origin main
```

---

### STEP 2: Create Railway Account (3 minutes)

1. **Go to**: https://railway.app
2. **Click**: "Start a New Project" or "Login"
3. **Sign up with GitHub**:
   - Click "Login with GitHub"
   - Authorize Railway
   - This enables auto-deploy! ✅

4. **Verify email** (check inbox)
5. **Add payment method** (in Account Settings)
   - Don't worry: First month ~$3
   - $5 free credit applied automatically

---

### STEP 3: Deploy PostgreSQL Database (3 minutes)

1. In Railway, click **"New Project"**
2. Name it: `honey-chatbot`
3. Click **"+ New"** or **"Add Service"**
4. Select **"Database"** → **"PostgreSQL"**
5. Wait ~30 seconds for provisioning
6. ✅ Database ready!

**Important**: Click on PostgreSQL service, go to **"Variables"** tab
- You'll see `DATABASE_URL` - **DON'T copy it yet, we'll link it automatically**

---

### STEP 4: Deploy Backend (NestJS) (5 minutes)

1. Click **"+ New"** → **"GitHub Repo"**
2. Find and select your repository: `honey-chatbot`
3. Railway starts deployment
4. **STOP!** We need to configure first

**Configure Backend:**

1. Click on the backend service
2. Go to **"Settings"** tab
3. Set **"Root Directory"**: `server` (or `Chatbot/server` if needed)
4. Set **"Start Command"**: `npm run start:prod`
5. Go to **"Variables"** tab
6. Add these variables:

**Click "+ New Variable" for each:**

| Variable Name | Value | How to Add |
|--------------|-------|------------|
| `DATABASE_URL` | (link it) | Click "Add Reference" → Select PostgreSQL → Choose `DATABASE_URL` |
| `JWT_SECRET` | Your secret key | See below for how to generate |
| `PORT` | `3000` | Just type it |
| `NODE_ENV` | `production` | Just type it |

**Generate JWT_SECRET** (run this locally):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste as `JWT_SECRET`

7. Click **"Deploy"** or wait for auto-deploy
8. Watch logs (click "View Logs")
9. Wait 2-3 minutes

**Verify Backend:**
- Go to "Settings" → "Domains"
- Copy the URL (like `backend-production-xxxx.up.railway.app`)
- Open in browser - should see welcome message!

---

### STEP 5: Deploy Frontend (React/Vite) (5 minutes)

1. Click **"+ New"** → **"GitHub Repo"**
2. Select the **SAME repository** again
3. Railway detects it's the same repo - this is OK!
4. Click on the frontend service

**Configure Frontend:**

1. Go to **"Settings"** tab
2. Set **"Root Directory"**: `honey` (or `Chatbot/honey` if needed)
3. Build/start commands should auto-detect, but verify:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve dist -s -l $PORT`

4. Go to **"Variables"** tab
5. Add these:

| Variable Name | Value |
|--------------|-------|
| `VITE_API_URL` | Your backend URL from Step 4 |
| `VITE_SUPABASE_URL` | `https://ylxmkvwshlrjqjtdjjjo.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase key |

6. Click **"Deploy"** or wait for auto-deploy
7. Wait 2-3 minutes

**Verify Frontend:**
- Go to "Settings" → "Domains"
- Copy the URL
- Open in browser - your chatbot should load!

---

### STEP 6: Connect Services (2 minutes)

**Update Backend CORS:**

1. Go to backend service
2. Click **"Variables"**
3. Add new variable:
   - Name: `CORS_ORIGIN`
   - Value: Your frontend URL (from Step 5)
4. Backend auto-redeploys

**Test Connection:**
1. Open frontend URL
2. Try chatbot
3. Open browser console (F12)
4. Should see no errors!

---

### STEP 7: Verify Deployment (5 minutes)

**Backend Checklist:**
- [ ] Backend URL opens (shows welcome message)
- [ ] No errors in logs
- [ ] DATABASE_URL connected
- [ ] Migrations ran (check logs for "Prisma migrate")

**Frontend Checklist:**
- [ ] Frontend loads
- [ ] No console errors
- [ ] Can start conversation
- [ ] Messages work

**Database Checklist:**
- [ ] PostgreSQL service running (green in dashboard)
- [ ] Can connect from backend (no connection errors in logs)

---

## 🔄 AUTO-DEPLOY IS ACTIVE!

From now on, to update your chatbot:

```bash
# 1. Make changes in VS Code
# 2. Commit and push
git add .
git commit -m "Fixed bug in chatbot"
git push origin main

# 3. Railway automatically deploys!
# ✅ Live in 2-3 minutes - NO manual work!
```

---

## 🐛 TROUBLESHOOTING

### Problem: Backend won't start

**Check:**
1. Logs (click "View Logs" in Railway)
2. DATABASE_URL is linked (not copy-pasted)
3. JWT_SECRET is set
4. Root directory is correct (`server`)

**Fix:**
- Go to Settings → Redeploy
- Check logs for specific error

### Problem: Frontend blank page

**Check:**
1. Browser console (F12)
2. VITE_API_URL is correct (has https://)
3. Build logs (in Railway)

**Fix:**
- Verify all VITE_ variables are set
- Check build command in Settings
- Redeploy

### Problem: CORS error

**Check:**
1. Backend has CORS_ORIGIN set
2. CORS_ORIGIN matches frontend URL exactly

**Fix:**
```bash
# In backend variables
CORS_ORIGIN = https://your-exact-frontend-url.railway.app
```

### Problem: Database connection failed

**Check:**
1. PostgreSQL service is running (green)
2. DATABASE_URL is linked as reference
3. Backend logs for connection errors

**Fix:**
- Go to backend Variables
- Delete DATABASE_URL
- Re-add using "Add Reference" → PostgreSQL

---

## 💰 COST TRACKING

**Your Current Setup:**
- Frontend: ~$1.50/month
- Backend: ~$3.50/month
- PostgreSQL: ~$3.00/month
- **Total**: ~$8/month
- **First month**: ~$3 (with $5 credit)

**Monitor Usage:**
1. Railway dashboard → Click project name
2. See "Usage" section
3. Check costs daily during testing

---

## 📱 ACCESSING YOUR DEPLOYED CHATBOT

**Frontend (Chatbot Interface):**
```
https://honey-production-xxxx.up.railway.app
```

**Backend API:**
```
https://honey-backend-production-xxxx.up.railway.app
```

**Admin Dashboard:**
```
https://honey-production-xxxx.up.railway.app/admin
```

**Agent Interface:**
```
https://honey-production-xxxx.up.railway.app/agent
```

---

## 🎯 NEXT STEPS AFTER DEPLOYMENT

### 1. Seed Database (Optional)

Using Railway CLI:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run seed scripts
railway run npm run seed:all
```

### 2. Create Admin Account

Option A: Via API endpoint (use Postman/Insomnia):
```
POST https://your-backend-url/admin/register
{
  "email": "admin@honeychatbot.com",
  "password": "yourSecurePassword",
  "name": "Admin User"
}
```

Option B: Direct database insert (via Railway CLI):
```bash
railway connect postgres
# Then run SQL commands
```

### 3. Test Everything

- [ ] User chatbot flow
- [ ] Admin login
- [ ] Agent login
- [ ] Conversation assignment
- [ ] WebSocket agent chat
- [ ] All 4 chatbot sections
- [ ] Message persistence

### 4. Share Your Demo

Your chatbot is live! Share the URL:
```
https://your-frontend-url.railway.app
```

---

## 📊 DEPLOYMENT SUMMARY

| Service | Status | URL | Cost |
|---------|--------|-----|------|
| Frontend | ✅ Live | `honey-xxxx.railway.app` | $1.50/mo |
| Backend | ✅ Live | `backend-xxxx.railway.app` | $3.50/mo |
| PostgreSQL | ✅ Live | Internal connection | $3.00/mo |
| **TOTAL** | | | **$8/mo** |

**First Month**: Pay only $3 (with $5 free credit)

---

## ✅ SUCCESS!

Congratulations! Your chatbot is now deployed on Railway! 🎉

**What you get:**
- ✅ Professional demo environment
- ✅ Auto-deploy on git push
- ✅ Custom domain capable
- ✅ Always running (no sleeping)
- ✅ SSL certificates (HTTPS)
- ✅ 2-minute deployments
- ✅ Easy rollback
- ✅ Real-time logs

**Cost savings vs Heroku:**
- $15/month saved
- $185/year saved

---

## 📞 NEED HELP?

**Railway Support:**
- Discord: https://discord.gg/railway (VERY responsive!)
- Docs: https://docs.railway.app
- Status: https://status.railway.app

**Common Questions:**
- How do I rollback? → Go to service → Deployments → Click previous → Redeploy
- How do I see logs? → Click service → View Logs
- How do I add more RAM? → Settings → Adjust memory slider
- How do I delete service? → Settings → Scroll down → Delete Service

---

**Ready to deploy? Follow the steps above and you'll be live in ~30 minutes!** 🚀
