# 🚀 Complete Setup Guide for Honey Chatbot Admin/Agent System

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Git installed

## 1. 📦 Install Dependencies

### Frontend Dependencies

```bash
cd honey
npm install axios react-router-dom @types/axios
npm install socket.io-client @types/socket.io-client  # Optional: for real-time features
```

### Backend Dependencies (if not already installed)

```bash
cd server
npm install @nestjs/jwt @nestjs/websockets @nestjs/platform-socket.io
npm install bcrypt @types/bcrypt
npm install socket.io
```

## 2. 🔧 Environment Setup

### Frontend (.env in honey/)

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:8080
```

### Backend (.env in server/)

```env
DATABASE_URL=postgresql://username:password@localhost:5432/honey_chatbot
JWT_SECRET=your-super-secure-jwt-secret-change-in-production
ADMIN_JWT_SECRET=your-admin-jwt-secret-change-in-production
AGENT_JWT_SECRET=your-agent-jwt-secret-change-in-production
DEFAULT_ADMIN_EMAIL=admin@honeychatbot.com
DEFAULT_ADMIN_PASSWORD=admin123
```

## 3. 🗄️ Database Setup

1. **Run Prisma migrations** (if there are new tables):

```bash
cd server
npx prisma migrate dev
npx prisma generate
```

2. **Seed default admin** (optional):

```bash
cd server
npm run start:dev  # This will create the default admin on startup
```

## 4. 🎯 Update Your App.tsx

Replace your current `App.tsx` with the new routing version:

```bash
# Backup your current App.tsx
mv src/App.tsx src/App-backup.tsx

# Rename the new version
mv src/App-NEW.tsx src/App.tsx
```

## 5. ▶️ Start the Applications

### Start Backend (Terminal 1):

```bash
cd server
npm run start:dev
```

### Start Frontend (Terminal 2):

```bash
cd honey
npm run dev
```

## 6. 🔐 Access the System

### Default Routes:

- **Main Chatbot**: http://localhost:5173/
- **Admin Login**: http://localhost:5173/admin/login
- **Agent Login**: http://localhost:5173/agent/login

### Default Credentials:

- **Admin**: admin@honeychatbot.com / admin123
- **Agent**: Create through admin panel

## 7. ✅ Verification Checklist

### Backend API Endpoints:

- ✅ `GET /admin/metrics` - Dashboard metrics
- ✅ `GET /admin/agents` - List agents
- ✅ `POST /auth/admin/login` - Admin authentication
- ✅ `POST /auth/agent/login` - Agent authentication
- ✅ `GET /agent/profile` - Agent profile

### Frontend Routes:

- ✅ `/` - Main chatbot (your existing functionality)
- ✅ `/admin/login` - Admin login page
- ✅ `/agent/login` - Agent login page
- ✅ `/admin/dashboard` - Admin dashboard (protected)
- ✅ `/agent/dashboard` - Agent interface (protected)

## 8. 🎨 Features Available

### ✅ **For Admins:**

- Dashboard with real-time metrics
- Agent management (create, update, delete)
- Conversation queue monitoring
- Bulk conversation assignment
- Message configuration (multi-language)
- Real-time statistics

### ✅ **For Agents:**

- Personal dashboard
- Assigned conversation management
- Real-time chat interface
- Quick response templates
- Status management (online/offline/busy)
- Performance statistics

### ✅ **For Users:**

- Original chatbot functionality unchanged
- Seamless agent escalation when needed
- Multi-language support (English, Yoruba, Hausa)

## 9. 🔧 Customization

### Colors and Theming:

The system uses your existing design system:

- **Admin**: Emerald theme (`bg-emerald-600`, `text-emerald-700`)
- **Agent**: Slate theme (`bg-slate-600`, `text-slate-700`)
- **Chatbot**: Your existing emerald theme

### Adding New Features:

1. Backend: Add controllers in `/server/src/controllers/`
2. Frontend: Add components in `/honey/src/components/`
3. Update routing in `App.tsx` as needed

## 10. 🚨 Security Notes

**Important for Production:**

1. Change all default passwords
2. Update JWT secrets
3. Configure CORS properly
4. Set up HTTPS
5. Configure rate limiting
6. Set up proper logging

## 11. 🐛 Troubleshooting

### Common Issues:

**CORS Errors:**

- Add your frontend URL to backend CORS configuration

**Database Errors:**

- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Run `npx prisma migrate dev`

**JWT Errors:**

- Ensure JWT_SECRET is set in backend .env
- Check token expiration times

**WebSocket Issues:**

- Ensure Socket.IO is properly configured
- Check firewall settings for port 8080

## 12. 📈 Next Steps

1. **Test all functionality** with real data
2. **Create additional agents** through admin panel
3. **Customize messages** through configuration panel
4. **Set up monitoring** and logging
5. **Deploy to production** with proper security

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check that the database is properly configured

The system is now fully integrated and ready for use! Your original chatbot functionality remains unchanged, while the new admin/agent system provides powerful management capabilities.
