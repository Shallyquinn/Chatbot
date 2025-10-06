# 🚀 Deployment Progress Tracker

**Repository**: https://github.com/Shallyquinn/Chatbot
**Date**: October 6, 2025

## ✅ Completed Steps

- [x] Git repository initialized
- [x] Initial commit created (298 files)
- [x] Code pushed to GitHub successfully
- [x] Repository: https://github.com/Shallyquinn/Chatbot

---

## 🔄 Next Steps

### **STEP 1: Deploy Backend to Railway** (5-7 minutes)

#### 1.1 Create Railway Account & Project
1. Go to: https://railway.app
2. Click **"Start a New Project"** or **"Login with GitHub"**
3. Authorize Railway to access your GitHub account
4. Click **"New Project"**
5. Select **"Deploy from GitHub repo"**
6. Choose: **Shallyquinn/Chatbot**

#### 1.2 Configure Backend Service
1. After selecting the repo, Railway will ask which folder to deploy
2. **Root Directory**: Set to `server` (important!)
3. Click **"Deploy"**
4. Railway will automatically detect it's a Node.js/NestJS project

#### 1.3 Add PostgreSQL Database
1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"**
3. Choose **"PostgreSQL"**
4. Railway will automatically:
   - Create a PostgreSQL database
   - Add `DATABASE_URL` environment variable to your backend service
   - Link them together

#### 1.4 Add Environment Variables
Click on your backend service → **"Variables"** tab → Add these:

```bash
# Database (Already auto-added by Railway)
DATABASE_URL=${PostgreSQL.DATABASE_URL}

# JWT Secret (Change this!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2025

# Node Environment
NODE_ENV=production

# Port (Railway provides this)
PORT=${PORT}

# Frontend URL (Will update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app

# Optional: WhatsApp/Facebook (if you have them)
# WHATSAPP_TOKEN=your_token
# WHATSAPP_PHONE_NUMBER_ID=your_id
# FACEBOOK_PAGE_ACCESS_TOKEN=your_token
# FACEBOOK_PAGE_ID=your_id
```

**Important**: Replace `JWT_SECRET` with a strong random string!

#### 1.5 Verify Build Settings
Go to **"Settings"** tab:
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm run start:prod`
- **Root Directory**: `server`

#### 1.6 Trigger Deployment
1. Go to **"Deployments"** tab
2. Railway should automatically deploy
3. Wait 3-5 minutes for build to complete
4. Once deployed, you'll see a **green checkmark** ✅

#### 1.7 Get Your Backend URL
1. Go to **"Settings"** tab
2. Click **"Generate Domain"** under "Domains"
3. Copy your backend URL (e.g., `https://chatbot-production-xxxx.up.railway.app`)
4. **Save this URL** - you'll need it for Vercel!

#### 1.8 Run Database Migrations & Seed
1. In Railway dashboard, click on your backend service
2. Go to **"Deployments"** tab → Click latest deployment
3. At the bottom, find **"View Logs"**
4. Check logs for:
   - ✅ `Prisma schema loaded from prisma/schema.prisma`
   - ✅ `Database migrations applied`
   - ✅ `✓ Created default admin`
   - ✅ `✓ Created agent: Sarah Johnson`

If you don't see seed messages, manually run in Railway CLI:
```bash
npx prisma migrate deploy
npm run seed:auth
```

---

### **STEP 2: Deploy Frontend to Vercel** (3-5 minutes)

#### 2.1 Create Vercel Account & Project
1. Go to: https://vercel.com
2. Click **"Start Deploying"** or **"Sign Up with GitHub"**
3. Authorize Vercel to access your GitHub account
4. Click **"Add New..."** → **"Project"**
5. Find and select: **Shallyquinn/Chatbot**
6. Click **"Import"**

#### 2.2 Configure Frontend Build Settings
1. **Framework Preset**: Vite (should auto-detect)
2. **Root Directory**: Click **"Edit"** → Set to `honey`
3. **Build Command**: `npm install && npm run build`
4. **Output Directory**: `dist` (default for Vite)
5. **Install Command**: `npm install`

#### 2.3 Add Environment Variables
Click **"Environment Variables"** section → Add:

```bash
# Backend API URL (Use your Railway URL from Step 1.7)
VITE_API_URL=https://chatbot-production-xxxx.up.railway.app

# Optional: Supabase (if you're using it)
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_key
```

**Important**: Replace with your actual Railway backend URL!

#### 2.4 Deploy
1. Click **"Deploy"**
2. Vercel will build and deploy your frontend (1-3 minutes)
3. Wait for **"Visit"** button to appear ✅

#### 2.5 Get Your Frontend URL
1. Once deployed, you'll see your live URL (e.g., `https://chatbot-xxxx.vercel.app`)
2. Click **"Visit"** to open your app!
3. **Copy this URL** - you'll need to update Railway!

---

### **STEP 3: Connect Backend & Frontend** (2 minutes)

#### 3.1 Update Railway Backend Environment Variables
1. Go back to **Railway dashboard**
2. Click on your backend service
3. Go to **"Variables"** tab
4. Update **FRONTEND_URL** with your Vercel URL:
   ```bash
   FRONTEND_URL=https://chatbot-xxxx.vercel.app
   ```
5. Click **"Save"**
6. Railway will automatically redeploy with new variables

#### 3.2 Update CORS Settings (if needed)
The backend's `main.ts` already has CORS enabled for the `FRONTEND_URL` environment variable, so once Railway redeploys with the new URL, CORS should work automatically.

If you have issues, manually update `server/src/main.ts`:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
});
```

---

### **STEP 4: Test Your Deployment** (3 minutes)

#### 4.1 Test Frontend
1. Visit your Vercel URL: `https://chatbot-xxxx.vercel.app`
2. You should see the Honey Chatbot interface ✅

