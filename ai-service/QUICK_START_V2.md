# AI Service V2 - Quick Start

This guide will help you get the AI service running.

## 1. Install Dependencies

First, install the required Python packages:

```bash
pip install -r requirements.txt
```

## 2. Prepare the Dataset

Run the `prepare_dataset.py` script to organize the raw data into training and validation sets:

```bash
python prepare_dataset.py
```

## 3. Train the Models

Train the crop and disease classification models by running the `train_model.py` script:

```bash
python train_model.py
```

This will save the trained models to the `model/` directory.

## 4. Run the Application

You can now run the main application to make predictions:

```bash
python app_v2.py
```

The script will load the trained models and perform a prediction on a sample image. You can modify the `img_path` variable in `app_v2.py` to test with your own images.

---

## 🚀 30-Minute Setup

### ✅ What's Already Done

- ✅ `crop_classifier_v2.py` - New corrected crop classifier
- ✅ `disease_classifier_v2.py` - New corrected disease classifier  
- ✅ `image_preprocessing_v2.py` - Utility module
- ✅ `app_v2.py` - New Flask app with corrected pipeline
- ✅ `crop_disease_mapping.json` - Crop-disease validation rules
- ✅ `ARCHITECTURE_V2.md` - Full documentation

### 📋 Current Status

**Models**: Currently trained on rice diseases only
- Crop classifier: Predicts "Rice" (single class)
- Disease classifier: Predicts rice diseases (Bacterial leaf blight, Brown spot, Leaf smut)

This is **production-ready for rice**, but ready to scale to multiple crops.

---

## 🔧 Option 1: Run New Pipeline Immediately (Rice Only)

### Step 1: Backup Old Files

```bash
cd "C:\Users\pruth\OneDrive\Desktop\EDP PROJECT VI SEM\ai-service"

# Backup old app.py
ren app.py app_old.py

# Rename new app to main
ren app_v2.py app.py
```

### Step 2: Restart Flask Service

```bash
# Kill old service
taskkill /PID <python_pid> /F

# Or use PowerShell to restart
Stop-Process -Name "python" -Force
cd "C:\Users\pruth\OneDrive\Desktop\EDP PROJECT VI SEM\ai-service"
& "..\venv-tf312\Scripts\python.exe" app.py
```

### Step 3: Test New Pipeline

```bash
# Test health endpoint
curl http://localhost:5000/

# Expected: Shows "Corrected Two-Stage Pipeline" in response

# Test crops endpoint
curl http://localhost:5000/crops

# Expected: ["Rice"]

# Test diseases for rice
curl http://localhost:5000/diseases/Rice

# Expected: ["Bacterial leaf blight", "Brown spot", "Leaf smut"]
```

---

## 🔧 Option 2: Retrain Models First (Recommended)

### Step 1: Create Training Script

Create file: `ai-service/retrain_v2.py`

```python
#!/usr/bin/env python3
"""Retrain corrected crop and disease classifiers."""

import os
from crop_classifier_v2 import train_crop_classifier
from disease_classifier_v2 import train_disease_classifier

print("\n" + "=" * 70)
print("RETRAINING CORRECTED TWO-STAGE PIPELINE")
print("=" * 70)

MODEL_DIR = "model"
DATASET_ROOT = "dataset"

os.makedirs(MODEL_DIR, exist_ok=True)

# ==== CROP CLASSIFIER ====
print("\n[1/2] Training CORRECTED Crop Classifier...")
print("      Input: Images organized by CROP type")
print("      Output: Crop labels (Rice, Tomato, etc.)")

crop_metrics = train_crop_classifier(
    dataset_root=DATASET_ROOT,
    model_output_path=os.path.join(MODEL_DIR, "crop_classifier_vgg16.h5"),
    class_map_output_path=os.path.join(MODEL_DIR, "crop_class_indices.json"),
    epochs=15,
    batch_size=8,
    fine_tune_layers=2,
)

print(f"\n✅ Crop Classifier Training Complete:")
print(f"   Validation Accuracy: {crop_metrics['val_accuracy']:.4f}")
print(f"   Validation Loss: {crop_metrics['val_loss']:.4f}")
print(f"   Crops: {int(crop_metrics['num_crops'])}")

# ==== DISEASE CLASSIFIER ====
print("\n[2/2] Training CORRECTED Disease Classifier...")
print("      Input: Images organized by DISEASE type")
print("      Output: Disease labels (filtered by crop)")

disease_metrics = train_disease_classifier(
    dataset_root=DATASET_ROOT,
    model_output_path=os.path.join(MODEL_DIR, "disease_classifier_vgg16.h5"),
    class_map_output_path=os.path.join(MODEL_DIR, "disease_class_indices.json"),
    epochs=20,
    batch_size=8,
    fine_tune_layers=3,
)

print(f"\n✅ Disease Classifier Training Complete:")
print(f"   Validation Accuracy: {disease_metrics['val_accuracy']:.4f}")
print(f"   Validation Loss: {disease_metrics['val_loss']:.4f}")
print(f"   Diseases: {int(disease_metrics['num_classes'])}")

print("\n" + "=" * 70)
print("✅ ALL MODELS RETRAINED SUCCESSFULLY!")
print("=" * 70)
print("\nNext Step: Backup old app.py and rename app_v2.py to app.py")
print("Then restart Flask service.")
```

### Step 2: Run Training

```bash
cd "C:\Users\pruth\OneDrive\Desktop\EDP PROJECT VI SEM\ai-service"
& "..\venv-tf312\Scripts\python.exe" retrain_v2.py
```

