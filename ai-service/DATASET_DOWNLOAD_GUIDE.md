# 📥 Complete Dataset Download & Organization Guide

## 🎯 Overview

This guide walks you through downloading datasets from Kaggle for all 10 crops and organizing them for training.

**Timeline:** ~30-60 minutes (depending on internet speed)

---

## 📋 What You'll Do

1. ✅ Set up Kaggle API credentials
2. ✅ Download datasets for 10 crops
3. ✅ Organize data into training structure
4. ✅ Verify dataset integrity
5. ✅ Start training

---

## 🔑 Step 1: Set Up Kaggle API Credentials

### Option A: Windows GUI (Easiest)

1. **Visit Kaggle Account Settings**
   - Go to: https://www.kaggle.com/settings/account
   - Click "Create New API Token"
   - A file `kaggle.json` will download

2. **Place the file in correct location**
   - Open File Explorer
   - Navigate to: `C:\Users\[YourUsername]\.kaggle\`
   - If `.kaggle` folder doesn't exist, create it
   - Copy `kaggle.json` into `.kaggle` folder

3. **Verify it's in the right place**
   ```
   C:\Users\[YourUsername]\.kaggle\kaggle.json
   ```

### Option B: Command Line

**Windows PowerShell:**
```powershell
# Create .kaggle directory
mkdir $env:USERPROFILE\.kaggle -Force

# Copy kaggle.json (after downloading from Kaggle)
Copy-Item .\kaggle.json $env:USERPROFILE\.kaggle\
```

**Linux/Mac:**
```bash
mkdir -p ~/.kaggle
cp kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json
```

---

## 📥 Step 2: Install Required Packages

Run this in your terminal (from ai-service directory):

```powershell
# Activate venv
.\.venv\Scripts\Activate.ps1

# Install Kaggle API
pip install kaggle

# Verify installation
python -c "from kaggle.api.kaggle_api_extended import KaggleApi; print('✓ Kaggle API installed')"
```

---

## 🚀 Step 3: Download Datasets

### Option A: Automated Download (Recommended)

```powershell
# From ai-service directory
.\.venv\Scripts\python.exe download_kaggle_datasets.py
```

**What this does:**
- Checks Kaggle credentials
- Downloads datasets for all 10 crops
- Saves to: `ai-service/downloads_raw/`
- Takes ~15-30 minutes depending on internet

**Expected output:**
```
======================================================================
🌾 MULTI-CROP DISEASE DATASET DOWNLOADER
======================================================================

[1/3] Checking Kaggle credentials...
✅ Kaggle credentials found

[2/3] Checking Kaggle API...
✅ Kaggle API already installed

[3/3] Creating dataset structure...
✅ Dataset structure created

======================================================================
📥 STARTING DOWNLOADS
======================================================================

[1/10] Rice
   Rice leaf diseases (Brown Spot, Leaf Smut, Blast)
📥 Downloading Rice dataset...
✅ Rice downloaded to: downloads_raw/Rice

... (9 more crops)

======================================================================
✅ DOWNLOAD SUMMARY
======================================================================
✓ Downloaded: 10/10
✗ Failed: 0/10
```

### Option B: Manual Download (If automated fails)

**Recommended Datasets List:**

```
1. Rice
   - Kaggle: https://www.kaggle.com/datasets/vbookshelf/rice-leaf-disease-dataset
   - Extract to: downloads_raw/Rice/

2. Tomato
   - Kaggle: https://www.kaggle.com/datasets/noulam/tomato
   - Extract to: downloads_raw/Tomato/

3. Potato
   - Kaggle: https://www.kaggle.com/datasets/evision/potato-disease-dataset-in-deep-learning
   - Extract to: downloads_raw/Potato/

4. Multi-crop (Wheat, Corn, Pepper, Apple, Grape, Banana, Mango)
   - Kaggle: https://www.kaggle.com/datasets/vipoooool/new-plant-diseases-dataset
   - Extract to: downloads_raw/
   - This will contain subdirectories for each crop
```

**Manual Steps:**
1. Visit dataset link
2. Click "Download" button
3. Extract ZIP file
4. Move to appropriate `downloads_raw/[crop_name]/` directory

---

## 🔄 Step 4: Organize Downloaded Data

After downloading, organize data into proper training structure:

```powershell
.\.venv\Scripts\python.exe organize_datasets.py
```

**What this does:**
- Reads raw downloads from `downloads_raw/`
- Organizes by crop → disease
- Splits into 80% train, 20% validation
- Creates proper folder structure
- Takes ~5-10 minutes

**Expected output:**
```
======================================================================
📁 DATASET ORGANIZATION UTILITY
======================================================================

📍 Source: C:\...\ai-service\downloads_raw
📍 Destination: C:\...\ai-service\dataset_multi_crop

📊 Found 10 downloaded datasets:
   • Rice
   • Tomato
   • Potato
   • Wheat
   • Corn
   • Pepper
   • Apple
   • Grape
   • Banana
   • Mango

======================================================================
🔄 ORGANIZING DATASETS
======================================================================

📂 Organizing Rice...
   ✓ Brown Spot: 120 images
   ✓ Leaf Smut: 110 images
   ✓ Bacterial Blight: 108 images

📂 Organizing Tomato...
   ✓ Early Blight: 1000 images
   ✓ Late Blight: 950 images
   ✓ Leaf Mold: 920 images

... (8 more crops)

======================================================================
✅ ORGANIZATION SUMMARY
======================================================================
Total images organized: 8347

📊 Dataset verification:
   Rice: 338 train + 85 validation
   Tomato: 2385 train + 596 validation
   Potato: 1520 train + 380 validation
   ... (7 more)

