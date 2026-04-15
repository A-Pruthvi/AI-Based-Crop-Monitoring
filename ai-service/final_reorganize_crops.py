"""
FINAL CROP/DISEASE REORGANIZATION - HANDLES ALL SOURCE PREFIXES
Extracts disease name from filenames with any prefix and classifies correctly
"""

import os
import shutil
import re
from pathlib import Path
from collections import defaultdict

print("=" * 80)
print("🌾 FINAL PRECISE CROP/DISEASE REORGANIZATION")
print("=" * 80)

BASE_DIR = Path.cwd()
BIGDATASET_DIR = BASE_DIR / 'bigdataset'

# DISEASE-TO-CROP MAPPING (From user's exact classification)
DISEASE_PATTERNS = {
    # Apple
    'apple scab': ('Apple', 'Apple Scab'),
    'cedar apple rust': ('Apple', 'Cedar Apple Rust'),
    'cedarapplerust': ('Apple', 'Cedar Apple Rust'),
    
    # Banana
    'black sigatoka': ('Banana', 'Black Sigatoka'),
    
    # Corn
    'northern leaf blight': ('Corn', 'Northern Leaf Blight'),
    'gray leaf spot': ('Corn', 'Gray Leaf Spot'),
    'grayleafspot': ('Corn', 'Gray Leaf Spot'),
    
    # Mango
    'powdery mildew': ('Mango', 'Powdery Mildew'),
    
    # Grapes
    'anthracnose': ('Grapes', 'Anthracnose'),
    'downy mildew': ('Grapes', 'Downy Mildew'),
    
    # Tomato
    'yellow leaf curl': ('Tomato', 'Yellow Leaf Curl'),
    'early blight': ('Tomato', 'Early Blight'),
    
    # Potato
    'late blight': ('Potato', 'Late Blight'),
    
    # Rice
    'bacterial leaf blight': ('Rice', 'Bacterial Leaf Blight'),
    'brown spot': ('Rice', 'Brown Spot'),
    'leaf smut': ('Rice', 'Leaf Smut'),
    'septoria leaf blotch': ('Rice', 'Septoria Leaf Blotch'),
}

# Known source prefixes to strip
SOURCE_PREFIXES = [
    'dataset_combined_',
    'val_final_',
    'train_final_',
    'test_final_',
    'dataset_unified_',
    'plantvillage_raw_',
    'raw_data_',
    'downloads_raw_',
    'dataset_preprocessed_',
]

def extract_disease_from_filename(filename):
    """Extract disease name from filename, handling any source prefix"""
    # Convert to lowercase for matching
    filename_lower = filename.lower()
    
    # Remove extension
    name_without_ext = Path(filename).stem.lower()
    
    # Remove known source prefixes
    cleaned_name = name_without_ext
    for prefix in SOURCE_PREFIXES:
        if cleaned_name.startswith(prefix.lower()):
            cleaned_name = cleaned_name[len(prefix):].lower()
            break
    
    # Replace underscores with spaces for matching
    cleaned_name = cleaned_name.replace('_', ' ')
    
    # Try to find disease pattern
    for disease_key, (crop, disease_display) in DISEASE_PATTERNS.items():
        if disease_key in cleaned_name:
            return crop, disease_display
    
    return None, None

# Create main organized folder
organized_dir = BIGDATASET_DIR / 'organized_by_crop'
organized_dir.mkdir(exist_ok=True)

# Initialize all crop folders
for disease_key, (crop, disease_display) in DISEASE_PATTERNS.items():
    crop_dir = organized_dir / crop
    disease_dir = crop_dir / disease_display
    disease_dir.mkdir(parents=True, exist_ok=True)

print("\n✅ Created crop/disease folder structure")
print("Crops: Apple | Banana | Corn | Mango | Grapes | Tomato | Potato | Rice\n")

# Process Unknown folder files
unknown_folder = BIGDATASET_DIR / 'organized_by_crop_disease' / 'Unknown' / 'Uncategorized'

if not unknown_folder.exists():
    print(f"❌ Unknown folder not found: {unknown_folder}")
else:
    print(f"📂 Processing Unknown folder...\n")
    
    moved_count = 0
    stats = defaultdict(lambda: defaultdict(int))
    unmatched_list = []
    
    image_files = list(unknown_folder.glob('*.*'))
    total_files = len(image_files)
    
    for idx, image_file in enumerate(sorted(image_files)):
        crop, disease = extract_disease_from_filename(image_file.name)
        
        if crop and disease:
            dest_dir = organized_dir / crop / disease
            dest_path = dest_dir / image_file.name
            
            if not dest_path.exists():
                try:
                    shutil.copy2(image_file, dest_path)
                    moved_count += 1
                    stats[crop][disease] += 1
                except Exception as e:
                    print(f"❌ Error: {e}")
        else:
            unmatched_list.append(image_file.name)
        
        # Progress
        if (idx + 1) % 10000 == 0:
            print(f"  ✓ Processed {idx + 1}/{total_files} files... ({moved_count} moved)")
    
    print(f"\n{'=' * 80}")
    print(f"✅ TOTAL MOVED: {moved_count}/{total_files} images")
    print(f"⚠️  UNMATCHED: {len(unmatched_list)} images")
    print(f"{'=' * 80}\n")

# Print statistics
print("📊 FINAL CROP/DISEASE STRUCTURE:")
print("=" * 80)

total_by_crop = {}
for crop in sorted(stats.keys()):
    print(f"\n🌾 {crop}/")
    crop_total = 0
    for disease in sorted(stats[crop].keys()):
        count = stats[crop][disease]
        crop_total += count
        print(f"    ├─ {disease:35} ({count:6,} images)")
    total_by_crop[crop] = crop_total
    print(f"    └─ SUBTOTAL: {crop_total:,} images")

print("\n" + "=" * 80)
print("GRAND TOTAL:")
print("=" * 80)

grand_total = 0
for crop in sorted(total_by_crop.keys()):
    count = total_by_crop[crop]
    grand_total += count
    percentage = (count / moved_count * 100) if moved_count > 0 else 0
    print(f"  {crop:20} | {count:7,} images ({percentage:6.2f}%)")

print(f"  {'-' * 40}")
print(f"  TOTAL:               | {grand_total:7,} images (100%)")

print("\n" + "=" * 80)
print("✨ All crops and diseases are now properly organized!")
print("=" * 80)
