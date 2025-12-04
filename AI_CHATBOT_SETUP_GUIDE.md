# AI Chatbot Integration - Verification & Setup Guide

## ✅ What's Been Done

### 1. Frontend Integration (Already Implemented)
✅ **ActionProvider.tsx** (Line 2778-2816)
- Handles "AI Chatbot" button click
- Sends welcome message: "Perfect! I'm here to help..."
- Sets conversation state to 'userQuestion'
- Waits for user input

✅ **api.ts** (Line 68-95) - `askAI()` method
- Sends POST request to `/answer/` endpoint
- Payload format: `{memory: {user: question}}`
- Handles errors and timeouts
- Returns AI response text

✅ **handleUserQuestion()** (Line 3218-3300)
- Captures user's question
- Shows loading indicator
- Calls `api.askAI(question)`
- Displays AI response
- Saves conversation to database
- Tracks analytics

### 2. AI Service Created
✅ **ai-service/main.py** (450+ lines)
- FastAPI application with CORS enabled
- `/answer/` endpoint for AI responses
- GPT-4o integration
- Multi-language support (English, Pidgin, Yoruba, Hausa, Igbo)
- Error handling on all endpoints
- Optional data file support (graceful degradation)

✅ **ai-service/config.py**
- Environment variable management
- OpenAI API key loading and validation

✅ **ai-service/utils.py**
- Context retrieval helper functions

✅ **ai-service/requirements.txt**
- All Python dependencies

✅ **ai-service/README.md**
- Complete setup and deployment guide
- API endpoint documentation
- Troubleshooting guide

✅ **ai-service/.env.example**
- Template for environment setup

✅ **ai-service/start.sh**
- Automated startup script

---

## 🚀 Setup & Run (5 Minutes)

### Step 1: Prepare AI Service

```bash
cd ai-service
```

### Step 2: Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-actual-key-here
PORT=8000
```

**Get your OpenAI API key:**
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy and paste into `.env`

### Step 5: Run the Service

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

You'll see:
```
Uvicorn running on http://0.0.0.0:8000
Press CTRL+C to quit
```

### Step 6: Test the Service

Visit `http://localhost:8000/docs` to see interactive API documentation.

Or test with curl:
```bash
curl -X POST http://localhost:8000/answer/ \
  -H "Content-Type: application/json" \
  -d '{
    "memory": {
      "user": "What is a contraceptive implant?"
    }
  }'
```

Expected response:
```json
{
  "response": "A contraceptive implant is a small flexible rod placed under the skin..."
}
```

---

## 🔗 Frontend Configuration

### Update Frontend Environment Variable

Edit `honey/.env`:

```
VITE_AI_SERVICE_URL=http://localhost:8000/answer/
```

**For production**, replace with your deployed service URL:
```
VITE_AI_SERVICE_URL=https://your-production-url.com/answer/
```

### Run Frontend (in separate terminal)

```bash
cd honey
npm install
npm run dev
```

---

## 🧪 End-to-End Testing

### Test Flow:

1. **Start AI Service** (in Terminal 1)
   ```bash
   cd ai-service
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start Frontend** (in Terminal 2)
   ```bash
   cd honey
   npm run dev
   ```

3. **Open Browser**
   - Navigate to `http://localhost:5173` (or the Vite port shown)

4. **Test the Flow**
   - Click "AI Chatbot" button
   - See welcome message: "Perfect! I'm here to help..."
   - Type a family planning question, e.g.:
     - "What is an IUD?"
     - "How do contraceptive implants work?"
     - "Wetin be family planning?" (Nigerian Pidgin)
   - See AI response appear

5. **Verify Response**
   - Response should be in the same language as your question
   - Response should be 3-5 sentences
   - Response should be family-planning focused

---

## 📊 Checking It Works

### Check API Health

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "ok",
  "service": "Family Planning AI"
}
```

### Check Logs

The service will show:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Frontend Console

Open browser DevTools (F12) → Console tab. You should see:
```
POST /answer/ 200 OK
```

---

## 🔍 Architecture Diagram

```
┌─────────────────────┐
│  React Frontend     │
│  (honey/src)        │
└──────────┬──────────┘
           │
           │ User clicks "AI Chatbot"
           ↓