✅ Ready for training!
```

---

## ✅ Step 5: Verify Dataset Structure

Check that everything is organized correctly:

```powershell
# List dataset structure
tree dataset_multi_crop -L 3

# Or PowerShell equivalent
Get-ChildItem -Recurse dataset_multi_crop | Where-Object {$_.PSIsContainer} | ForEach-Object {$_.FullName}
```

**Expected structure:**
```
dataset_multi_crop/
├── Rice/
│   ├── train/
│   │   ├── Brown Spot/        (40+ images)
│   │   ├── Leaf Smut/         (40+ images)
│   │   └── Bacterial Blight/  (40+ images)
│   └── validation/
│       ├── Brown Spot/        (8+ images)
│       ├── Leaf Smut/         (8+ images)
│       └── Bacterial Blight/  (8+ images)
├── Tomato/
│   ├── train/
│   │   ├── Early Blight/
│   │   ├── Late Blight/
│   │   └── Leaf Mold/
│   └── validation/
├── ... (8 more crops)
├── combined_train/
│   ├── Rice/
│   ├── Tomato/
│   └── ... (10 crops total)
└── combined_validation/
    ├── Rice/
    └── ... (10 crops)
```

---

## 🎯 Step 6: Count Your Data

Run this quick script to see how many images you have:

```powershell
$basedir = "dataset_multi_crop"
Get-ChildItem $basedir -Recurse -Filter "*.jpg" | Measure-Object | Select Count

# Or by crop:
foreach ($crop in @('Rice','Tomato','Potato','Wheat','Corn','Pepper','Apple','Grape','Banana','Mango')) {
    $count = (Get-ChildItem "$basedir\$crop" -Recurse -Filter "*.jpg" | Measure-Object).Count
    Write-Host "$crop : $count images"
}
```

**Target totals:**
- **Minimum per crop:** 40 training images (lower accuracy ~70%)
- **Recommended:** 100-200 training images (good accuracy ~82%)
- **Ideal:** 300+ training images (excellent accuracy ~88%)
- **Total for all 10 crops:** 2000-3000 images minimum

---

## 🚀 Step 7: Start Training

Once data is organized, start training:

```powershell
# Terminal 1: Train crop classifier (Stage 1)
.\.venv\Scripts\python.exe train_crop_classifier_multi.py

# Terminal 2 (parallel): Train disease classifiers (Stage 2)  
.\.venv\Scripts\python.exe train_multi_crop_diseases.py

# Or sequential:
# First, wait for crop classifier to finish, then run disease classifiers
```

**Expected training time:**
- Crop classifier: 10-20 minutes
- Each disease classifier: 3-5 minutes
- **Total:** 1-2 hours for all 10 crops

---

## ⚠️ Troubleshooting

### Issue: "Kaggle credentials not found"

**Solution:**
```powershell
# Check if file exists
Test-Path $env:USERPROFILE\.kaggle\kaggle.json

# If not, visit: https://www.kaggle.com/settings/account
# Create New API Token
# Save to: C:\Users\[YourUsername]\.kaggle\kaggle.json
```

### Issue: "No images found" after download

**Solution:**
- Check `downloads_raw/` directory
- Make sure ZIP files were extracted properly
- Try manual download option

### Issue: Download keeps failing

**Solution:**
```powershell
# Retry with specific dataset
python -c "
from download_kaggle_datasets import download_dataset
download_dataset('vbookshelf/rice-leaf-disease-dataset', 'Rice')
"
```

### Issue: Out of disk space

**Solution:**
- Estimated space needed: 5-10 GB
- Check free space: `Get-Volume`
- If low, download fewer datasets or delete old downloads
- Use external drive if needed

### Issue: Slow internet

**Solution:**
- Download can be split into multiple sessions
- Download one crop at a time
- Try downloading during off-peak hours

---

## 📊 Datasets Used

| Crop | Dataset | Images | Diseases |
|------|---------|--------|----------|
| Rice | Rice Leaf Disease (Kaggle) | 200-300 | Brown Spot, Leaf Smut, Blight |
| Tomato | Tomato Disease (Kaggle) | 3000+ | Early Blight, Late Blight, Leaf Mold |
| Potato | Potato Disease (Kaggle) | 1900+ | Early Blight, Late Blight |
| Wheat | New Plant Diseases | 1000+ | Powdery Mildew, Septoria |
| Corn | New Plant Diseases | 1000+ | Common Rust, Leaf Blight |
| Pepper | New Plant Diseases | 500+ | Bacterial Spot |
| Apple | New Plant Diseases | 1000+ | Scab, Black Rot |
| Grape | New Plant Diseases | 1000+ | Black Rot, Leaf Blight |
| Banana | New Plant Diseases | 500+ | Sigatoka |
| Mango | New Plant Diseases | 500+ | Anthracnose |

**Total:** ~10,000+ images for better accuracy

---

## 📈 Next Steps After Download

1. **Verify data** ✅
2. **Train crop classifier** → `train_crop_classifier_multi.py`
3. **Train disease classifiers** → `train_multi_crop_diseases.py`
4. **Test inference** → `prediction_pipeline_multi_crop.py`
5. **Deploy** → Create REST API or web interface

---

## 🎓 Learning Resources

- [Kaggle API Documentation](https://github.com/Kaggle/kaggle-api)
- [Plant Disease Image Collections](https://www.kaggle.com/search?query=plant+disease)
- [VGG16 Transfer Learning](https://keras.io/api/applications/vgg/#vgg16)
- [Data Augmentation Best Practices](https://datascience.stackexchange.com/questions/tagged/data-augmentation)

