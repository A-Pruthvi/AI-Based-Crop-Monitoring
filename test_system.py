"""
CropMonitor System Test - Prediction Testing Script
Tests the complete prediction pipeline
"""

import os
import sys
import json
import time
import requests
from pathlib import Path

# Configuration
BACKEND_URL = "http://localhost:8081"
AI_SERVICE_URL = "http://localhost:5000"
FRONTEND_URL = "http://localhost:3000"

# Test image path
TEST_IMAGE = r"C:\Users\pruth\OneDrive\Desktop\EDP PROJECT VI SEM\ai-service\bigdataset\organized_by_crop\Apple\Apple Scab\dataset_unified_Apple_scab_012.jpg"

def check_service(url, name):
    """Check if a service is running"""
    try:
        response = requests.get(f"{url}/health", timeout=3)
        print(f"✅ {name}: {response.status_code}")
        return True
    except Exception as e:
        print(f"⏳ {name}: Not ready - {str(e)[:50]}")
        return False

def test_ai_prediction(image_path):
    """Test AI prediction service"""
    if not os.path.exists(image_path):
        print(f"❌ Test image not found: {image_path}")
        return False
    
    try:
        with open(image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post(
                f"{AI_SERVICE_URL}/predict",
                files=files,
                timeout=30
            )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ AI Prediction successful!")
            print(f"   Crop: {result.get('crop', 'N/A')}")
            print(f"   Disease: {result.get('disease', 'N/A')}")
            print(f"   Confidence: {result.get('confidence', 'N/A')}%")
            return True
        else:
            print(f"❌ AI Prediction failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ AI Prediction error: {str(e)}")
        return False

def main():
    print("=" * 70)
    print("🚀 CROPMONITOR SYSTEM TEST")
    print("=" * 70)
    print()
    
    print("📡 SERVICE STATUS CHECK:")
    print("-" * 70)
    
    frontend_ok = check_service(FRONTEND_URL, "Frontend (React)")
    backend_ok = check_service(BACKEND_URL, "Backend (Spring Boot)")
    ai_ok = check_service(AI_SERVICE_URL, "AI Service (Flask)")
    
    print()
    print("=" * 70)
    
    if not all([frontend_ok, backend_ok, ai_ok]):
        print("⚠️  Some services are still starting. Please wait 2-5 minutes.")
        print()
        print("Once all services are ready:")
        print("1. Open Frontend: http://localhost:3000")
        print("2. Login with credentials")
        print("3. Navigate to 'Overview' to see dashboard statistics")
        print("4. Upload disease leaf images to test predictions")
        print()
    else:
        print("🎉 ALL SERVICES READY!")
        print()
        print("SYSTEM OVERVIEW:")
        print("-" * 70)
        print("📊 Frontend Dashboard: http://localhost:3000")
        print("   - Navigate to 'Overview' section")
        print("   - View system statistics and usage metrics")
        print()
        print("🔍 Testing Prediction:")
        print(f"   Test Image: {TEST_IMAGE}")
        print()
        
        if test_ai_prediction(TEST_IMAGE):
            print()
            print("✅ PREDICTION SYSTEM WORKING!")
        
    print()
    print("=" * 70)
    print("Next Steps:")
    print("1. Open http://localhost:3000 in your browser")
    print("2. Check 'Overview' section for system statistics")
    print("3. Upload images to test disease detection")
    print("=" * 70)

if __name__ == "__main__":
    main()