#### 4.2 Test Admin Login
1. Go to: `https://chatbot-xxxx.vercel.app/admin`
2. Login with:
   - **Email**: `admin@honeychatbot.com`
   - **Password**: `admin123`
3. You should see the Admin Dashboard ✅

#### 4.3 Test Agent Login
1. Go to: `https://chatbot-xxxx.vercel.app/agent`
2. Login with:
   - **Email**: `sarah@honeychatbot.com`
   - **Password**: `agent123`
3. You should see the Agent Interface ✅

#### 4.4 Test Chatbot Conversation
1. Go back to main page: `https://chatbot-xxxx.vercel.app`
2. Start a conversation with Honey
3. Try these flows:
   - Prevent pregnancy → Select a contraceptive method
   - Get pregnant → Fertility advice
   - Change FPM → Switch contraceptive methods
   - Find a clinic → Search by state and LGA
4. Verify all features work ✅

---

## 📝 Save Your URLs

### Production URLs
```
Frontend: https://chatbot-xxxx.vercel.app
Backend:  https://chatbot-production-xxxx.up.railway.app
Admin:    https://chatbot-xxxx.vercel.app/admin
Agent:    https://chatbot-xxxx.vercel.app/agent
```

### Login Credentials

**Admin Account:**
```
Email:    admin@honeychatbot.com
Password: admin123
```

**Agent Accounts:**
```
Email:    sarah@honeychatbot.com
Password: agent123

Email:    michael@honeychatbot.com
Password: agent123

Email:    aisha@honeychatbot.com
Password: agent123
```

---

## 🎯 Success Checklist

- [ ] Railway backend deployed and running
- [ ] PostgreSQL database created and migrations applied
- [ ] Admin and agent accounts seeded
- [ ] Vercel frontend deployed and running
- [ ] Frontend connects to backend successfully
- [ ] Admin login works
- [ ] Agent login works
- [ ] Chatbot conversations work
- [ ] All features functional (prevent pregnancy, get pregnant, change FPM, find clinic)
- [ ] CORS configured correctly
- [ ] No console errors in browser

---

## 🔧 Troubleshooting

### Backend Issues

**Problem: Build fails on Railway**
- Check logs: Click deployment → "View Logs"
- Common issues:
  - Missing `DATABASE_URL`: Add PostgreSQL service
  - Prisma generate fails: Check `prisma/schema.prisma`
  - Build command wrong: Should be `npm install && npx prisma generate && npm run build`

**Problem: Backend returns 500 errors**
- Check Railway logs: Service → Deployments → View Logs
- Look for errors like:
  - Database connection failed
  - Missing environment variables
  - Migration errors

**Problem: Seed script didn't run**
- Manually run in Railway:
  1. Service → "Deployments" tab
  2. Click on deployment → Find terminal/shell option
  3. Run: `npm run seed:auth`

### Frontend Issues

**Problem: Frontend shows "Network Error"**
- Check `VITE_API_URL` in Vercel:
  1. Project → Settings → Environment Variables
  2. Verify URL matches Railway backend URL
  3. Redeploy: Deployments → Click "..." → "Redeploy"

**Problem: CORS errors in browser console**
- Update Railway `FRONTEND_URL`:
  1. Backend service → Variables
  2. Set `FRONTEND_URL=https://your-vercel-url.vercel.app`
  3. Save (will auto-redeploy)

**Problem: Login returns 401 Unauthorized**
- Check backend logs for errors
- Verify database has admin/agent accounts:
  - Railway → PostgreSQL service → "Data" tab
  - Look for `Admin` and `Agent` tables

**Problem: Page shows blank/white screen**
- Check browser console for errors (F12)
- Common causes:
  - JavaScript errors
  - API URL incorrect
  - Build output directory wrong (should be `dist`)

### Database Issues

**Problem: Database connection fails**
- Railway auto-provides `DATABASE_URL`
- Check: Backend service → Variables → `DATABASE_URL` should reference PostgreSQL service
- Format: `postgresql://user:password@host:port/database`

**Problem: Tables don't exist**
- Run migrations manually:
  1. Railway → Backend service → Deployments
  2. Find terminal/shell
  3. Run: `npx prisma migrate deploy`

---

## 📊 Cost Estimate

### Railway (Backend + Database)
- **Free Tier**: $5 credit/month
- **Starter Plan**: $5/month (if you exceed free tier)
- **Includes**: 
  - Backend hosting
  - PostgreSQL database (500 MB)
  - Build minutes
  - Bandwidth

### Vercel (Frontend)
- **Hobby Plan**: $0/month (FREE forever)
- **Includes**:
  - Unlimited deployments
  - 100 GB bandwidth
  - Automatic HTTPS
  - Custom domains

**Total Cost**: $0 - $5/month

---

## 🎉 Deployment Complete!

Once all steps are done, you'll have:
- ✅ Production-ready chatbot at Vercel URL
- ✅ Scalable backend on Railway
- ✅ PostgreSQL database with admin/agent accounts
- ✅ Admin dashboard for monitoring
- ✅ Agent interface for live support
- ✅ Automatic deployments on git push

**Next Steps After Deployment:**
1. Change default passwords (admin123, agent123)
2. Set up custom domain (optional)
3. Add monitoring/analytics
4. Configure social media integrations (WhatsApp, Facebook)
5. Set up backups for database

---

**Need Help?** Check the troubleshooting section above or review:
- `DEPLOYMENT-GUIDE.md` - Full deployment documentation
- `QUICK-DEPLOY.md` - Quick reference checklist
- `DEPLOY-NOW.md` - Step-by-step walkthrough
