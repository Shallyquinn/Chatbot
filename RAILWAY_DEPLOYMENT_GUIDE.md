# Railway Deployment Guide - Step-by-Step Setup

**Date**: November 4, 2025  
**Project**: Honey Chatbot with PostgreSQL  
**Estimated Time**: 45-60 minutes

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before starting, make sure you have:
- ✅ GitHub account
- ✅ Your code pushed to GitHub repository
- ✅ Credit/debit card (for Railway - even though first month is $3)
- ✅ JWT_SECRET value ready
- ✅ All local changes committed

---

## 🚀 PART 1: RAILWAY ACCOUNT SETUP (5 minutes)

### Step 1: Create Railway Account

1. **Go to Railway**: https://railway.app
2. **Click "Start a New Project"** or "Login"
3. **Sign up with GitHub**:
   - Click "Login with GitHub"
   - Authorize Railway to access your repositories
   - ✅ This enables auto-deploy!

### Step 2: Verify Email
- Check your email for verification link
- Click to verify (important for billing)

### Step 3: Add Payment Method
- Go to Account Settings
- Add credit/debit card
- Don't worry: First month only costs ~$3!
- Free $5 credit applied automatically

---

## 📦 PART 2: DEPLOY POSTGRESQL DATABASE (10 minutes)

### Step 1: Create New Project

1. Click **"New Project"** in Railway dashboard
2. Name it: `honey-chatbot` (or your preferred name)
3. Click **"Add Service"** or **"+"**

### Step 2: Add PostgreSQL Database

1. Click **"Database"**
2. Select **"PostgreSQL"**
3. Railway provisions database (takes ~30 seconds)
4. ✅ Database is ready!

### Step 3: Get Database Credentials

1. Click on the PostgreSQL service
2. Go to **"Variables"** tab
3. You'll see:
   - `DATABASE_URL` (automatically generated)
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DB`

**IMPORTANT**: Copy the `DATABASE_URL` - you'll need it!

Example format:
```
postgresql://postgres:password@region.railway.app:5432/railway
```

---

## 🔧 PART 3: DEPLOY BACKEND (NESTJS API) (15 minutes)

### Step 1: Add Backend Service

1. In your Railway project, click **"+ New Service"**
2. Select **"GitHub Repo"**
3. **Connect your repository**:
   - Find: `Chatbot-responses-api` (or your repo name)
   - Click to select
4. **Important**: Set the **Root Directory**:
   - Click on the service
   - Go to **"Settings"**
   - Find **"Root Directory"**
   - Set to: `Chatbot/server`
   - ✅ This tells Railway where your backend code is

### Step 2: Configure Build Settings

Railway auto-detects NestJS, but verify:

1. Go to **"Settings"** tab
2. Check:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
3. If not set, add them manually

### Step 3: Add Environment Variables

1. Click **"Variables"** tab
2. Add these variables:

**Required Variables:**
```
DATABASE_URL = <paste the DATABASE_URL from your PostgreSQL service>
JWT_SECRET = <your secret key - generate a strong one>
PORT = 3000
NODE_ENV = production
```

**To link DATABASE_URL automatically:**
- Instead of pasting, click **"+ New Variable"**
- Click **"Add Reference"**
- Select your PostgreSQL service
- Choose `DATABASE_URL`
- ✅ Now it's automatically linked!

**Generate JWT_SECRET** (if you don't have one):
```bash
# Run this locally to generate a secure secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Optional Variables** (if needed):
```
CORS_ORIGIN = <leave blank for now, we'll add frontend URL later>
SUPABASE_URL = https://ylxmkvwshlrjqjtdjjjo.supabase.co
SUPABASE_KEY = <your supabase key if using>
```

### Step 4: Deploy Backend

1. Click **"Deploy"** (or it auto-deploys)
2. Watch the build logs (click "View Logs")
3. Wait 2-3 minutes for:
   - Dependencies installation
   - Prisma client generation
   - Database migrations
   - Build completion
   - Server start

### Step 5: Verify Backend is Running

1. Go to **"Settings"** tab
2. Find **"Domains"** section
3. You'll see a URL like: `backend-production-xxxx.up.railway.app`
4. Click to open in browser
5. You should see: `{"message":"Welcome to Honey Chatbot API"}` or similar

**Test the API:**
```
https://your-backend-url.railway.app/health
```

✅ If you see a response, backend is deployed!

---

## 🎨 PART 4: DEPLOY FRONTEND (REACT/VITE) (15 minutes)

### Step 1: Add Frontend Service

1. In Railway project, click **"+ New Service"**
2. Select **"GitHub Repo"**
3. Select the **same repository**
4. **Set Root Directory**:
   - Go to **"Settings"**
   - Set **"Root Directory"**: `Chatbot/honey`
   - ✅ This tells Railway where your frontend code is

