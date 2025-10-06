# 🚀 Complete Deployment Guide - Honey Chatbot

## 📋 Deployment Options

We'll deploy using the best platforms for each component:

1. **Backend (NestJS)**: Railway / Render / Heroku
2. **Frontend (React)**: Vercel / Netlify
3. **Database**: Railway PostgreSQL / Supabase / Neon

---

## 🎯 Quick Deployment (Recommended)

### **Option 1: Railway (Easiest - All in One)**

Railway is recommended because:

- ✅ Free PostgreSQL database included
- ✅ Easy NestJS deployment
- ✅ Automatic SSL certificates
- ✅ Environment variables management
- ✅ GitHub integration
- ✅ Great for both frontend and backend

### **Option 2: Vercel (Frontend) + Railway (Backend)**

Best for performance:

- ✅ Vercel for lightning-fast frontend
- ✅ Railway for reliable backend
- ✅ Automatic scaling

---

## 🚂 Railway Deployment (Full Stack)

### **Step 1: Setup Railway Account**

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"

### **Step 2: Deploy Backend**

#### A. Create Backend Service

1. **In Railway Dashboard:**

   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `server` folder

2. **Add PostgreSQL Database:**

   - Click "+ New"
   - Select "Database"
   - Choose "PostgreSQL"
   - Railway will automatically create and connect it

3. **Configure Environment Variables:**

Click on your backend service → Variables → Add these:

```bash
# Database (Auto-populated by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_JWT_SECRET=your-admin-jwt-secret-change-this
AGENT_JWT_SECRET=your-agent-jwt-secret-change-this

# Server
NODE_ENV=production
PORT=3000

# Frontend URL (Update after deploying frontend)
FRONTEND_URL=https://your-app.vercel.app

# Admin Setup
ADMIN_EMAIL=admin@honeychatbot.com
ADMIN_PASSWORD=ChangeThisPassword123!
ADMIN_NAME=Honey Admin

# AI Service
AI_SERVICE_URL=https://firsthand-composed-piracy-honeyandbananac.replit.app
```

4. **Configure Build & Start Commands:**

In Railway Settings:

- **Root Directory**: `server`
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm run start:prod`

5. **Add Deployment Scripts:**

Railway will use these from `package.json`:

```json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main"
  }
}
```

6. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Copy your backend URL (e.g., `https://your-app.up.railway.app`)

#### B. Run Database Migrations

After first deployment, go to Railway dashboard:

1. Click on your backend service
2. Go to "Deploy" tab
3. Click "..." menu → "Open Terminal"
4. Run:

```bash
npx prisma migrate deploy
npx ts-node prisma/seed-auth.ts
```

Or use Railway CLI:

```bash
railway link
railway run npx prisma migrate deploy
railway run npm run seed:auth
```

### **Step 3: Deploy Frontend**

#### Option A: Deploy on Vercel (Recommended)

1. **Prepare Vercel Configuration:**

File: `honey/vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "env": {
    "VITE_API_URL": "https://your-backend.up.railway.app"
  }
}
```

2. **Deploy to Vercel:**

   - Go to https://vercel.com
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - **Root Directory**: `honey`
   - **Framework Preset**: Vite
   - **Environment Variables**:
     ```
     VITE_API_URL=https://your-backend.up.railway.app
     ```
   - Click "Deploy"

3. **Update Backend CORS:**

After deployment, update Railway backend env:

```bash
FRONTEND_URL=https://your-app.vercel.app
```

#### Option B: Deploy Frontend on Railway Too

1. **Create New Service in Railway:**

   - Click "+ New"
   - Select "GitHub Repo"
   - Choose your repo
   - Select `honey` folder

