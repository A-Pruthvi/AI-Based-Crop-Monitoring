"""
COMPREHENSIVE DATASET CONSOLIDATION SCRIPT
Moves all photos from multiple dataset folders into ONE unified 'bigdataset' folder
Then deletes the original folders
"""

import os
import shutil
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

print("=" * 80)
print("🔄 CONSOLIDATING ALL DATASETS INTO BIGDATASET FOLDER")
print("=" * 80)

# Define all source folders to consolidate
SOURCE_FOLDERS = [
    'dataset_combined',
    'dataset_multi_crop',
    'dataset_multi_crop_synthetic',
    'dataset_preprocessed',
    'dataset',
    'dataset_unified_backup',
    'dataset_unified_backup_complete',
    'plantvillage_raw',
    'raw_data',
    'test_final',
    'train_final',
    'val_final',
    'downloads_raw',
    'dataset_unified',  # Include current dataset_unified last
]

# Paths
BASE_DIR = Path.cwd()
BIGDATASET_DIR = BASE_DIR / 'bigdataset'
BIGDATASET_IMAGES = BIGDATASET_DIR / 'all_images'
CONSOLIDATION_LOG = BIGDATASET_DIR / 'consolidation_log.json'

# Create bigdataset structure
print("\n📁 Creating bigdataset folder structure...")
BIGDATASET_DIR.mkdir(exist_ok=True)
BIGDATASET_IMAGES.mkdir(exist_ok=True)

# Track consolidation
consolidation_data = {
    'timestamp': datetime.now().isoformat(),
    'total_images_moved': 0,
    'sources': {},
    'folder_structure': defaultdict(int),
    'duplicate_files': [],
    'errors': [],
    'deleted_folders': []
}

# Image extensions to copy
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff', '.webp'}

def count_images(folder_path):
    """Count images in a folder recursively"""
    count = 0
    if not folder_path.exists():
        return count
    for ext in IMAGE_EXTENSIONS:
        count += len(list(folder_path.rglob(f'*{ext}')))
        count += len(list(folder_path.rglob(f'*{ext.upper()}')))
    return count

# Step 1: Scan all source folders
print("\n📊 SCANNING ALL SOURCE FOLDERS...")
print("-" * 80)

for folder_name in SOURCE_FOLDERS:
    folder_path = BASE_DIR / folder_name
    if not folder_path.exists():
        print(f"⏭️  SKIP (not found): {folder_name}/")
        continue
    
    image_count = count_images(folder_path)
    if image_count > 0:
        print(f"✅ {folder_name:40} | {image_count:5} images")
        consolidation_data['sources'][folder_name] = {
            'path': str(folder_path),
            'image_count': image_count
        }
    else:
        print(f"⚠️  EMPTY: {folder_name:40} | 0 images")

# Step 2: Move all images to bigdataset
print("\n📦 MOVING ALL IMAGES TO BIGDATASET...")
print("-" * 80)

moved_count = 0
total_count = sum(src['image_count'] for src in consolidation_data['sources'].values())

for folder_name in SOURCE_FOLDERS:
    folder_path = BASE_DIR / folder_name
    if not folder_path.exists():
        continue
    
    folder_images = count_images(folder_path)
    if folder_images == 0:
        continue
    
    print(f"\n→ Processing: {folder_name}/ ({folder_images} images)")
    
    # Find and copy all images
    for image_file in sorted(folder_path.rglob('*')):
        if image_file.is_file() and image_file.suffix.lower() in IMAGE_EXTENSIONS:
            try:
                # Create destination filename with source folder prefix to avoid duplicates
                dest_filename = f"{folder_name}_{image_file.name}"
                dest_path = BIGDATASET_IMAGES / dest_filename
                
                # Check for existing file
                if dest_path.exists():
                    # If same file, skip; if different, track duplicate
                    if image_file.stat().st_size != dest_path.stat().st_size:
                        consolidation_data['duplicate_files'].append({
                            'source': str(image_file),
                            'destination': str(dest_path),
                            'action': 'skipped_duplicate'
                        })
                    moved_count += 1
                else:
                    # Copy file
                    shutil.copy2(image_file, dest_path)
                    moved_count += 1
                    
                    # Track file organization
                    crop_disease = image_file.parent.name
                    consolidation_data['folder_structure'][crop_disease] += 1
                    
            except Exception as e:
                error_msg = f"Error copying {image_file}: {str(e)}"
                print(f"  ❌ {error_msg}")
                consolidation_data['errors'].append(error_msg)
    
    print(f"  ✅ Completed: {folder_images} images processed")

consolidation_data['total_images_moved'] = moved_count

print("\n" + "=" * 80)
print(f"✅ TOTAL IMAGES MOVED: {moved_count} images")
print("=" * 80)

# Step 3: Delete original folders
print("\n🗑️  DELETING ORIGINAL FOLDERS...")
print("-" * 80)

folders_to_delete = []
for folder_name in SOURCE_FOLDERS:
    folder_path = BASE_DIR / folder_name
    if folder_path.exists():
        folders_to_delete.append(folder_name)

if folders_to_delete:
    print(f"\n⚠️  FOLDERS TO DELETE ({len(folders_to_delete)}):")
    for folder_name in folders_to_delete:
        print(f"  • {folder_name}/")
    
    # Confirm deletion
    confirm = input("\n🔴 DELETE THESE FOLDERS? (yes/no): ").strip().lower()
    
    if confirm == 'yes':
        for folder_name in folders_to_delete:
            folder_path = BASE_DIR / folder_name
            try:
                print(f"  🗑️  Deleting: {folder_name}/...", end=' ')
                shutil.rmtree(folder_path)
                consolidation_data['deleted_folders'].append(folder_name)
                print("✅ Done")
            except Exception as e:
                error_msg = f"Error deleting {folder_name}: {str(e)}"
                print(f"❌ {error_msg}")
                consolidation_data['errors'].append(error_msg)
        
        print(f"\n✅ DELETED {len(consolidation_data['deleted_folders'])} FOLDERS")
    else:
        print("\n⏭️  Skipping folder deletion (as requested)")

