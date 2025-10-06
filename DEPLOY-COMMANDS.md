# 🚀 Quick Deploy Commands

## Railway Deployment

### Deploy Backend

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Initialize project
cd server
railway init

# 4. Link to Railway project
railway link

# 5. Add PostgreSQL
railway add

# 6. Set environment variables
railway variables set JWT_SECRET="your-secret-key-here"
railway variables set NODE_ENV="production"
railway variables set FRONTEND_URL="https://your-app.vercel.app"

# 7. Deploy
railway up

# 8. Run migrations
railway run npx prisma migrate deploy
railway run npm run seed:auth
```

### Deploy Frontend on Railway

```bash
cd honey
railway init
railway link

# Set environment variables
railway variables set VITE_API_URL="https://your-backend.up.railway.app"

# Deploy
railway up
```

---

## Vercel Deployment (Frontend)

### Quick Deploy

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy frontend
cd honey
vercel

# Follow prompts:
# - Setup and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? honey-chatbot
# - Directory? ./
# - Override settings? No

# 4. Set environment variables
vercel env add VITE_API_URL production
# Enter: https://your-backend.up.railway.app

# 5. Deploy to production
vercel --prod
```

---

## Render Deployment

### Backend on Render

```bash
# 1. Connect GitHub repo at render.com

# 2. Create new Web Service with these settings:
Name: honey-chatbot-api
Root Directory: server
Environment: Node
Build Command: npm install && npx prisma generate && npm run build
Start Command: npm run start:prod

# 3. Add environment variables in Render dashboard
```

### Frontend on Render

```bash
# 1. Create new Static Site

# 2. Settings:
Build Command: npm install && npm run build
Publish Directory: dist
Root Directory: honey

# 3. Add environment variable:
VITE_API_URL=https://your-backend.onrender.com
```

---

## Netlify Deployment (Frontend)

### Quick Deploy

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
cd honey
netlify deploy

# 4. Deploy to production
netlify deploy --prod
```

---

## Environment Variables Quick Copy

### Backend (.env)

```bash
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
ADMIN_JWT_SECRET=your-admin-jwt-secret
AGENT_JWT_SECRET=your-agent-jwt-secret
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-url.com
ADMIN_EMAIL=admin@honeychatbot.com
ADMIN_PASSWORD=YourSecurePassword123!
AI_SERVICE_URL=https://firsthand-composed-piracy-honeyandbananac.replit.app
```

### Frontend (.env)

```bash
VITE_API_URL=https://your-backend-url.com
```

---

## Database Setup

### Railway PostgreSQL

```bash
# In Railway dashboard:
# 1. Click "+ New"
# 2. Select "Database" → "PostgreSQL"
# 3. Copy DATABASE_URL from Variables tab
# 4. Add to backend service variables
```

### Run Migrations

```bash
# Railway
railway run npx prisma migrate deploy
railway run npm run seed:auth

# Or in Railway dashboard terminal:
npx prisma migrate deploy
npm run seed:auth
```

---

## Verify Deployment

### Check Backend

```bash
curl https://your-backend.up.railway.app
curl https://your-backend.up.railway.app/auth/setup
```

### Check Frontend

```bash
# Open in browser:
https://your-app.vercel.app
https://your-app.vercel.app/admin/login
https://your-app.vercel.app/agent/login
```

---

## Update CORS After Deployment

### In server/src/main.ts

```typescript
app.enableCors({
  origin: ["https://your-app.vercel.app", "https://www.your-app.vercel.app"],
  credentials: true,
});
```

Then redeploy backend.

---

## Rollback if Needed

### Railway

```bash
railway rollback
```

### Vercel

```bash
vercel rollback
```

---

## Monitor Deployments

### Railway

```bash
railway logs
```

### Vercel

```bash
vercel logs
```

---

## Custom Domain Setup

### Vercel

```bash
# In Vercel dashboard:
# Settings → Domains → Add Domain
# Follow DNS instructions
```

### Railway

```bash
# In Railway dashboard:
# Settings → Domains → Custom Domain
# Add CNAME record to your DNS
```

---

## Production Checklist

- [ ] Backend deployed on Railway/Render
- [ ] Frontend deployed on Vercel/Netlify
- [ ] PostgreSQL database created
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Admin/agent accounts seeded
- [ ] CORS updated with frontend URL
- [ ] HTTPS enabled (automatic)
- [ ] Custom domain added (optional)
- [ ] Tested login functionality
- [ ] Tested chatbot conversation
- [ ] Monitoring enabled

---

## Troubleshooting

### Build Fails

```bash
# Check build logs
railway logs
# or
vercel logs

# Common fixes:
# 1. Check package.json scripts
# 2. Verify all dependencies listed
# 3. Test local build: npm run build
```

### Database Connection Error

```bash
# Verify DATABASE_URL is set
railway variables

# Test connection
railway run npx prisma migrate status
```

### CORS Error

```bash
# Update main.ts with correct frontend URL
# Redeploy backend
railway up
```

---

## Cost Monitoring

### Railway

- Free tier: $5 credit/month
- Check usage: railway usage

### Vercel

- Free tier: 100GB bandwidth
- Check usage in dashboard

---

## Need Help?

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Netlify Docs: https://docs.netlify.com
