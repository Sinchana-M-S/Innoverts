# 🚀 Quick Start Guide

## ⚡ Fast Setup (5 Minutes)

### 1️⃣ Set API Keys

**File:** `ai models/.env`
```env
GROQ_API_KEY=your_key_here
SARVAM_API_KEY=your_key_here
AI_PORT=5001
```

### 2️⃣ Install & Start Services

**Terminal 1 - Flask AI:**
```bash
cd "ai models"
python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt
python main.py
```

**Terminal 2 - Node.js:**
```bash
cd server
npm install
npm start
```

**Terminal 3 - React:**
```bash
cd client
npm install
npm run dev
```

### 3️⃣ Test

Open: http://localhost:5173

---

## ✅ Success Checklist

- [ ] Flask running on http://127.0.0.1:5001
- [ ] Node.js running on http://localhost:5000
- [ ] React running on http://localhost:5173
- [ ] Health check: http://localhost:5000/api/ai/health shows "online"
- [ ] Chat works in browser

---

## 🆘 Quick Fixes

| Problem | Solution |
|---------|----------|
| "API keys missing" | Check `ai models/.env` exists |
| "404 on /api/ai/chat" | Start Flask service first |
| "Connection refused" | Check Flask is on port 5001 |
| No audio | Check `SARVAM_API_KEY` is valid |

---

**For detailed steps, see:** `STEP_BY_STEP_SETUP.md`

