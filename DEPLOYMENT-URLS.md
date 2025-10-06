# Deployment URLs

## After Deployment, Update These:

### Backend URL

```
https://your-backend.up.railway.app
```

### Frontend URL

```
https://your-app.vercel.app
```

### Admin Login

```
https://your-app.vercel.app/admin/login
```

### Agent Login

```
https://your-app.vercel.app/agent/login
```

### Database Connection

```
Railway PostgreSQL - Managed automatically
```

---

## Update These Files After Getting URLs:

### 1. honey/.env (Frontend)

```bash
VITE_API_URL=https://your-backend.up.railway.app
```

### 2. server/.env (Backend)

```bash
FRONTEND_URL=https://your-app.vercel.app
```

### 3. server/src/main.ts (CORS)

```typescript
app.enableCors({
  origin: ["https://your-app.vercel.app"],
  credentials: true,
});
```

---

## Credentials

### Admin

- Email: admin@honeychatbot.com
- Password: [Set in backend .env]

### Agents

- sarah@honeychatbot.com / agent123
- michael@honeychatbot.com / agent123
- aisha@honeychatbot.com / agent123