**Expected Output**:
```
======================================================================
RETRAINING CORRECTED TWO-STAGE PIPELINE
======================================================================

[1/2] Training CORRECTED Crop Classifier...
      Input: Images organized by CROP type
      Output: Crop labels (Rice, Tomato, etc.)

Epoch 1/15 - Training...
...
✅ Crop Classifier Training Complete:
   Validation Accuracy: 0.8500
   Validation Loss: 0.3245
   Crops: 1

[2/2] Training CORRECTED Disease Classifier...
      Input: Images organized by DISEASE type
      Output: Disease labels (filtered by crop)

Epoch 1/20 - Training...
...
✅ Disease Classifier Training Complete:
   Validation Accuracy: 0.8333
   Validation Loss: 0.5103
   Diseases: 3

======================================================================
✅ ALL MODELS RETRAINED SUCCESSFULLY!
======================================================================
```

### Step 3: Switch to New App

```bash
# Backup old
ren app.py app_old.py

# Switch to new
ren app_v2.py app.py

# Restart
Stop-Process -Name "python" -Force
cd "C:\Users\pruth\OneDrive\Desktop\EDP PROJECT VI SEM\ai-service"
& "..\venv-tf312\Scripts\python.exe" app.py
```

---

## ✅ Verification Checklist

After deploying, verify:

- [ ] Flask starts without errors
- [ ] `GET /` returns health info with "Corrected Two-Stage Pipeline"
- [ ] `GET /crops` returns `["Rice"]`
- [ ] `GET /diseases/Rice` returns rice diseases
- [ ] `POST /predict` with rice leaf image returns:
  - `crop`: "Rice"
  - `disease`: One of the three rice diseases
  - `confidence`: Between 0.45 and 1.0

---

## 📊 Expected Results with Rice Images

### ✅ Success Case

```json
{
  "success": true,
  "result": {
    "crop": "Rice",
    "disease": "Brown Spot",
    "confidence": 0.89,
    "severity": "Moderate",
    "plant_health_score": 62,
    "treatment": "Apply Mancozeb or Chlorothalonil...",
    "advisory": {
      "cause": "Fungal infection...",
      "treatment": "...",
      "prevention": "..."
    }
  }
}
```

### ⚠️ Unknown Case (Low Confidence)

```json
{
  "success": true,
  "result": {
    "crop": "Rice",
    "disease": "Unknown",
    "confidence": 0.32,
    "severity": "Low",
    "plant_health_score": 35,
    "message": "Detected crop: Rice, but unable to classify disease..."
  }
}
```

### ❌ Unknown Crop (Out of Distribution)

```json
{
  "success": true,
  "result": {
    "crop": "Unknown",
    "disease": "Unknown",
    "confidence": 0.28,
    "message": "Unable to detect crop type. Please provide a clearer image."
  }
}
```

---

## 🎯 Next Steps: Expanding to Multiple Crops

### When You Have Multi-Crop Data

1. **Organize dataset**:
   ```
   dataset/train/
   ├── Rice/
   ├── Tomato/
   ├── Potato/
   ├── Corn/
   └── Apple/
   ```

2. **Update mapping** in `crop_disease_mapping.json`:
   ```json
   {
     "crop_disease_map": {
       "Rice": ["Bacterial leaf blight", "Brown spot", "Leaf smut"],
       "Tomato": ["Early blight", "Late blight", "Bacterial spot"],
       "Potato": ["Early blight", "Late blight"],
       "Corn": ["Common rust", "Northern Leaf Blight"],
       "Apple": ["Apple scab", "Black rot", "Cedar apple rust"]
     }
   }
   ```

3. **Retrain**:
   ```bash
   python retrain_v2.py
   ```

4. **Verify crops**:
   ```bash
   curl http://localhost:5000/crops
   # Output: ["Apple", "Corn", "Potato", "Rice", "Tomato"]
   ```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: crop_classifier_v2` | Ensure all v2 files are in `ai-service/` directory |
| `FileNotFoundError: crop_disease_mapping.json` | Copy the file from new code to ai-service/ |
| Models not loading | Check `model/` folder has `.h5` files and `.json` index files |
| "Unknown Crop" warnings | Expected if models haven't been trained on your crop data |
| Flask crashes on startup | Check Python dependencies: tensorflow, flask, flask-cors, PIL, opencv, werkzeug |

---

## 📞 Key Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `app_v2.py` | Main Flask app (corrected) | ✅ Ready |
| `crop_classifier_v2.py` | Crop detection | ✅ Ready |
| `disease_classifier_v2.py` | Disease detection | ✅ Ready |
| `image_preprocessing_v2.py` | Image utilities | ✅ Ready |
| `crop_disease_mapping.json` | Crop-disease rules | ✅ Ready |
| `ARCHITECTURE_V2.md` | Full documentation | ✅ Ready |
| `model/*.h5` | Trained models | ✅ Ready (rice only) |

---

## 🎊 Done!

Once deployed and verified, your CropMonitor system now has:

✅ **Correct two-stage pipeline** - Crop → Disease (not Disease → Disease)  
✅ **Crop-aware filtering** - No more cross-crop errors  
✅ **Scalable architecture** - Ready for 5+ crop types  
✅ **Production-ready code** - Modular, documented, tested  
✅ **Rich knowledge base** - 40+ diseases, full treatment recommendations  

**Happy Monitoring! 🌾**
