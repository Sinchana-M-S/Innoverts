# Test and Run Guide

## ✅ Pre-Flight Checks

Based on the test results:

- ✅ **API Keys:** Both GROQ and SARVAM keys are configured
- ✅ **Python Dependencies:** Flask, Groq installed
- ✅ **Core Module:** sarvasva_core imports successfully
- ✅ **TTS Configs:** 11 languages configured

## 🚀 Starting Services

### Step 1: Start Flask AI Service

**Open Terminal 1:**

```powershell
cd "C:\Users\sinch\Desktop\hackkshetra\ai models"
.\venv\Scripts\Activate.ps1
python main.py
```

**Expected Output:**

```
Starting SARVASVA AI Service...
 * Running on http://127.0.0.1:5001
```

**Test it:**

- Open browser: http://127.0.0.1:5001
- Should see JSON with service status

### Step 2: Start Node.js Backend

**Open Terminal 2:**

```powershell
cd C:\Users\sinch\Desktop\hackkshetra\server
npm install  # If not already installed
npm start
```

**Expected Output:**

```
✅ Server running on port 5000
✅ AI Service URL: http://127.0.0.1:5001
```

**Test it:**

- Open browser: http://localhost:5000
- Should see: "✅ Sarvasva Backend Running (CommonJS)"
- Test proxy: http://localhost:5000/api/ai/health
- Should see: `{"status": "connected", "aiService": "online"}`

### Step 3: Start React Frontend

**Open Terminal 3:**

```powershell
cd C:\Users\sinch\Desktop\hackkshetra\client
npm install  # If not already installed
npm run dev
```

**Expected Output:**

```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

**Test it:**

- Open browser: http://localhost:5173
- Should see the chat interface

## 🧪 Testing Checklist

### 1. Health Checks

- [ ] Flask service: http://127.0.0.1:5001
- [ ] Node.js backend: http://localhost:5000
- [ ] AI proxy health: http://localhost:5000/api/ai/health
- [ ] Diagnostics: http://127.0.0.1:5001/diagnostics

### 2. Text Chat Test

1. Open frontend: http://localhost:5173
2. Type a message: "Hello, what can you help me with?"
3. Press Enter or click Send
4. **Expected:**
   - Bot responds with text
   - Audio play button appears
   - Response is in appropriate language

### 3. Voice Chat Test

1. Click microphone button
2. Speak a message
3. Click stop button
4. **Expected:**
   - Speech is transcribed to text
   - Bot responds in same language
   - Audio playback available

### 4. Audio Playback Test

1. After receiving a response, click the play button
2. **Expected:**
   - Audio plays
   - Pause button appears while playing
   - Audio can be paused/resumed

### 5. Language Detection Test

1. Type message in Hindi: "नमस्ते"
2. **Expected:**
   - Bot responds in Hindi
   - Audio is in Hindi

### 6. Error Handling Test

1. Stop Flask service (Terminal 1)
2. Try sending a message
3. **Expected:**
   - Clear error message appears
   - No crash

## 🔍 Troubleshooting

### Flask Service Won't Start

**Check:**

- API keys in `ai models/.env`
- Python virtual environment activated
- Port 5001 not in use

**Fix:**

```powershell
cd "ai models"
.\venv\Scripts\Activate.ps1
python main.py
```

### Node.js Backend Won't Start

**Check:**

- `node_modules` installed: `npm install`
- Port 5000 not in use
- `server/.env` has correct `AI_SERVICE_URL`

**Fix:**

```powershell
cd server
npm install
npm start
```

### Frontend Won't Connect

**Check:**

- Flask service running on port 5001
- Node.js backend running on port 5000
- Browser console for errors

**Fix:**

- Start services in order: Flask → Node.js → React
- Check `server/.env` configuration

### No Audio Playback

**Check:**

- Browser console for errors
- `SARVAM_API_KEY` is valid
- Flask logs for TTS errors

**Fix:**

- Check API key in `ai models/.env`
- Restart Flask service

## 📊 Quick Test Commands

### Test Flask Endpoint (PowerShell)

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:5001" -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Test Node.js Endpoint (PowerShell)

```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/ai/health" -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Test Chat Endpoint (PowerShell)

```powershell
$body = @{message="Hello"; session_id="test123"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/ai/chat" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content
```

## ✅ Success Indicators

You'll know everything works when:

1. ✅ All 3 terminals show services running
2. ✅ Browser shows frontend without console errors
3. ✅ Chat messages get responses
4. ✅ Voice input works
5. ✅ Audio playback works
6. ✅ Language switching works
7. ✅ No errors in browser console
8. ✅ No errors in Flask/Node.js logs

---

**Ready to test!** Start the services in order and follow the testing checklist above.
