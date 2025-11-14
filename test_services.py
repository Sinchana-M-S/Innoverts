#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Quick test script to check if services are running"""

import requests
import sys

def test_service(url, name):
    try:
        r = requests.get(url, timeout=2)
        print(f"[OK] {name}: RUNNING (Status: {r.status_code})")
        return True
    except requests.exceptions.ConnectionError:
        print(f"[X] {name}: NOT RUNNING")
        return False
    except Exception as e:
        print(f"[!] {name}: ERROR - {str(e)[:50]}")
        return False

def main():
    print("=" * 50)
    print("Service Status Check")
    print("=" * 50)
    
    flask_running = test_service("http://127.0.0.1:5001", "Flask AI Service")
    node_running = test_service("http://localhost:5000", "Node.js Backend")
    
    if flask_running:
        try:
            r = requests.get("http://127.0.0.1:5001/diagnostics", timeout=2)
            if r.status_code == 200:
                data = r.json()
                print(f"[OK] Diagnostics: OK")
                if data.get('api_keys', {}).get('groq', {}).get('loaded'):
                    print("   -> Groq API key: Loaded")
                if data.get('api_keys', {}).get('sarvam', {}).get('loaded'):
                    print("   -> Sarvam API key: Loaded")
        except Exception as e:
            print(f"[!] Diagnostics: ERROR - {str(e)[:50]}")
    
    if node_running:
        try:
            r = requests.get("http://localhost:5000/api/ai/health", timeout=2)
            if r.status_code == 200:
                data = r.json()
                print(f"[OK] AI Proxy: {data.get('status', 'unknown')}")
                if data.get('aiService') == 'online':
                    print("   -> Flask service is connected!")
                else:
                    print("   -> Flask service is NOT connected")
            else:
                print(f"[!] AI Proxy: Status {r.status_code}")
        except Exception as e:
            print(f"[!] AI Proxy: ERROR - {str(e)[:50]}")
    
    print("=" * 50)
    
    if flask_running and node_running:
        print("[OK] All services are running!")
        print("\nNext steps:")
        print("1. Start React frontend: cd client && npm run dev")
        print("2. Open browser: http://localhost:5173")
    else:
        print("[X] Some services are not running")
        print("\nTo start services:")
        if not flask_running:
            print("1. Flask: cd 'ai models' && python main.py")
        if not node_running:
            print("2. Node.js: cd server && npm start")
        print("3. React: cd client && npm run dev")

if __name__ == "__main__":
    main()
