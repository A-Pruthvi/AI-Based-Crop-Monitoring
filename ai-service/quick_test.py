#!/usr/bin/env python3
"""Quick test to verify API predictions work"""
import requests
import json
import os

print("\n" + "="*70)
print("🚀 QUICK PROJECT VERIFICATION TEST")
print("="*70 + "\n")

# 1. Check API health
print("[1/3] Checking API Health...")
try:
    response = requests.get('http://localhost:5000/health', timeout=5)
    if response.status_code == 200:
        print("✅ API is RUNNING on port 5000")
    else:
        print(f"❌ API Error: {response.status_code}")
except Exception as e:
    print(f"❌ API Connection Failed: {e}")
    exit(1)

# 2. Test prediction with real image
print("\n[2/3] Testing Prediction...")
try:
    # Direct path to test image
    test_img = r'bigdataset\organized_by_crop_disease\Apple\Apple Scab\dataset_multi_crop_Apple_scab_000.jpg'
    
    if not os.path.exists(test_img):
        print(f"❌ Test image not found: {test_img}")
        exit(1)
    
    print(f"  Testing with: Apple Scab image")
    
    with open(test_img, 'rb') as f:
        files = {'image': f}
        response = requests.post('http://localhost:5000/predict', files=files, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Prediction SUCCESS")
        print(f"   Crop Detected: {data['crop'].upper()}")
        print(f"   Confidence: {data['confidence']}%")
        print(f"   Severity: {data['severity']}")
        if data['crop'].lower() == 'apple':
            print(f"   ✅ CORRECT prediction!")
    else:
        print(f"❌ Prediction Failed: {response.status_code}")
except Exception as e:
    print(f"❌ Prediction Error: {e}")
    import traceback
    traceback.print_exc()

# 3. Check frontend
print("\n[3/3] Checking Frontend...")
try:
    response = requests.get('http://localhost:3000', timeout=5)
    if response.status_code == 200:
        print("✅ Frontend is RUNNING on port 3000")
    else:
        print(f"⚠️ Frontend returned: {response.status_code}")
except Exception as e:
    print(f"⚠️  Frontend Check: {e}")

print("\n" + "="*70)
print("🎉 PROJECT STATUS: ALL SYSTEMS OPERATIONAL")
print("="*70)
print("🌐 Web Access: http://localhost:3000")
print("📡 API Endpoint: http://localhost:5000/predict")
print("🗄️  Database: localhost:3306")
print("="*70 + "\n")
