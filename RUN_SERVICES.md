# 🚀 Running Services - Quick Guide

## ✅ Current Status

Based on the test:
- **Node.js Backend:** ✅ RUNNING on port 5000
- **Flask AI Service:** Starting in background...

## 📋 Service Status

Run this command to check status:
```powershell
python test_services.py
```

## 🎯 Start All Services

### Option 1: Manual Start (Recommended)

**Terminal 1 - Flask AI Service:**
```powershell
cd "C:\Users\sinch\Desktop\hackkshetra\ai models"
.\venv\Scripts\Activate.ps1
python main.py
```

**Terminal 2 - Node.js Backend:**
```powershell
cd C:\Users\sinch\Desktop\hackkshetra\server
npm start
```

**Terminal 3 - React Frontend:**
```powershell
cd C:\Users\sinch\Desktop\hackkshetra\client
npm run dev
```

### Option 2: Quick Test

1. **Check if services are running:**
   ```powershell
   python test_services.py
   ```

2. **If Flask is not running, start it:**
   ```powershell
   cd "ai models"
   .\venv\Scripts\Activate.ps1
   python main.py
   ```

3. **Open browser:**
   - Frontend: http://localhost:5173
   - Flask Health: http://127.0.0.1:5001
   - Node.js Health: http://localhost:5000

## 🧪 Test Endpoints

### Test Flask Service
```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:5001" -UseBasicParsing
```

### Test Node.js Backend
```powershell
Invoke-WebRequest -Uri "http://localhost:5000" -UseBasicParsing
```

### Test AI Proxy
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/ai/health" -UseBasicParsing
```

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Flask shows: `Starting SARVASVA AI Service...` and `Running on http://127.0.0.1:5001`
2. ✅ Node.js shows: `✅ Server running on port 5000` and `✅ AI Service URL: http://127.0.0.1:5001`
3. ✅ React shows: `Local: http://localhost:5173/`
4. ✅ Browser opens chat interface without errors
5. ✅ `python test_services.py` shows all services as `[OK]`

## 🐛 Troubleshooting

### Flask won't start
- Check API keys in `ai models/.env`
- Activate virtual environment: `.\venv\Scripts\Activate.ps1`
- Check port 5001 is not in use

### Node.js won't start
- Run `npm install` in `server` folder
- Check port 5000 is not in use
- Verify `server/.env` has correct `AI_SERVICE_URL`

### Frontend won't connect
- Make sure Flask is running first
- Make sure Node.js is running
- Check browser console for errors

---

**Flask service is starting in the background. Wait a few seconds, then run `python test_services.py` to verify it's running!**