# Step 4: Generate statistics and organize by disease
print("\n📈 GENERATING STATISTICS...")
print("-" * 80)

# Create organized subdirectories by disease type
organized_dir = BIGDATASET_DIR / 'organized_by_disease'
organized_dir.mkdir(exist_ok=True)

disease_map = defaultdict(list)
total_by_disease = defaultdict(int)

for image_file in sorted(BIGDATASET_IMAGES.glob('*')):
    if image_file.is_file():
        # Extract disease name from filename
        filename = image_file.name
        parts = filename.split('_', 1)
        
        if len(parts) >= 2:
            source_folder = parts[0]
            # Try to extract disease type
            disease_type = source_folder.replace('dataset_', '').replace('_final', '').replace('_raw', '')
        else:
            disease_type = 'unknown'
        
        disease_map[disease_type].append(filename)
        total_by_disease[disease_type] += 1

# Create subdirectories for each disease
for disease_type, files in disease_map.items():
    disease_dir = organized_dir / disease_type
    disease_dir.mkdir(exist_ok=True)
    
    for filename in files:
        src = BIGDATASET_IMAGES / filename
        dst = disease_dir / filename
        try:
            if not dst.exists():
                shutil.copy2(src, dst)
        except Exception as e:
            consolidation_data['errors'].append(f"Error organizing {filename}: {str(e)}")

# Print statistics
print(f"\n📊 BIGDATASET STRUCTURE CREATED:")
print(f"  Total images: {moved_count}")
print(f"  Disease categories: {len(disease_map)}")
print(f"\n  Disease distribution:")
for disease_type in sorted(total_by_disease.keys()):
    count = total_by_disease[disease_type]
    percentage = (count / moved_count * 100) if moved_count > 0 else 0
    print(f"    • {disease_type:40} | {count:5} images ({percentage:6.2f}%)")

# Step 5: Generate train/validation/test split
print("\n🎯 CREATING DATA SPLIT (70% train / 15% val / 15% test)...")
print("-" * 80)

import random
random.seed(42)

train_dir = BIGDATASET_DIR / 'train'
val_dir = BIGDATASET_DIR / 'validation'
test_dir = BIGDATASET_DIR / 'test'

train_dir.mkdir(exist_ok=True)
val_dir.mkdir(exist_ok=True)
test_dir.mkdir(exist_ok=True)

all_images = list(BIGDATASET_IMAGES.glob('*'))
random.shuffle(all_images)

train_count = int(len(all_images) * 0.70)
val_count = int(len(all_images) * 0.15)

train_images = all_images[:train_count]
val_images = all_images[train_count:train_count + val_count]
test_images = all_images[train_count + val_count:]

for img in train_images:
    if img.is_file():
        shutil.copy2(img, train_dir / img.name)

for img in val_images:
    if img.is_file():
        shutil.copy2(img, val_dir / img.name)

for img in test_images:
    if img.is_file():
        shutil.copy2(img, test_dir / img.name)

print(f"  ✅ Training:   {len(train_images):5} images ({len(train_images)/len(all_images)*100:.1f}%)")
print(f"  ✅ Validation: {len(val_images):5} images ({len(val_images)/len(all_images)*100:.1f}%)")
print(f"  ✅ Test:       {len(test_images):5} images ({len(test_images)/len(all_images)*100:.1f}%)")
print(f"  ✅ TOTAL:      {len(all_images):5} images (100%)")

# Step 6: Save consolidation log
consolidation_data['split'] = {
    'train': len(train_images),
    'validation': len(val_images),
    'test': len(test_images),
    'total': len(all_images)
}

consolidation_data['disease_distribution'] = dict(total_by_disease)

with open(CONSOLIDATION_LOG, 'w') as f:
    json.dump(consolidation_data, f, indent=2)

print(f"\n📝 Consolidation log saved: {CONSOLIDATION_LOG}")

# Final summary
print("\n" + "=" * 80)
print("✅ DATASET CONSOLIDATION COMPLETE!")
print("=" * 80)
print(f"""
📁 BIGDATASET FOLDER STRUCTURE:
  bigdataset/
  ├── all_images/              (All {moved_count} images in one folder)
  ├── organized_by_disease/    (Images organized by disease type)
  ├── train/                   ({len(train_images)} images - 70%)
  ├── validation/              ({len(val_images)} images - 15%)
  ├── test/                    ({len(test_images)} images - 15%)
  └── consolidation_log.json   (Consolidation metadata)

📊 STATISTICS:
  • Total images consolidated: {moved_count}
  • Disease types: {len(disease_map)}
  • Original folders deleted: {len(consolidation_data['deleted_folders'])}
  • Errors: {len(consolidation_data['errors'])}

🎯 READY FOR TRAINING:
  Use bigdataset/train for training
  Use bigdataset/validation for validation
  Use bigdataset/test for testing
""")

if consolidation_data['errors']:
    print("\n⚠️  ERRORS ENCOUNTERED:")
    for error in consolidation_data['errors']:
        print(f"  • {error}")

print("\n✨ DONE! Your unified bigdataset is ready to use for training!")
