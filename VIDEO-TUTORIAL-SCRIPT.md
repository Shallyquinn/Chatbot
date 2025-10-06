# 🎬 Video Tutorial Script - Deploy Honey Chatbot

## **Introduction (30 seconds)**

"Hi! In this video, I'll show you how to deploy the Honey Chatbot - a full-stack family planning assistant with admin dashboard and agent interface. We'll use Railway for the backend and Vercel for the frontend. Total time: about 5 minutes!"

---

## **Part 1: Backend Deployment on Railway (2 minutes)**

### **[Screen: Railway.app]**

1. "First, go to Railway.app and sign up with your GitHub account"
2. "Click 'New Project' → 'Deploy from GitHub repo'"
3. "Select your chatbot repository"
4. "Important: Set the root directory to 'server'"

### **[Screen: Add Database]**

5. "Now click the '+' button → 'Database' → 'PostgreSQL'"
6. "Railway automatically connects it to your backend"

### **[Screen: Environment Variables]**

7. "Click on your backend service → 'Variables' → Add these:"
   - Show adding JWT_SECRET
   - Show adding NODE_ENV=production
   - Show adding FRONTEND_URL (temp value)

### **[Screen: Build Settings]**

8. "Go to Settings → Configure:"
   - Root Directory: server
   - Build Command: npm install && npx prisma generate && npm run build
   - Start Command: npm run start:prod

### **[Screen: Deploy]**

9. "Click 'Deploy' and wait about 2 minutes"
10. "Once deployed, open the terminal and run:"
    ```
    npx prisma migrate deploy
    npm run seed:auth
    ```
11. "Copy your backend URL from the top - you'll need this!"

**"Backend is now live! ✅"**

---

## **Part 2: Frontend Deployment on Vercel (2 minutes)**

### **[Screen: Vercel.com]**

1. "Now go to Vercel.com and sign up with GitHub"
2. "Click 'New Project' → Import your repository"

### **[Screen: Configure Project]**

3. "Important settings:"
   - Root Directory: honey
   - Framework Preset: Vite (auto-detected)
   - Build Command: npm run build
   - Output Directory: dist

### **[Screen: Environment Variables]**

4. "Add one environment variable:"
   - Name: VITE_API_URL
   - Value: [paste your Railway backend URL]

### **[Screen: Deploy]**

5. "Click 'Deploy' - this takes about 1 minute"
6. "Copy your Vercel URL when it's done"

**"Frontend is now live! ✅"**

---

## **Part 3: Connect Backend & Frontend (1 minute)**

### **[Screen: Back to Railway]**

1. "Go back to Railway → Your backend service"
2. "Variables → Edit FRONTEND_URL"
3. "Paste your Vercel URL"
4. "Click 'Redeploy'"

### **[Screen: Code Editor]**

5. "Quick code update - open server/src/main.ts"
6. "Update the CORS origin to your Vercel URL"
7. "Push to GitHub - Railway auto-deploys"

**"Everything is connected! ✅"**

---

## **Part 4: Testing & Demo (1 minute)**

### **[Screen: Browser - Main Chatbot]**

1. "Let's test it! Go to your Vercel URL"
2. "The main chatbot loads - let's have a quick conversation"
3. [Demo: Ask about family planning]

### **[Screen: Admin Login]**

4. "Now go to /admin/login"
5. "Login with:"
   - Email: admin@honeychatbot.com
   - Password: admin123
6. [Show dashboard with metrics and charts]
7. "Beautiful admin dashboard with real-time metrics!"

### **[Screen: Agent Interface]**

8. "Go to /agent/login"
9. "Login with:"
   - Email: sarah@honeychatbot.com
   - Password: agent123
10. [Show WhatsApp-style chat interface]
11. "Professional agent interface ready for customer support!"

**"Everything works perfectly! 🎉"**

---

## **Conclusion (30 seconds)**

"And we're done! In just 5 minutes, we deployed:

- ✅ A full NestJS backend with PostgreSQL
- ✅ A beautiful React chatbot interface
- ✅ An admin dashboard for management
- ✅ An agent interface for customer support
- ✅ All with HTTPS and automatic SSL certificates

The links to Railway, Vercel, and the full deployment guide are in the description below. Thanks for watching!"

---

## **Video Description**

Deploy Honey Chatbot - Full Stack Family Planning Assistant

🚀 **What You'll Deploy:**

- NestJS Backend API with JWT Authentication
- React + TypeScript Chatbot with React-Chatbot-Kit
- Admin Dashboard (Management Portal)
- Agent Interface (Customer Support)
- PostgreSQL Database
- Real-time Chat System

⏱️ **Deployment Time:** 5 minutes

🔗 **Links:**

- GitHub Repo: [Your Repo URL]
- Railway: https://railway.app
- Vercel: https://vercel.com
- Full Deployment Guide: [Link to DEPLOYMENT-GUIDE.md]

📝 **Technologies:**

- Backend: NestJS, Prisma, PostgreSQL, JWT
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Deployment: Railway (Backend), Vercel (Frontend)

🎯 **Features:**

- Conversational AI Chatbot
- User Demographics Collection
- Family Planning Method Recommendations
- Clinic Location Search
- Admin Dashboard with Analytics
- Agent Interface for Human Support
- WhatsApp-Style Chat UI
- Real-time Conversation Tracking

💰 **Cost:** FREE (using free tiers of Railway and Vercel)

🔒 **Includes:**

- JWT Authentication
- Role-based Access Control
- HTTPS/SSL (Automatic)
- Environment Variables Management
- Database Migrations
- Seed Data Scripts

📚 **Documentation Included:**

- Complete Deployment Guide
- Quick Deploy Commands
- Troubleshooting Guide
- Security Checklist
- API Documentation

👨‍💻 **Perfect for:**

- Developers learning full-stack deployment
- Health tech projects
- Chatbot applications
- Admin/Agent systems
- Customer support platforms

⭐ Don't forget to star the repo!

#webdevelopment #nestjs #react #deployment #chatbot #fullstack #railway #vercel #typescript
