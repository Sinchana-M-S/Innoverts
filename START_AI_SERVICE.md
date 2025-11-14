# Starting the AI Service

## Quick Start

1. **Start Flask AI Service** (Terminal 1):
   ```bash
   cd "ai models"
   python main.py
   ```
   Should see: `Starting SARVASVA AI Service...` and run on port 5001

2. **Start Node.js Backend** (Terminal 2):
   ```bash
   cd server
   npm start
   ```
   Should see: `✅ Server running on port 5000` and `✅ AI Service URL: http://127.0.0.1:5001`

3. **Start React Frontend** (Terminal 3):
   ```bash
   cd client
   npm run dev
   ```

## Verify Services Are Running

1. **Check Flask AI Service**: Open http://127.0.0.1:5001
   - Should return JSON with status: "running"

2. **Check Node.js Backend**: Open http://localhost:5000
   - Should return: "✅ Sarvasva Backend Running (CommonJS)"

3. **Check AI Proxy**: Open http://localhost:5000/api/ai/health
   - Should return: `{"status": "connected", "aiService": "online"}`

## Troubleshooting

### 404 Error on /api/ai/chat
- **Check**: Is Flask AI service running on port 5001?
- **Check**: Is Node.js server running on port 5000?
- **Check**: Does `server/.env` have `AI_SERVICE_URL=http://127.0.0.1:5001`?

### Connection Refused
- Make sure Flask service is running before starting Node.js server
- Check firewall isn't blocking ports 5000 and 5001

### API Key Errors
- Make sure `ai models/.env` has `SARVAM_API_KEY` and `GROQ_API_KEY` set
- Check logs for API key validation messages