### Step 2: Configure Build Settings

1. Go to **"Settings"** tab
2. Set:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: Leave blank or set to `npx vite preview --host 0.0.0.0 --port $PORT`

**Important for Vite:**
Railway needs to serve the built files. Add this to your frontend:

### Step 3: Create nixpacks.toml (for proper deployment)

Create this file in `Chatbot/honey/nixpacks.toml`:

```toml
[phases.setup]
nixPkgs = ['nodejs_18']

[phases.install]
cmds = ['npm install']

[phases.build]
cmds = ['npm run build']

[start]
cmd = 'npx serve dist -s -l $PORT'
```

Then add `serve` to your frontend package.json:

```bash
# Run this in Chatbot/honey directory:
npm install --save serve
```

### Step 4: Add Environment Variables

1. Click **"Variables"** tab
2. Add:

```
VITE_API_URL = <your backend Railway URL>
VITE_SUPABASE_URL = https://ylxmkvwshlrjqjtdjjjo.supabase.co
VITE_SUPABASE_ANON_KEY = <your supabase key>
```

**Get Backend URL:**
- Go to your backend service
- Copy the URL from "Settings" > "Domains"
- Paste as `VITE_API_URL`

### Step 5: Deploy Frontend

1. Save all changes
2. Railway auto-deploys
3. Watch build logs
4. Wait 2-3 minutes

### Step 6: Get Frontend URL

1. Go to **"Settings"** tab
2. Find **"Domains"** section
3. Copy the frontend URL: `frontend-production-xxxx.up.railway.app`
4. ✅ Your chatbot is live!

---

## 🔗 PART 5: CONNECT FRONTEND & BACKEND (5 minutes)

### Step 1: Update Backend CORS

1. Go to backend service
2. Click **"Variables"**
3. Add or update:
   ```
   CORS_ORIGIN = https://your-frontend-url.railway.app
   ```
4. Backend automatically redeploys

### Step 2: Test the Connection

1. Open frontend URL in browser
2. Try to use the chatbot
3. Open browser console (F12)
4. Check for errors

**If you see CORS errors:**
- Double-check `CORS_ORIGIN` in backend
- Make sure backend redeployed
- Clear browser cache

---

## 🔄 PART 6: ENABLE AUTO-DEPLOY (Already Done!)

Good news! Auto-deploy is already enabled because you connected via GitHub.

### How It Works:

