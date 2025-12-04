# Family Planning AI Service Setup Guide

## Overview

This is a FastAPI-based AI service for the Family Planning chatbot. It processes natural language questions and returns AI-generated responses using OpenAI's GPT-4o model with multi-language support (English, Nigerian Pidgin, Yoruba, Hausa, Igbo).

## Quick Start (7 Steps)

### 1. Navigate to ai-service directory
```bash
cd ai-service
```

### 2. Create Python virtual environment
```bash
python -m venv venv
```

### 3. Activate virtual environment
**On Windows:**
```bash
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
source venv/bin/activate
```

### 4. Install dependencies
```bash
pip install -r requirements.txt
```

### 5. Create .env file
```bash
cp .env.example .env
```

Then edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-actual-key-here
PORT=8000
```

### 6. Run the FastAPI server
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The service will start at: `http://localhost:8000`

### 7. Test the service
Visit `http://localhost:8000/docs` to see the interactive API documentation.

## API Endpoints

### POST /answer/
**Main AI chatbot endpoint**

**Request:**
```json
{
  "memory": {
    "user": "What is a contraceptive implant?"
  }
}
```

**Response:**
```json
{
  "response": "A contraceptive implant is a small flexible rod placed under the skin of your upper arm that prevents pregnancy for up to 3-5 years..."
}
```

**Usage in Frontend:**
```typescript
const aiResponse = await fetch('http://localhost:8000/answer/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    memory: { user: question }
  })
});
const data = await aiResponse.json();
console.log(data.response);
```

### GET /health
Check if the service is running
```bash
curl http://localhost:8000/health
```

### POST /predict_lga/
Find matching LGAs from user input
```json
{
  "user_input": "Lagos Island"
}
```

### POST /get_town_from_lga/
Get towns in a specific LGA
```json
{
  "lga": "Lagos Island"
}
```

### POST /refer_to_clinic/
Get clinic recommendations for an LGA and city
```json
{
  "lga": "Lagos Island",
  "city": "Victoria Island"
}
```

## Frontend Integration

The frontend (`honey/` directory) is already configured to use this AI service.

### Configuration

Set the `VITE_AI_SERVICE_URL` environment variable in `honey/.env`:

```
VITE_AI_SERVICE_URL=http://localhost:8000/answer/
```

Or for production:
```
VITE_AI_SERVICE_URL=https://your-deployed-service.com/answer/
```

### Current Frontend Flow

1. **User clicks "AI Chatbot" button**
   - Location: ActionProvider.tsx (line 2778)

2. **Frontend displays welcome message**
   - "Perfect! I'm here to help. Please ask your question and I'll do my best to provide accurate information."

3. **Frontend waits for user input**
   - Sets currentStep to 'userQuestion'

4. **User types question**
   - Question stored in variable (e.g., "text")

5. **Frontend sends POST to /answer/**
   - Location: api.ts (line 68-95)
   - Payload: `{memory: {user: question}}`

6. **FastAPI processes with GPT-4o**
   - Detects user language
   - Retrieves relevant context
   - Generates family-planning-focused response

7. **Response returned to frontend**
   - Format: `{response: "AI answer"}`

8. **Frontend displays response**
   - Saves to database
   - Tracks analytics

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key (required) | `sk-...` |
| `PORT` | Server port | `8000` |

## AI Configuration

| Setting | Value | Purpose |
|---------|-------|---------|
| Model | `gpt-4o` | Latest OpenAI model |
| Temperature | `0.25` | Low = consistent answers |
| Max Tokens | `350` | Response length limit |
| Languages | EN, Pidgin, Yoruba, Hausa, Igbo | Multi-language support |

## Data Files (Optional)

The service can use optional CSV files for enhanced responses:

- `./data/lgas.csv` - List of LGAs
- `./data/clinics.csv` - Clinic database
- `./data/partner_clinic.xlsx` - Partner clinic data

If files are missing, the service will still work using general knowledge.

## Troubleshooting

### Error: "OPENAI_API_KEY environment variable is not set"
**Solution:** Add your OpenAI key to `.env` file and restart the server.

### Error: "Module not found"
**Solution:** Make sure you activated the virtual environment and ran `pip install -r requirements.txt`

### CORS Error in Frontend
**Solution:** The service has CORS enabled for all origins. Make sure your frontend URL is accessible.

### Connection Refused
**Solution:** Make sure the service is running and accessible at the configured URL.

### Slow Response
**Solution:** Check OpenAI API status. First request may be slow (cold start).

## Production Deployment

### Option 1: Heroku

1. Create `Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

2. Push to Heroku:
```bash
heroku create your-app-name
heroku config:set OPENAI_API_KEY=your-key
git push heroku main
```

### Option 2: Replit

1. Fork this repository to Replit
2. Set OPENAI_API_KEY secret
3. Click "Run"

### Option 3: Google Cloud Run

```bash
gcloud run deploy family-planning-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars OPENAI_API_KEY=your-key
```

### Option 4: AWS Lambda with Serverless

```bash
serverless deploy
```

### Option 5: DigitalOcean App Platform

1. Connect GitHub repository
2. Set environment variables
3. Deploy

## Performance Tips

1. **Cache responses** - Store common Q&A pairs
2. **Rate limiting** - Implement to prevent abuse
3. **Connection pooling** - For database operations
4. **Response compression** - Use gzip middleware
5. **CDN** - Serve from edge locations

## Monitoring

Add monitoring to track:
- Response times
- Error rates
- Token usage
- Cost

## Architecture

```
Frontend (React)
    ↓ POST /answer/ 
    ↓ {memory: {user: question}}
    ↓
FastAPI Server
    ↓
    ├→ Extract question
    ├→ Get context (optional)
    ├→ Prompt construction
    └→ GPT-4o API
          ↓
    OpenAI Response
    ↓
JSONResponse
    ↓
Frontend Display
    ↓
Database Save
```

## Support

For issues:
1. Check the troubleshooting section
2. Review OpenAI API status
3. Check FastAPI logs (`python -m uvicorn main:app --reload`)
4. Check frontend browser console

## Files

- `main.py` - FastAPI application with all endpoints
- `config.py` - Environment configuration
- `utils.py` - Helper functions (context retrieval)
- `requirements.txt` - Python dependencies
- `.env.example` - Environment template
- `start.sh` - Startup script
- `.gitignore` - Git ignore rules
- `README.md` - This file

## License

Part of the DKT Chatbot project
