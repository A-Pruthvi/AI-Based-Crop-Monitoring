# Crop Disease Detection Model

## Quick Start — Train Your Own Model

### Step 1: Install Dependencies
```bash
cd ai-service
pip install -r requirements.txt
```

### Step 2: Get the Dataset

**Option A — Download from Kaggle (automated):**
```bash
pip install kaggle
# Place your kaggle.json API key in ~/.kaggle/
python download_dataset.py
```

**Option B — Download from Kaggle (manual):**
1. Go to https://www.kaggle.com/datasets/vbookshelf/rice-leaf-diseases
2. Click "Download" and extract the ZIP into `ai-service/raw_data/`
3. Organize it:
```bash
python prepare_dataset.py organize --source raw_data
python prepare_dataset.py rename --dataset dataset
```

**Option C — Use your own images:**
Create this folder structure with your images (50+ images per class recommended):
```
dataset/train/Healthy/
dataset/train/Bacterial_Blight/
dataset/train/Brown_Spot/
dataset/train/Leaf_Blast/
...
```

### Step 3: Verify Dataset
```bash
python prepare_dataset.py verify --dataset dataset
```

### Step 4: Train the Model
```bash
python train_model.py --dataset dataset --epochs 20 --batch_size 32
```

This will save `crop_disease_model.h5` in this folder. The AI service will automatically load it on startup.

### Step 5: Start the AI Service
```bash
python app.py
```
The service will detect and load `model/crop_model.h5` automatically.

---

## Model Details

- **Architecture**: VGG16 (transfer learning from ImageNet)
- **Input Shape**: (224, 224, 3) — RGB images
- **Output**: Softmax over N disease classes
- **Training**: 2-phase (frozen base → fine-tune top layers)

## Files After Training

| File | Description |
|------|-------------|
| `crop_disease_model.h5` | Trained Keras model |
| `class_indices.json` | Maps model output indices to disease names |
| `training_history.json` | Loss/accuracy per epoch |

## Disease Classes (default 10):

| Index | Disease |
|-------|---------|
| 0 | Healthy |
| 1 | Bacterial Blight |
| 2 | Brown Spot |
| 3 | Leaf Blast |
| 4 | Leaf Rust |
| 5 | Tungro |
| 6 | Sheath Blight |
| 7 | False Smut |
| 8 | Hispa |
| 9 | Neck Blast |

> **Note**: The model automatically adapts to however many classes are in your dataset. If you only have 4 classes, it will train a 4-class model.

## Without Model
When `crop_disease_model.h5` is not present, the AI service runs in **simulation mode** — it returns realistic mock predictions for development and testing.
