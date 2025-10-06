# 🔐 Authentication Setup & Login Guide

## Quick Start - Login Credentials

After running the seed script, you can login with these credentials:

### 👑 **ADMIN LOGIN**

- **URL**: http://localhost:5173/admin/login
- **Email**: `admin@honeychatbot.com`
- **Password**: `admin123`

### 👥 **AGENT LOGIN**

- **URL**: http://localhost:5173/agent/login

**Available Agents:**

1. **Sarah Johnson**

   - Email: `sarah@honeychatbot.com`
   - Password: `agent123`
   - Status: ONLINE

2. **Michael Chen**

   - Email: `michael@honeychatbot.com`
   - Password: `agent123`
   - Status: ONLINE

3. **Aisha Ibrahim**
   - Email: `aisha@honeychatbot.com`
   - Password: `agent123`
   - Status: OFFLINE

---

## 🚀 Setup Instructions

### 1. **Seed the Database**

Run this command in the `server` directory:

```bash
cd server
npm run seed:auth
```

This will create:

- 1 Super Admin account
- 3 Agent accounts (2 online, 1 offline)

### 2. **Start the Backend Server**

```bash
cd server
npm run start:dev
```

Server runs on: `http://localhost:3000`

### 3. **Start the Frontend**

```bash
cd honey
npm run dev
```

Frontend runs on: `http://localhost:5173`

### 4. **Access the Interfaces**

**Admin Dashboard:**

- Go to: http://localhost:5173/admin/login
- Login with admin credentials
- You'll be redirected to: http://localhost:5173/admin/dashboard

**Agent Interface:**

- Go to: http://localhost:5173/agent/login
- Login with any agent credentials
- You'll be redirected to: http://localhost:5173/agent/dashboard

---

## 🛠️ Troubleshooting

### "Invalid Credentials" Error

**Problem**: You're getting "Invalid credentials" when trying to login.

**Solutions**:

1. **Make sure database is seeded:**

   ```bash
   cd server
   npm run seed:auth
   ```

2. **Check if backend is running:**

   - Backend should be running on `http://localhost:3000`
   - Test it: `curl http://localhost:3000`

3. **Verify database connection:**

   - Check your `.env` file has correct `DATABASE_URL`
   - Run migrations: `npx prisma migrate dev`

4. **Reset everything (if needed):**
   ```bash
   # In server directory
   npx prisma migrate reset
   npx prisma migrate dev
   npm run seed:auth
   ```

### Backend Not Responding

**Check:**

1. Is the server running? `npm run start:dev`
2. Is PostgreSQL running?
3. Check terminal for errors

### Frontend Can't Connect

**Check:**

1. Is frontend running? `npm run dev`
2. Check `honey/.env` has: `VITE_API_URL=http://localhost:3000`
3. Check browser console for CORS errors

---

## 🎯 What You Can Do After Login

### **Admin Dashboard** Features:

- ✅ View real-time metrics (total users, active users, satisfaction)
- ✅ Monitor chatbot performance (resolved/escalated conversations)
- ✅ Manage agents (view status, assign conversations)
- ✅ View conversation queue
- ✅ Bulk assign conversations to agents
- ✅ Configure system settings

### **Agent Interface** Features:

- ✅ View assigned conversations
- ✅ Chat with users in real-time
- ✅ See user information and context
- ✅ Transfer conversations to other agents
- ✅ Pause/Resume conversations
- ✅ Mark conversations as complete
- ✅ View conversation history

---

## 📝 API Endpoints

### Authentication

- `POST /auth/admin/login` - Admin login
- `POST /auth/agent/login` - Agent login
- `GET /auth/setup` - Create default admin (one-time setup)

### Admin APIs

- `GET /admin/metrics` - Dashboard metrics
- `GET /admin/agents` - List all agents
- `GET /admin/conversations/queue` - Conversation queue
- `POST /admin/conversations/bulk-assign` - Bulk assign conversations
- `POST /admin/agents` - Create new agent
- `PUT /admin/agents/:id` - Update agent
- `DELETE /admin/agents/:id` - Delete agent

### Agent APIs

- `GET /agent/:id/dashboard` - Agent dashboard stats
- `GET /agent/:id/conversations` - Assigned conversations
- `GET /agent/:id/queue` - Queued conversations
- `POST /agent/messages` - Send message to user
- `PUT /agent/conversations/:id/status` - Update conversation status

---

## 🔒 Security Notes

### **Production Checklist**:

1. ❌ **DO NOT** use default passwords in production
2. ❌ **DO NOT** commit `.env` files
3. ✅ Change all default credentials
4. ✅ Use strong JWT secret (not the default)
5. ✅ Enable HTTPS
6. ✅ Set up proper CORS policies
7. ✅ Use environment variables for all secrets

### **Change Default Passwords**:

```typescript
// In server/src/auth/auth.service.ts
// Update createDefaultAdmin() method with your own credentials
```

---

## 🎨 Interface Screenshots

### Admin Dashboard Includes:

- 📊 4 Key metric cards (Users, Active, Satisfied, Response Time)
- 📈 Line chart for new users
- 📊 Bar chart for recurring users
- 🥧 Pie chart for chatbot performance
- 📉 Line chart for daily engagement
- 👥 Agent management cards
- 📋 Conversation queue management
- ⚙️ Configuration management

### Agent Interface Includes:

- 💬 Conversation sidebar with search
- 🗨️ Real-time chat interface
- 👤 User information panel
- 🔔 Unread message indicators
- ⏰ Wait time tracking
- 🎯 Quick actions and shortcuts
- 📎 File attachment support
- 😊 Emoji picker
- 🎤 Voice message support

---

## 🆘 Need Help?

If you're still having issues:

1. **Check the terminal logs** for both frontend and backend
2. **Check browser console** (F12) for errors
3. **Verify all services are running**:

   - PostgreSQL database
   - Backend server (port 3000)
   - Frontend server (port 5173)

4. **Run full reset**:

   ```bash
   # Server
   cd server
   npx prisma migrate reset -f
   npx prisma migrate dev
   npm run seed:all
   npm run start:dev

   # Frontend (new terminal)
   cd honey
   npm run dev
   ```

---

## ✅ Success Indicators

You know everything is working when:

- ✅ No errors in backend terminal
- ✅ No errors in frontend terminal
- ✅ Can access http://localhost:5173
- ✅ Can access http://localhost:3000
- ✅ Can login to admin dashboard
- ✅ Can login to agent interface
- ✅ Can see metrics on admin dashboard
- ✅ Can see conversations on agent interface

---

## 🎉 You're All Set!

Both the **Admin Dashboard** and **Agent Interface** are fully functional and ready to use!

**Next Steps:**

1. Login and explore the interfaces
2. Create additional agents if needed
3. Test the conversation flow
4. Customize the branding/styling
5. Deploy to production when ready
