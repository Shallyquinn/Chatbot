# 🚀 QUICK DEPLOYMENT GUIDE

**Your GitHub Repository**: <https://github.com/Shallyquinn/Chatbot>

---

## 🎯 Deploy Backend to Railway (5 minutes)

### Step 1: Go to Railway

<https://railway.app> → Sign up with GitHub

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **"Shallyquinn/Chatbot"**
4. Set **Root Directory** to: `server`

### Step 3: Add PostgreSQL Database

1. Click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway auto-connects it ✅

### Step 4: Add Environment Variables

Click backend service → **"Variables"** tab:

```bash
NODE_ENV=production
JWT_SECRET=honey-chatbot-super-secret-jwt-key-2025-production-change-me
FRONTEND_URL=https://your-app.vercel.app
```

*(Update FRONTEND_URL after Vercel deployment)*

### Step 5: Generate Domain

Settings → Domains → **"Generate Domain"**

**Copy this URL** → You'll need it for Vercel! Example: `https://chatbot-production-abc123.up.railway.app`

---

## 🎯 Deploy Frontend to Vercel (3 minutes)

### Step 1: Go to Vercel

<https://vercel.com> → Sign up with GitHub

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Select **"Shallyquinn/Chatbot"**
3. Click **"Import"**

### Step 3: Configure Settings

- **Framework**: Vite (auto-detected)
- **Root Directory**: `honey`
- **Build Command**: `npm install && npm run build`
- **Output Directory**: `dist`

### Step 4: Add Environment Variable

```bash
VITE_API_URL=https://chatbot-production-abc123.up.railway.app
```

*(Use your Railway URL from above)*

### Step 5: Deploy

Click **"Deploy"** → Wait 2-3 minutes → **Done!** ✅

**Copy your Vercel URL**: `https://chatbot-xyz.vercel.app`

---

## 🔗 Connect Backend & Frontend (1 minute)

### Update Railway with Vercel URL

1. Go back to **Railway** → Your backend service
2. Variables → Update **FRONTEND_URL**:

   ```bash
   FRONTEND_URL=https://chatbot-xyz.vercel.app
   ```

3. Save → Railway auto-redeploys ✅

---

## ✅ Test Your Deployment

### 1. Test Main Chatbot

Visit: `https://chatbot-xyz.vercel.app`

Start conversation with Honey ✅

### 2. Test Admin Login

Visit: `https://chatbot-xyz.vercel.app/admin`

```text
Email: admin@honeychatbot.com
Password: admin123
```

### 3. Test Agent Login

Visit: `https://chatbot-xyz.vercel.app/agent`

```text
Email: sarah@honeychatbot.com
Password: agent123
```

---

## 📝 Your Production URLs

```text
Frontend:  https://chatbot-xyz.vercel.app
Backend:   https://chatbot-production-abc123.up.railway.app
Admin:     https://chatbot-xyz.vercel.app/admin
Agent:     https://chatbot-xyz.vercel.app/agent
```

---

## 🎉 DONE!

**Total Time**: 10 minutes

**Cost**: $0/month (free tiers)

---

## 🔧 Common Issues

### "Network Error" in frontend

- Check `VITE_API_URL` in Vercel → Environment Variables
- Should match your Railway backend URL

### "CORS Error"

- Update `FRONTEND_URL` in Railway → Variables
- Should match your Vercel frontend URL

### Login not working

- Check Railway logs for seed script output
- Should see: "✓ Created default admin"

---

## 📚 More Documentation

- `DEPLOYMENT-PROGRESS.md` - Detailed step-by-step guide
- `DEPLOYMENT-GUIDE.md` - Complete deployment documentation
- `LOGIN-GUIDE.md` - Authentication setup and credentials
- `QUICK-START.md` - Using the deployed app

---

**Ready to deploy?** Start with Railway! 🚀
