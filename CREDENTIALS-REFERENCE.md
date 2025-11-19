# 🎯 Quick Reference: Production Credentials

**⚠️ CONFIDENTIAL - DO NOT SHARE OR COMMIT TO GIT**

---

## 🔐 Security Secrets (Generated Nov 19, 2025)

```
JWT_SECRET=mk00W18VhxRT7X50DAMLtql1OPqkTeR4q9gniA1XAHI=
SESSION_SECRET=M/8ynL5MuPHFiq96T3nm3/tjl3L3f7qwrMV8hjjyWqE=
```

---

## 👤 Admin Login

**URL:** https://your-domain.com/admin/login

```
Email:    admin@honey-health.com
Password: HoneyAdmin2025!Secure#Change
```

⚠️ **CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN**

---

## 👥 Agent Login

**URL:** https://your-domain.com/agent/login

```
Email:    agent@honey-health.com
Password: HoneyAgent2025!Secure#Change
```

⚠️ **CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN**

---

## 🗄️ Database

```
Host:     localhost
Port:     5433
Database: chatbot_db
User:     chatbot_user
Password: Mirabel20.

Connection String:
postgresql://chatbot_user:Mirabel20.@localhost:5433/chatbot_db
```

---

## 🌐 Deployment URLs (Placeholder - Update After Deployment)

```
Frontend:  https://honey-chatbot.onrender.com
Backend:   https://honey-chatbot-api.onrender.com
WebSocket: wss://honey-chatbot-api.onrender.com
```

---

## 📧 Email Setup (Optional - Requires Configuration)

1. Go to: https://myaccount.google.com/apppasswords
2. Generate app password for Gmail: `honeyhealthchatbot@gmail.com`
3. Update `server/.env` with the 16-character password

---

## ✅ Configuration Files

- ✅ `Chatbot/honey/.env` - Frontend (production URLs)
- ✅ `Chatbot/server/.env` - Backend (all secrets configured)

---

## 🚀 Quick Deploy Commands

```bash
# 1. Test build
cd Chatbot/honey && npm run build
cd ../server && npm run build

# 2. Run migrations
cd Chatbot/server
npx prisma migrate deploy
npx prisma generate

# 3. Start production server
npm run start:prod

# 4. Check health
curl http://localhost:3000/health
```

---

**Generated:** November 19, 2025  
**Status:** ✅ All environment variables configured with production values