2. **Configure:**

   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve dist -p $PORT`

3. **Add Environment Variables:**

   ```bash
   VITE_API_URL=https://your-backend.up.railway.app
   ```

4. **Add `serve` to package.json:**
   ```bash
   cd honey
   npm install --save-dev serve
   ```

---

## 🌐 Alternative: Render Deployment

### **Backend on Render**

1. Go to https://render.com
2. Sign up and connect GitHub
3. Click "New" → "Web Service"
4. Select your repository
5. Configure:

   ```
   Name: honey-chatbot-api
   Root Directory: server
   Environment: Node
   Build Command: npm install && npx prisma generate && npm run build
   Start Command: npm run start:prod
   ```

6. Add Environment Variables (same as Railway)

7. Add PostgreSQL:
   - Dashboard → "New" → "PostgreSQL"
   - Copy DATABASE_URL to your web service

### **Frontend on Netlify**

1. Go to https://netlify.com
2. Sign up and connect GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your repository
5. Configure:

   ```
   Base directory: honey
   Build command: npm run build
   Publish directory: honey/dist
   ```

6. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

---

## 📦 Environment Variables Summary

### **Backend Environment Variables**

**Required:**

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-secret-key
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-url.com
```

**Optional but Recommended:**

```bash
ADMIN_JWT_SECRET=different-secret-key
AGENT_JWT_SECRET=another-secret-key
ADMIN_EMAIL=admin@honeychatbot.com
ADMIN_PASSWORD=SecurePassword123!
AI_SERVICE_URL=https://your-ai-service.com
```

### **Frontend Environment Variables**

**Required:**

```bash
VITE_API_URL=https://your-backend-url.com
```

**Optional:**

```bash
VITE_WS_URL=wss://your-backend-url.com
```

---

## 🔒 Security Checklist

Before deploying to production:

### **1. Change All Default Passwords**

```bash
# Backend .env
ADMIN_PASSWORD=YourSecurePassword123!
AGENT_PASSWORD=AnotherSecurePassword456!
```

### **2. Generate Strong JWT Secrets**

```bash
# Use this command to generate random secrets:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output to:

```bash
JWT_SECRET=<generated-secret-1>
ADMIN_JWT_SECRET=<generated-secret-2>
AGENT_JWT_SECRET=<generated-secret-3>
```

### **3. Update CORS Settings**

In `server/src/main.ts`, update:

```typescript
app.enableCors({
  origin: [
    "https://your-frontend.vercel.app",
    "https://your-frontend.netlify.app",
  ],
  credentials: true,
});
```

### **4. Enable HTTPS Only**

Frontend `.env`:

```bash
VITE_API_URL=https://your-backend.com  # Use HTTPS, not HTTP
```

### **5. Database Security**

- ✅ Use strong database password
- ✅ Enable SSL for database connection
- ✅ Restrict database access to your backend IP

---

## 🗄️ Database Setup

### **Option 1: Railway PostgreSQL (Easiest)**

Already included when you add PostgreSQL to your Railway project!

```bash
# Railway automatically provides:
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### **Option 2: Supabase (Free Tier)**

1. Go to https://supabase.com
2. Create new project
3. Wait for database to be ready
4. Copy connection string:
   ```
   Settings → Database → Connection string → URI
   ```
5. Add to backend env:
   ```bash
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

### **Option 3: Neon (Serverless)**

1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Add to backend env

---

## 🚀 Deployment Steps Summary

### **Quick Deploy Checklist:**

#### **Backend:**

- [ ] Push code to GitHub
- [ ] Create Railway project
- [ ] Add PostgreSQL database
- [ ] Configure environment variables
- [ ] Deploy backend
- [ ] Run migrations
- [ ] Seed admin/agent accounts
- [ ] Copy backend URL

#### **Frontend:**

- [ ] Update VITE_API_URL with backend URL
- [ ] Push changes to GitHub
- [ ] Create Vercel project
- [ ] Configure build settings
- [ ] Deploy frontend
- [ ] Copy frontend URL

#### **Finalize:**

- [ ] Update backend FRONTEND_URL with frontend URL
- [ ] Update CORS settings in main.ts
- [ ] Redeploy backend
- [ ] Test login at https://your-app.vercel.app/admin/login
- [ ] Verify all features work

---

## 🧪 Testing Deployed App

### **1. Test Backend Health**

```bash
curl https://your-backend.up.railway.app
# Should return: {"statusCode":404,"message":"Cannot GET /"}
# This is normal - means backend is running

curl https://your-backend.up.railway.app/auth/setup
# Should return admin data
```

### **2. Test Admin Login**

1. Go to: `https://your-app.vercel.app/admin/login`
2. Enter credentials:
   - Email: `admin@honeychatbot.com`
   - Password: Your configured password
