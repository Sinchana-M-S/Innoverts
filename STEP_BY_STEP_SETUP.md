# Step-by-Step Setup Guide

Follow these steps in order to get your AI chatbot working with all SARVASVA functionalities.

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] Python 3.8+ installed
- [ ] Node.js and npm installed
- [ ] API keys ready:
  - [ ] `GROQ_API_KEY` (from https://console.groq.com/)
  - [ ] `SARVAM_API_KEY` (from https://sarvam.ai/)

---

## Step 1: Set Up API Keys

### 1.1 Create `.env` file in `ai models` folder

**Location:** `ai models/.env`

**Create the file with:**

```env
GROQ_API_KEY=your_groq_api_key_here
SARVAM_API_KEY=your_sarvam_api_key_here
AI_PORT=5001
```

**How to do it:**

1. Navigate to `ai models` folder
2. Create a new file named `.env` (no extension)
3. Copy the content above
4. Replace `your_groq_api_key_here` with your actual Groq API key
5. Replace `your_sarvam_api_key_here` with your actual Sarvam API key
6. Save the file

---

## Step 2: Install Python Dependencies

### 2.1 Navigate to `ai models` folder

```bash
cd "ai models"
```

### 2.2 Create virtual environment (if not already created)

**Windows:**

```bash
python -m venv venv
```

**Mac/Linux:**

```bash
python3 -m venv venv
```

### 2.3 Activate virtual environment

**Windows (PowerShell):**

```bash
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**

```bash
venv\Scripts\activate.bat
```

**Mac/Linux:**

```bash
source venv/bin/activate
```

### 2.4 Install dependencies

```bash
pip install -r requirements.txt
```

**If you get an error about missing `groq` package, also run:**

```bash
pip install groq
```

**Expected output:** All packages should install successfully.

**Note:** If you see warnings about `pdf2image` or `pytesseract`, those are optional for document reading. The core chatbot will work without them.

---

## Step 3: Verify Python Setup

### 3.1 Test if Flask service can start

```bash
python main.py
```

**Expected output:**

```
Starting SARVASVA AI Service...
 * Running on http://127.0.0.1:5001
```

**If you see errors:**

- Check that `.env` file exists and has correct API keys
- Check that all dependencies are installed
- Look at the error message and fix the issue

**Press `Ctrl+C` to stop the server** (keep it running for now if it works)

---

## Step 4: Set Up Node.js Backend

### 4.1 Navigate to `server` folder

Open a **NEW terminal window** (keep Flask running in the first terminal)

```bash
cd server
```

### 4.2 Check if `.env` exists in `server` folder

**Location:** `server/.env`

**If it doesn't exist, create it with:**

```env
PORT=5000
AI_SERVICE_URL=http://127.0.0.1:5001
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 4.3 Install Node.js dependencies

```bash
npm install
```

**Expected output:** `node_modules` folder should be created.

---

## Step 5: Start All Services

You need **3 terminal windows** running simultaneously:

### Terminal 1: Flask AI Service

```bash
cd "ai models"
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# OR
venv\Scripts\activate.bat   # Windows CMD
# OR
source venv/bin/activate     # Mac/Linux

python main.py
```

**Expected output:**

```
Starting SARVASVA AI Service...
 * Running on http://127.0.0.1:5001
```

### Terminal 2: Node.js Backend

```bash
cd server
npm start
```

**Expected output:**

```
✅ Server running on port 5000
✅ AI Service URL: http://127.0.0.1:5001
```

### Terminal 3: React Frontend

```bash
cd client
npm install  # Only needed first time
npm run dev
```

**Expected output:**

```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

## Step 6: Verify Services Are Running

### 6.1 Test Flask AI Service

Open browser: http://127.0.0.1:5001

**Expected:** JSON response showing service status and endpoints

### 6.2 Test Node.js Backend

Open browser: http://localhost:5000

**Expected:** `✅ Sarvasva Backend Running (CommonJS)`

### 6.3 Test AI Proxy Connection

Open browser: http://localhost:5000/api/ai/health

**Expected:**

```json
{
  "status": "connected",
  "aiService": "online",
  "aiServiceUrl": "http://127.0.0.1:5001"
}
```

**If you see "offline":**

- Make sure Flask service is running in Terminal 1
- Check that Flask is on port 5001
- Check `server/.env` has correct `AI_SERVICE_URL`

### 6.4 Test Diagnostics Endpoint

Open browser: http://127.0.0.1:5001/diagnostics

**Expected:** JSON showing API keys loaded and chatbot initialization status

---

## Step 7: Test the Chatbot

### 7.1 Open Frontend

Open browser: http://localhost:5173 (or the port shown in Terminal 3)

### 7.2 Test Text Chat

1. Type a message in the chat input
2. Press Enter or click Send
3. **Expected:** You should get a response with text and audio

### 7.3 Test Voice Chat

1. Click the microphone button
2. Speak your message
3. **Expected:** Your speech should be converted to text and you should get a response

---

## Step 8: Troubleshooting Common Issues

### Issue 1: "AI service is not running" error

**Solution:**

- Make sure Flask service is running in Terminal 1
- Check Terminal 1 for any error messages
- Verify Flask is on port 5001 (check `ai models/.env`)

### Issue 2: "API keys are missing" error

**Solution:**

- Check `ai models/.env` file exists
- Verify API keys are correct (no extra spaces)
- Restart Flask service after adding keys

### Issue 3: "404 Not Found" on `/api/ai/chat`

**Solution:**

- Make sure Node.js backend is running (Terminal 2)
- Check `server/.env` has `AI_SERVICE_URL=http://127.0.0.1:5001`
- Restart Node.js server

### Issue 4: "Connection refused" error

**Solution:**

- Make sure Flask service started successfully
- Check firewall isn't blocking ports 5000 and 5001
- Verify services are running in correct order:
  1. Flask first (Terminal 1)
  2. Node.js second (Terminal 2)
  3. React last (Terminal 3)

### Issue 5: No audio in responses

**Solution:**

- Check browser console for errors
- Verify `SARVAM_API_KEY` is correct
- Check Flask logs for TTS errors

### Issue 6: Translation not working

**Solution:**

- Verify `SARVAM_API_KEY` is valid
- Check Flask logs for translation errors
- Test translation endpoint directly: http://127.0.0.1:5001/translate

---

## Step 9: Verify All Features Work

Test each feature:

- [ ] **Text Chat:** Send a text message, get response
- [ ] **Voice Input:** Record voice, get transcribed text
- [ ] **Audio Response:** Response should have play button
- [ ] **Language Switching:** Change language, responses should be in that language
- [ ] **Multilingual:** Input in Hindi/Tamil/etc., get response in same language
- [ ] **Session Management:** Multiple messages should maintain conversation context

---

## Step 10: Production Checklist (Optional)

If deploying to production:

- [ ] Change `AI_PORT` in `ai models/.env` if needed
- [ ] Update `CORS_ORIGINS` in `server/.env` with production URLs
- [ ] Set up environment variables on hosting platform
- [ ] Use process manager (PM2 for Node.js, Gunicorn for Flask)
- [ ] Set up proper logging
- [ ] Configure SSL/HTTPS

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ All 3 terminals show services running
2. ✅ Browser shows frontend without errors
3. ✅ Chat messages get responses
4. ✅ Voice input works
5. ✅ Audio playback works
6. ✅ Language switching works
7. ✅ No errors in browser console
8. ✅ No errors in Flask/Node.js logs

---

## 📞 Quick Reference

### Service URLs:

- **Flask AI Service:** http://127.0.0.1:5001
- **Node.js Backend:** http://localhost:5000
- **React Frontend:** http://localhost:5173

### Key Files:

- **API Keys:** `ai models/.env`
- **Backend Config:** `server/.env`
- **Flask Main:** `ai models/main.py`
- **Chatbot Core:** `ai models/sarvasva_core.py`

### Common Commands:

```bash
# Start Flask
cd "ai models" && python main.py

# Start Node.js
cd server && npm start

# Start React
cd client && npm run dev

# Check Flask health
curl http://127.0.0.1:5001

# Check Node.js health
curl http://localhost:5000/api/ai/health
```

---

## 🚀 You're Done!

If all steps completed successfully, your chatbot should be fully functional with all SARVASVA features!

If you encounter any issues, check the troubleshooting section or review the error messages in the terminal windows.