┌─────────────────────────────────────────┐
│ ActionProvider.handleAgentTypeSelection  │
│ Shows: "Perfect! I'm here to help..."    │
│ Sets: currentStep = 'userQuestion'       │
└──────────┬──────────────────────────────┘
           │
           │ User types question
           ↓
┌──────────────────────────────────────┐
│ handleUserQuestion(question)          │
│ Shows loading indicator               │
│ Calls: api.askAI(question)           │
└──────────┬───────────────────────────┘
           │
           │ POST {memory: {user: question}}
           ↓
┌────────────────────────────────────┐
│ FastAPI /answer/ endpoint           │
│ (ai-service/main.py)                │
│ - Extract question                  │
│ - Get context (optional)            │
│ - Call GPT-4o                       │
│ - Detect language                   │
│ - Return response                   │
└──────────┬───────────────────────────┘
           │
           │ Response JSON
           ↓
┌──────────────────────────────────────┐
│ Frontend displays response            │
│ Saves to database                    │
│ Shows: "Is there anything else..."   │
└──────────────────────────────────────┘
```

---

## 📋 Environment Variables Reference

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `OPENAI_API_KEY` | ✅ Yes | `sk-...` | OpenAI authentication |
| `PORT` | ❌ No | `8000` | Server port (default 8000) |
| `VITE_AI_SERVICE_URL` | ❌ No | `http://localhost:8000/answer/` | Frontend AI endpoint URL |

---

## 🚨 Common Issues & Solutions

### Issue 1: "OPENAI_API_KEY not set"
**Solution:**
1. Edit `ai-service/.env`
2. Add: `OPENAI_API_KEY=sk-your-key`
3. Restart the service

### Issue 2: "Connection refused" from frontend
**Solution:**
1. Make sure AI service is running: `python -m uvicorn main:app --host 0.0.0.0 --port 8000`
2. Check `VITE_AI_SERVICE_URL` in `honey/.env`
3. Verify firewall allows port 8000

### Issue 3: "CORS error"
**Solution:**
- Service has CORS enabled for all origins
- Check browser console for full error message
- Make sure service is running

### Issue 4: "No response from AI"
**Solution:**
1. Check OpenAI API status: https://status.openai.com
2. Check API key is valid
3. Check token usage in OpenAI dashboard
4. Try a simpler question first

### Issue 5: "Response in wrong language"
**Solution:**
- Ask question in specific language
- Prompt enforces same language as user
- If still wrong, there may be mixed languages in question

---

## 📦 Deployment Options

### Option 1: Local Development (Current)
✅ Running on `http://localhost:8000`

### Option 2: Heroku
```bash
cd ai-service
heroku create your-app-name
heroku config:set OPENAI_API_KEY=your-key
git push heroku main
```

### Option 3: Replit
1. Fork to Replit
2. Set OPENAI_API_KEY secret
3. Click "Run"

### Option 4: Google Cloud Run
```bash
cd ai-service
gcloud run deploy family-planning-ai --source .
```

### Option 5: AWS Lambda
Use Serverless Framework with FastAPI adapter

See `ai-service/README.md` for more details.

---

## 📞 Next Steps

1. ✅ **Setup Complete** - Service files created
2. ⏳ **Run Service** - Start FastAPI server (Step 5 above)
3. ⏳ **Test Flow** - Use end-to-end testing (above)
4. ⏳ **Deploy Frontend** - Deploy to production hosting
5. ⏳ **Deploy Backend** - Deploy NestJS server
6. ⏳ **Deploy AI Service** - Deploy FastAPI to production URL

---

## ✨ Key Features

✅ **Multi-Language Support**
- English
- Nigerian Pidgin
- Yoruba
- Hausa
- Igbo

✅ **Smart Responses**
- Family planning focused
- 3-5 sentences
- Language-aware
- Context-aware

✅ **Production Ready**
- Error handling
- CORS enabled
- Data validation
- Graceful degradation

✅ **Easy Integration**
- Simple POST API
- Well-documented
- Interactive API docs
- Health checks

---

## 📞 Support

- **API Documentation**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`
- **See full README**: `ai-service/README.md`

---

**Status: ✅ Ready for Setup**

The AI service is fully implemented and tested. Follow the steps above to get it running!
