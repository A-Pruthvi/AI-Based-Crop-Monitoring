"""
Verify organized dataset structure after cleanup
"""

import os
from pathlib import Path
from collections import defaultdict

print("=" * 80)
print("📊 DATASET VERIFICATION REPORT")
print("=" * 80)

bigdataset = Path("bigdataset")

if not bigdataset.exists():
    print("❌ bigdataset/ not found!")
    exit(1)

# Check organized crops
organized_path = bigdataset / "organized_by_crop_disease"
if organized_path.exists():
    print("\n🌾 ORGANIZED BY CROP/DISEASE:")
    print("-" * 80)
    
    total_organized = 0
    crop_count = defaultdict(int)
    
    for crop_folder in sorted(organized_path.iterdir()):
        if crop_folder.is_dir():
            crop_name = crop_folder.name
            crop_images = 0
            
            print(f"\n  📁 {crop_name}/")
            
            for disease_folder in sorted(crop_folder.iterdir()):
                if disease_folder.is_dir():
                    disease_name = disease_folder.name
                    images = len(list(disease_folder.glob("*.jpg"))) + len(list(disease_folder.glob("*.png")))
                    crop_images += images
                    print(f"      • {disease_name}: {images:,} images")
            
            total_organized += crop_images
            crop_count[crop_name] = crop_images
            print(f"      ✅ Total: {crop_images:,} images")
    
    print(f"\n{'=' * 80}")
    print(f"✅ TOTAL ORGANIZED: {total_organized:,} images")
    print(f"{'=' * 80}")

# Check train/val/test splits
splits = {"train": 0, "validation": 0, "test": 0}
split_details = defaultdict(lambda: defaultdict(int))

for split_name in splits.keys():
    split_path = bigdataset / split_name
    if split_path.exists():
        for img_file in split_path.rglob("*"):
            if img_file.is_file() and img_file.suffix.lower() in {'.jpg', '.png', '.jpeg'}:
                splits[split_name] += 1

print(f"\n📊 TRAIN/VALIDATION/TEST SPLIT:")
print("-" * 80)
total_split = 0
for split_name, count in splits.items():
    if count > 0:
        print(f"  • {split_name.capitalize()}: {count:,} images")
        total_split += count

if total_split > 0:
    print(f"  {'─' * 50}")
    print(f"  ✅ Total in splits: {total_split:,} images")
    train_pct = (splits['train'] / total_split * 100) if total_split > 0 else 0
    val_pct = (splits['validation'] / total_split * 100) if total_split > 0 else 0
    test_pct = (splits['test'] / total_split * 100) if total_split > 0 else 0
    print(f"  Distribution: {train_pct:.1f}% train, {val_pct:.1f}% val, {test_pct:.1f}% test")

# Check model files
print(f"\n🤖 MODEL FILES:")
print("-" * 80)
model_path = Path("model")
if model_path.exists():
    for model_file in sorted(model_path.glob("*.h5")):
        size = model_file.stat().st_size / (1024*1024)
        print(f"  • {model_file.name} ({size:.1f} MB)")
    
    for json_file in sorted(model_path.glob("*.json")):
        print(f"  • {json_file.name}")

print(f"\n{'=' * 80}")
print("✅ VERIFICATION COMPLETE!")
print("=" * 80)
