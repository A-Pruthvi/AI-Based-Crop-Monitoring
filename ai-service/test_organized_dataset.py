"""
TEST PREDICTIONS WITH ORGANIZED DATASET IMAGES
Tests model using images from bigdataset/organized_by_crop_disease/
"""

import requests
import json
from pathlib import Path

print("=" * 80)
print("🧪 TESTING WITH ORGANIZED DATASET")
print("=" * 80)

API_URL = "http://localhost:5000/predict"
ORGANIZED_PATH = Path("bigdataset/organized_by_crop_disease")

# Check API
print("\n🔍 Checking API...")
try:
    resp = requests.get("http://localhost:5000/", timeout=2)
    print("✓ API is running on port 5000")
except:
    print("✗ API not running! Start it: python api_predictions_improved.py")
    exit(1)

# Find test images from organized folders
print("\n📁 Finding test images from organized folders...")
test_images = []

for crop_folder in sorted(ORGANIZED_PATH.iterdir()):
    if not crop_folder.is_dir() or crop_folder.name == "Unknown":
        continue
    
    for disease_folder in crop_folder.iterdir():
        if disease_folder.is_dir():
            images = list(disease_folder.glob("*.jpg"))
            if images:
                test_images.append({
                    'path': images[0],
                    'crop': crop_folder.name,
                    'disease': disease_folder.name
                })

print(f"Found {len(test_images)} crops to test")

# Test predictions
print("\n" + "=" * 80)
print("🤖 TESTING PREDICTIONS")
print("=" * 80 + "\n")

results = []

for i, test in enumerate(test_images, 1):
    img_path = test['path']
    expected_crop = test['crop']
    expected_disease = test['disease']
    
    print(f"Test {i}/{len(test_images)}: {expected_crop} - {expected_disease}")
    print(f"  Image: {img_path.name[:50]}")
    
    try:
        with open(img_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(API_URL, files=files, timeout=30)
        
        if response.status_code == 200:
            pred = response.json()
            pred_crop = pred.get('crop', 'Unknown').strip().lower()
            expected_crop_lower = expected_crop.lower()
            
            print(f"  Predicted: {pred_crop}")
            print(f"  Expected:  {expected_crop_lower}")
            
            if pred_crop == expected_crop_lower:
                print(f"  ✅ CORRECT!")
                results.append((1, expected_crop, expected_disease))
            else:
                print(f"  ❌ WRONG")
                results.append((0, expected_crop, expected_disease))
        else:
            print(f"  ❌ API Error {response.status_code}")
            results.append((0, expected_crop, expected_disease))
    
    except Exception as e:
        print(f"  ❌ Exception: {str(e)[:50]}")
        results.append((0, expected_crop, expected_disease))
    
    print()

# Summary
print("=" * 80)
print("📊 TEST RESULTS")
print("=" * 80)

correct = sum(r[0] for r in results)
total = len(results)
accuracy = (correct / total * 100) if total > 0 else 0

print(f"\nAccuracy: {correct}/{total} = {accuracy:.1f}%\n")

for correct_flag, crop, disease in results:
    status = "✅" if correct_flag else "❌"
    print(f"{status} {crop:15} - {disease}")

print("\n" + "=" * 80)
if accuracy == 100:
    print("✅✅✅ PERFECT! All predictions correct!")
elif accuracy >= 80:
    print("✅ GOOD! Most predictions correct.")
elif accuracy >= 50:
    print("⚠️  MODERATE - Need improvement")
else:
    print("❌ POOR - Model needs retraining")
print("=" * 80)
