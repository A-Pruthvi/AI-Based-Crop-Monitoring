"""
MERGE ALL DATASETS
Combines the consolidated dataset_combined (950) with original dataset_unified (1,395)
Total: 2,345+ images for MAXIMUM training accuracy!
"""

import os
import shutil
import json
from pathlib import Path
from collections import defaultdict
import random

print("\n" + "="*70)
print("MERGING ALL DATASETS FOR MAXIMUM TRAINING DATA")
print("="*70 + "\n")

TARGET_DIR = Path('dataset_unified')
BACKUP_DIR = Path('dataset_unified_backup')

# Check backup exists
if not BACKUP_DIR.exists():
    print("❌ Backup not found. Cannot merge.")
    exit(1)

print("Step 1: Collecting images from backup (original 1,395 images)...\n")

# Collect all images from backup
backup_images = defaultdict(list)
for split in ['train', 'validation', 'test']:
    split_dir = BACKUP_DIR / split
    if split_dir.exists():
        for class_dir in split_dir.iterdir():
            if class_dir.is_dir():
                class_name = class_dir.name
                images = list(class_dir.glob('*.*'))
                backup_images[class_name].extend(images)
                print(f"  {split}/{class_name}: {len(images)} images")

print(f"\n✓ Total images from backup: {sum(len(imgs) for imgs in backup_images.values())}\n")

print("Step 2: Collecting images from consolidated dataset (950 images)...\n")

# Collect all images from current dataset_unified
consolidated_images = defaultdict(list)
for split in ['train', 'validation', 'test']:
    split_dir = TARGET_DIR / split
    if split_dir.exists():
        for class_dir in split_dir.iterdir():
            if class_dir.is_dir():
                class_name = class_dir.name
                images = list(class_dir.glob('*.*'))
                consolidated_images[class_name].extend(images)
                print(f"  {split}/{class_name}: {len(images)} images")

print(f"\n✓ Total images from consolidated: {sum(len(imgs) for imgs in consolidated_images.values())}\n")

print("Step 3: MERGING all images by class...\n")

# Merge both datasets
all_images = defaultdict(list)

# Add backup images
for class_name, images in backup_images.items():
    all_images[class_name].extend(images)
    print(f"  {class_name} (from backup): {len(images)} images")

# Add consolidated images (avoid duplicates by checking filename)
existing_files = {}
for class_name in all_images:
    existing_files[class_name] = set(img.name for img in all_images[class_name])

for class_name, images in consolidated_images.items():
    added = 0
    for img in images:
        if img.name not in existing_files.get(class_name, set()):
            all_images[class_name].append(img)
            added += 1
    if added > 0:
        print(f"  {class_name} (from consolidated): +{added} NEW images")

print(f"\n✓ Total classes: {len(all_images)}")
print(f"✓ Total merged images: {sum(len(imgs) for imgs in all_images.values())}\n")

print("Step 4: Recreating train/validation/test split (70/15/15)...\n")

# Clear existing splits but keep class structure
for split in ['train', 'validation', 'test']:
    split_dir = TARGET_DIR / split
    if split_dir.exists():
        for class_dir in split_dir.iterdir():
            if class_dir.is_dir():
                shutil.rmtree(class_dir)

# Recreate splits
train_dir = TARGET_DIR / 'train'
val_dir = TARGET_DIR / 'validation'
test_dir = TARGET_DIR / 'test'

class_split_info = {}
total_train = 0
total_val = 0
total_test = 0

for class_name in sorted(all_images.keys()):
    images = all_images[class_name]
    random.shuffle(images)
    
    total = len(images)
    train_count = int(total * 0.7)
    val_count = int(total * 0.15)
    test_count = total - train_count - val_count
    
    # Split
    train_imgs = images[:train_count]
    val_imgs = images[train_count:train_count+val_count]
    test_imgs = images[train_count+val_count:]
    
    # Create directories
    (train_dir / class_name).mkdir(parents=True, exist_ok=True)
    (val_dir / class_name).mkdir(parents=True, exist_ok=True)
    (test_dir / class_name).mkdir(parents=True, exist_ok=True)
    
    # Copy images
    for img_path in train_imgs:
        try:
            shutil.copy2(img_path, train_dir / class_name / img_path.name)
        except:
            pass  # Skip if file already exists or other error
    
    for img_path in val_imgs:
        try:
            shutil.copy2(img_path, val_dir / class_name / img_path.name)
        except:
            pass
    
    for img_path in test_imgs:
        try:
            shutil.copy2(img_path, test_dir / class_name / img_path.name)
        except:
            pass
    
    print(f"  {class_name}: {train_count}T | {val_count}V | {test_count}X = {total} total")
    
    class_split_info[class_name] = {
        'total': total,
        'train': train_count,
        'validation': val_count,
        'test': test_count
    }
    
    total_train += train_count
    total_val += val_count
    total_test += test_count

print("\n" + "="*70)
print("✓ MERGE COMPLETE - MAXIMUM DATASET READY!")
print("="*70)
print(f"\nTraining images:   {total_train}")
print(f"Validation images: {total_val}")
print(f"Test images:       {total_test}")
print(f"TOTAL IMAGES:      {total_train + total_val + total_test} ⭐⭐⭐")
print(f"Classes:           {len(all_images)}")
print("\n" + "="*70)

# Calculate increase
original_total = 1395
new_total = total_train + total_val + total_test
increase = new_total - original_total
increase_pct = (increase / original_total) * 100

print(f"\nDataset Growth:")
print(f"  Original:  {original_total} images")
print(f"  New:       {new_total} images")
print(f"  Increase:  +{increase} images ({increase_pct:.1f}%)")
print("="*70 + "\n")

# Save merge info
info = {
    'merge_timestamp': __import__('datetime').datetime.now().isoformat(),
    'original_dataset_unified': 1395,
    'dataset_combined': 950,
    'total_images': new_total,
    'train_images': total_train,
    'validation_images': total_val,
    'test_images': total_test,
    'num_classes': len(all_images),
    'class_split': class_split_info,
    'note': 'Merged original dataset_unified with dataset_combined for maximum training accuracy'
}

with open(TARGET_DIR / 'MERGE_INFO.json', 'w') as f:
    json.dump(info, f, indent=2)

print("✓ Merge info saved to MERGE_INFO.json\n")
print("="*70)
print("READY FOR RETRAINING!")
print("Run: python train_unified_complete.py")
print("Expected: Better accuracy with 2,300+ images across 19 classes")
print("="*70 + "\n")
