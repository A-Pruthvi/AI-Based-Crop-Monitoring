# Getting Real Disease Images for AI System

## Problem
The synthetic sample images we generated are limited. For production, you need **real disease photos** from authorized datasets.

## Solution: Use PlantVillage Dataset

PlantVillage is a **free, public dataset** with 54,000+ labeled plant disease images.

---

## Step-by-Step Guide

### Step 1: Download PlantVillage Dataset

**Option A: Direct Download (Easiest)**
1. Go to: https://github.com/PlantVillage/plantvillage-dataset
2. Click green **"Code"** button
3. Select **"Download ZIP"**
4. Wait for download (~2-3 GB)
5. Extract the ZIP file to your Downloads folder

**File structure after extract:**
```
plantvillage-dataset-master/
└── raw/
    ├── Apple___Apple_scab/
    ├── Apple___Black_rot/
    ├── Tomato___Early_blight/
    ├── Tomato___Late_blight/
    ├── Potato___Early_blight/
    ├── [50+ more disease folders]
```

**Option B: Using Git (if you have Git installed)**
```bash
git clone https://github.com/PlantVillage/plantvillage-dataset.git
cd plantvillage-dataset
```

---

### Step 2: Copy to Your Project

1. Navigate to extracted folder
2. Copy the **`raw`** folder
3. Paste it into your AI service folder:
   ```
   C:\Users\pruth\OneDrive\Desktop\EDP PROJECT VI SEM\ai-service\plantvillage_raw\
   ```

**Verify:** You should have:
- `plantvillage_raw/` folder
- Inside: `Apple___Apple_scab/`, `Tomato___Early_blight/`, etc.

---

### Step 3: Organize Images

Run the organization script:

```powershell
cd "C:\Users\pruth\OneDrive\Desktop\EDP PROJECT VI SEM\ai-service"
python organize_plantvillage.py
```

This script will:
- ✓ Find all disease images
- ✓ Map them to our crop/disease structure
- ✓ Split into train/validation (80/20)
- ✓ Copy to `dataset_multi_crop/` folder
- ✓ Print summary of organized images

**Output example:**
```
============================================================
ORGANIZE COMPLETE
============================================================

Total images copied: 8,432
Crops organized: 6

TOMATO:
  Diseases: 3
  Total images: 2,145
    - Early blight
    - Late blight
    - Septoria leaf spot

POTATO:
  Diseases: 2
  Total images: 1,890
    ...
```

---

### Step 4: Retrain Models with Real Images

Now train with real PlantVillage data:

```powershell
# Train crop classifier
python train_crop_simple.py

# Train disease classifiers for each crop
python train_diseases_multi.py

# Test inference
python test_inference_multi.py
```

**Expected improvements:**
- Crop accuracy: 51% → **85-95%**
- Disease accuracy: varies → **80-95%**
- Model generalization: Much better!

---

## Dataset Information

**PlantVillage Statistics:**
- **Total images:** 54,000+
- **Crops:** 14
- **Diseases:** 38
- **Format:** JPG, 224x224 pixels
- **License:** CC0 (Public Domain)
- **Size:** ~3-4 GB

**Available Crops:**
1. Apple
2. Blueberry
3. Cherry
4. Corn
5. Grape
6. Orange
7. Peach
8. Pepper (Bell)
9. Potato
10. Raspberry
11. Rice
12. Soybean
13. Squash
14. Strawberry
15. Tomato

---

## Alternative Datasets

If PlantVillage doesn't work, try:

### Option 1: Kaggle Datasets (Manual Download)
1. Visit: https://www.kaggle.com/datasets
2. Search: "plant disease"
3. Download manually (no API needed)
4. Organize using `organize_plantvillage.py` (modify paths)

**Popular Kaggle datasets:**
- Plant Disease Dataset
- PlantDoc Dataset
- CVPPP Dataset

### Option 2: Custom Dataset
1. Collect your own disease photos
2. Organize by crop and disease
3. Use `organize_plantvillage.py` as template
4. Retrain models

---

## Troubleshooting

**Q: PlantVillage folder not found?**
```
A: Make sure you:
1. Downloaded the ZIP file
2. Extracted it completely
3. Copied the 'raw' folder to: ai-service/plantvillage_raw/
4. Verified folder exists with images inside
```

**Q: organize_plantvillage.py not finding images?**
```
A: Check image file extensions:
- PlantVillage uses: .JPG or .jpg
- Script looks for: *.JPG, *.jpg, *.PNG, *.png
- If you see errors, edit the glob patterns in the script
```

**Q: File copy errors?**
```
A: Common causes:
1. Not enough disk space (need 4-5 GB free)
2. Permission issues (run as administrator)
3. Long file paths (Windows limit: 260 chars)

Solutions:
- Move plantvillage_raw to shorter path (e.g., C:\temp\)
- Or use external disk
```

**Q: Training time is very long?**
```
A: Expected times:
- With 5,000 images: ~1-2 hours per crop model
- Total for 10 crops: 20-30 hours
- Optimization: Reduce epochs or batch size in training scripts
```

---

## What Happens After Retraining?

Your system will have:
- ✅ Real disease images (PlantVillage)
- ✅ Trained crop classifier (10 crops)
- ✅ Trained disease classifiers (10 crops × 1-3 diseases each)
- ✅ Production-ready inference pipeline
- ✅ 80-95% accuracy on new images

**You can then:**
1. Deploy to web/API
2. Create REST endpoints
3. Connect to frontend dashboard
4. Use for real-time disease detection

---

## Example Console Output

```powershell
PS C:\...\ai-service> python organize_plantvillage.py

======================================================================
PLANTVILLAGE DATASET ORGANIZER
======================================================================

✓ PlantVillage path found: C:\...\ai-service\plantvillage_raw\

Available disease folders: 38
  - Apple___Apple_scab
  - Apple___Black_rot
  - Tomato___Early_blight
  ...

======================================================================
ORGANIZING PLANTVILLAGE IMAGES
======================================================================

Tomato___Early_blight
  → TOMATO / Early blight
  Copied: 452 train, 113 val

Tomato___Late_blight
  → TOMATO / Late blight
  Copied: 389 train, 97 val

...

======================================================================
ORGANIZATION COMPLETE
======================================================================

Total images copied: 8,432
Crops organized: 6

TOMATO:
  Diseases: 3
  Total images: 1,189
    - Early blight
    - Late blight
    - Septoria leaf spot

✓ Ready to retrain models with real PlantVillage images!
```

---

## Next Steps

1. **Download PlantVillage:** https://github.com/PlantVillage/plantvillage-dataset/archive/master.zip
2. **Extract and place** in `plantvillage_raw/` folder
3. **Run:** `python organize_plantvillage.py`
4. **Retrain:** `python train_crop_simple.py` and `python train_diseases_multi.py`
5. **Test:** `python test_inference_multi.py`
6. **Deploy:** Create REST API and connect to frontend

Your production AI system will be ready! 🎉