3. Should redirect to dashboard

### **3. Test Agent Login**

1. Go to: `https://your-app.vercel.app/agent/login`
2. Use agent credentials
3. Should see agent interface

### **4. Test Main Chatbot**

1. Go to: `https://your-app.vercel.app`
2. Start a conversation
3. Verify all features work

---

## 🐛 Troubleshooting

### **Issue: "Cannot connect to backend"**

**Solution:**

1. Check VITE_API_URL is correct
2. Verify backend is deployed and running
3. Check CORS settings in backend
4. Ensure using HTTPS (not HTTP)

### **Issue: "Invalid credentials"**

**Solution:**

1. Run seed script on Railway:
   ```bash
   railway run npm run seed:auth
   ```
2. Or use Railway dashboard terminal

### **Issue: "Database connection failed"**

**Solution:**

1. Verify DATABASE_URL is correct
2. Run migrations:
   ```bash
   railway run npx prisma migrate deploy
   ```
3. Check database is running in Railway

### **Issue: "Build failed"**

**Solution:**

1. Check build logs
2. Verify package.json scripts
3. Make sure all dependencies are in package.json (not devDependencies)
4. Try local build first: `npm run build`

---

## 📊 Post-Deployment Monitoring

### **Monitor Backend Health**

Railway provides:

- ✅ CPU and Memory usage
- ✅ Request logs
- ✅ Error tracking
- ✅ Deployment history

### **Monitor Frontend Performance**

Vercel provides:

- ✅ Analytics
- ✅ Web Vitals
- ✅ Error tracking
- ✅ Deployment previews

---

## 🔄 Continuous Deployment

### **Auto-Deploy on Git Push**

Both Railway and Vercel support auto-deployment:

1. **Connect GitHub Repository**
2. **Enable Auto-Deploy**
3. **Every push to main branch = New deployment**

### **Deployment Workflow:**

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Railway & Vercel automatically:
# 1. Detect push
# 2. Run builds
# 3. Deploy to production
# 4. Update live site
```

---

## 💰 Cost Estimates

### **Free Tier Options:**

| Service      | Free Tier       | Limits                 |
| ------------ | --------------- | ---------------------- |
| **Railway**  | $5 credit/month | 500MB RAM, 1GB storage |
| **Vercel**   | Free forever    | 100GB bandwidth        |
| **Netlify**  | Free forever    | 100GB bandwidth        |
| **Supabase** | Free forever    | 500MB database         |
| **Neon**     | Free forever    | 3GB storage            |

**Total Cost: $0/month** for small-medium traffic! 🎉

### **Scaling (Paid Plans):**

When you need more:

- **Railway**: $5/month per service
- **Vercel Pro**: $20/month
- **Supabase Pro**: $25/month

---

## 🎉 Deployment Complete!

After following this guide, you'll have:

✅ **Backend deployed** on Railway/Render
✅ **Frontend deployed** on Vercel/Netlify  
✅ **Database running** on Railway/Supabase
✅ **SSL certificates** (HTTPS) automatic
✅ **Admin dashboard** accessible
✅ **Agent interface** accessible
✅ **Main chatbot** working
✅ **Continuous deployment** setup

---

## 📞 Support URLs

After deployment, bookmark these:

- **Main App**: `https://your-app.vercel.app`
- **Admin Login**: `https://your-app.vercel.app/admin/login`
- **Agent Login**: `https://your-app.vercel.app/agent/login`
- **API Docs**: `https://your-backend.up.railway.app/api`
- **Backend Health**: `https://your-backend.up.railway.app`

---

## 🚀 Next Steps

1. **Custom Domain** (Optional):

   - Add your domain in Vercel/Railway
   - Update DNS records
   - SSL automatic!

2. **Monitoring**:

   - Set up error tracking (Sentry)
   - Add analytics (Google Analytics)
   - Monitor performance

3. **Backups**:

   - Railway auto-backups database
   - Export critical data regularly

4. **Scale**:
   - Upgrade when needed
   - Add more agents
   - Optimize performance

---

## 🎊 You're Live!

**Congratulations! Your chatbot is now deployed and accessible worldwide!** 🌍

Share your link and start helping users! 🚀