1. Make code changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Updated chatbot flow"
   git push origin main
   ```
3. Railway automatically:
   - Detects push
   - Builds frontend + backend
   - Deploys new versions
   - ✅ Live in 2-3 minutes!

### To Verify Auto-Deploy is ON:

1. Go to each service (frontend/backend)
2. Click **"Settings"**
3. Check **"Deployment"** section
4. Should show: "Deploy on push to `main`" ✅

---

## 🗃️ PART 7: RUN DATABASE MIGRATIONS (5 minutes)

### Option 1: Automatic (Recommended)

Railway automatically runs migrations because we added `postinstall` script!

Check logs to confirm:
1. Go to backend service
2. Click **"Deployments"**
3. Click latest deployment
4. Check logs for: `prisma migrate deploy`

### Option 2: Manual (if needed)

If migrations didn't run:

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login:
   ```bash
   railway login
   ```

3. Link to project:
   ```bash
   railway link
   ```

4. Run migrations:
   ```bash
   railway run npm run prisma migrate deploy
   ```

### Option 3: Using Railway Dashboard

1. Go to backend service
2. Click **"Settings"**
3. Scroll to **"Custom Start Command"**
4. Temporarily set to: `npx prisma migrate deploy && npm run start:prod`
5. Save and redeploy

---

## 🌐 PART 8: CUSTOM DOMAINS (Optional - 5 minutes)

Want a custom domain like `chatbot.yourdomain.com`?

### Step 1: Add Custom Domain in Railway

1. Go to frontend service
2. Click **"Settings"**
3. Scroll to **"Domains"**
4. Click **"+ Custom Domain"**
5. Enter: `chatbot.yourdomain.com`
6. Railway shows DNS instructions

### Step 2: Update DNS

1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Add CNAME record:
   - Name: `chatbot`
   - Value: `frontend-production-xxxx.up.railway.app`
   - TTL: 300

3. Wait 5-30 minutes for DNS propagation
4. ✅ SSL certificate auto-generated!

---

## ✅ PART 9: VERIFICATION CHECKLIST

After deployment, verify everything works:

### Backend Checks:
- [ ] Backend URL opens (should show welcome message)
- [ ] `/health` endpoint responds
- [ ] Database connected (check logs, no connection errors)
- [ ] Environment variables loaded (check in Variables tab)

### Frontend Checks:
- [ ] Frontend URL opens (shows chatbot interface)
- [ ] No console errors (F12 developer tools)
- [ ] Can select language/start chat
- [ ] Messages send and receive

### Database Checks:
- [ ] PostgreSQL service running (check dashboard)
- [ ] Migrations applied (check backend logs)
- [ ] Can create users (test registration)

### Integration Checks:
- [ ] Frontend calls backend API (network tab)
- [ ] CORS working (no CORS errors)
- [ ] WebSocket connections work (agent chat)
- [ ] Admin dashboard accessible

---

## 🐛 TROUBLESHOOTING

### Issue: Backend won't start

**Solution:**
1. Check logs for errors
2. Verify `DATABASE_URL` is connected
3. Check Prisma migrations ran
4. Verify Node version compatibility

### Issue: Frontend shows blank page

**Solution:**
1. Check browser console for errors
2. Verify `VITE_API_URL` is correct
3. Check build logs for failures
4. Ensure `serve` package installed

### Issue: CORS errors

**Solution:**
1. Update `CORS_ORIGIN` in backend
2. Use exact frontend URL (with https://)
3. Restart backend service
4. Clear browser cache

### Issue: Database connection failed

**Solution:**
1. Verify `DATABASE_URL` format
2. Check PostgreSQL service is running
3. Ensure DATABASE_URL is linked, not copy-pasted
4. Check Railway database status

### Issue: Migrations not running

**Solution:**
1. Check `postinstall` script in package.json
2. Manually run migrations via Railway CLI
3. Check build logs for Prisma errors
4. Verify Prisma schema is valid

---

## 💰 COST TRACKING

### Monitor Your Usage:

1. Go to Railway dashboard
2. Click **"Usage"** tab
3. See real-time costs:
   - Frontend: ~$1.50/month
   - Backend: ~$3.50/month
   - PostgreSQL: ~$3.00/month

### Set Up Billing Alerts:

1. Go to **"Account Settings"**
2. Click **"Usage"**
3. Set alert threshold (e.g., $10)
4. Get email when approaching limit

---

## 🎯 WHAT'S NEXT?

### Immediate (After Deployment):

1. **Test thoroughly**:
   - All chatbot flows
   - Admin dashboard
   - Agent interface
   - Database persistence

2. **Seed your database**:
   ```bash
   railway run npm run seed:all
   ```

3. **Create admin account**:
   - Use admin registration endpoint
   - Or insert directly in database

### Short Term (This Week):

1. **Set up monitoring**:
   - Railway has built-in metrics
   - Check logs daily
   - Monitor response times

2. **Add custom domain** (optional):
   - Makes demos more professional
   - Follow Part 8 instructions

3. **Test auto-deploy**:
   - Make a small change
   - Push to GitHub
   - Verify auto-deployment works

### Long Term (This Month):

1. **Optimize costs**:
   - Monitor usage patterns
   - Adjust resource allocation
   - Consider caching strategies

2. **Set up backups**:
   - Railway has automatic backups
   - Export database periodically
   - Keep local backup of env vars

3. **Performance tuning**:
   - Monitor response times
   - Optimize slow queries
   - Add database indexes if needed

---

## 📞 SUPPORT RESOURCES

### Railway Resources:
- **Documentation**: https://docs.railway.app
- **Discord Community**: https://discord.gg/railway
- **Status Page**: https://status.railway.app
- **Templates**: https://railway.app/templates

### If You Get Stuck:

1. **Check Railway Logs**: Most issues show up in logs
2. **Discord Support**: Very active and helpful
3. **Documentation**: Comprehensive guides
4. **GitHub Issues**: Check Railway's GitHub

---

## 🎉 SUCCESS CHECKLIST

You're done when:

- ✅ Backend deployed and running
- ✅ Frontend deployed and accessible
- ✅ PostgreSQL database connected
- ✅ Migrations applied successfully
- ✅ Frontend can call backend API
- ✅ Chatbot works end-to-end
- ✅ Admin dashboard accessible
- ✅ Auto-deploy enabled
- ✅ Environment variables set
- ✅ No errors in logs

**Congratulations! Your chatbot is now live on Railway!** 🚀

---

## 📝 QUICK COMMAND REFERENCE

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Run command in Railway environment
railway run <command>

# Deploy manually (if needed)
railway up

# Open project in browser
railway open

# Check status
railway status

# Run migrations
railway run npx prisma migrate deploy

# Seed database
railway run npm run seed:all
```

---

**Current Cost**: ~$3 first month, ~$8/month after  
**Time to Deploy**: 45-60 minutes  
**Auto-Deploy**: ✅ Enabled via GitHub  
**Support**: Railway Discord (very responsive)

Good luck with your deployment! 🎉
