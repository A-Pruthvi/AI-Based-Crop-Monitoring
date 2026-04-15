"""
Analyze and organize 76,675 Unknown images to correct Crop/Disease folders
Maps filenames to crops and creates proper folder structure
"""

import os
import shutil
from pathlib import Path
from collections import defaultdict

print("=" * 80)
print("🔍 ANALYZING UNKNOWN IMAGES")
print("=" * 80)

BASE_DIR = Path("bigdataset/organized_by_crop_disease")
UNKNOWN_DIR = BASE_DIR / "Unknown" / "Uncategorized"

if not UNKNOWN_DIR.exists():
    print(f"❌ Unknown folder not found!")
    exit(1)

# DISEASE TO CROP MAPPING (exact from user requirements)
DISEASE_CROP_MAPPING = {
    'apple_scab': ('Apple', 'Apple Scab'),
    'cedar_apple_rust': ('Apple', 'Cedar Apple Rust'),
    'black_sigatoka': ('Banana', 'Black Sigatoka'),
    'northern_leaf_blight': ('Corn', 'Northern Leaf Blight'),
    'gray_leaf_spot': ('Corn', 'Gray Leaf Spot'),
    'powdery_mildew': ('Mango', 'Powdery Mildew'),
    'anthracnose': ('Grapes', 'Anthracnose'),
    'downy_mildew': ('Grapes', 'Downy Mildew'),
    'yellow_leaf_curl': ('Tomato', 'Yellow Leaf Curl'),
    'early_blight': ('Tomato', 'Early Blight'),
    'late_blight': ('Potato', 'Late Blight'),
    'bacterial_leaf_blight': ('Rice', 'Bacterial Leaf Blight'),
    'brown_spot': ('Rice', 'Brown Spot'),
    'leaf_smut': ('Rice', 'Leaf Smut'),
    'septoria_leaf_blotch': ('Rice', 'Septoria Leaf Blotch'),
}

# Scan and categorize all images
images_to_move = defaultdict(list)
unmapped = []

print(f"\n📊 Scanning Unknown folder...")
total_files = len(list(UNKNOWN_DIR.glob("*.*")))
print(f"   Total files: {total_files:,}\n")

# Analyze each file
for i, img_file in enumerate(UNKNOWN_DIR.glob("*.*")):
    if not img_file.is_file():
        continue
    
    filename_lower = img_file.name.lower()
    found_match = False
    
    # Check each disease pattern
    for disease_key, (crop, disease_name) in DISEASE_CROP_MAPPING.items():
        if disease_key in filename_lower or disease_key.replace('_', ' ') in filename_lower:
            images_to_move[(crop, disease_name)].append(img_file)
            found_match = True
            break
    
    if not found_match:
        unmapped.append(img_file)
    
    if (i + 1) % 10000 == 0:
        print(f"   Scanned: {i + 1:,}/{total_files:,}")

print(f"\n{'=' * 80}")
print(f"📈 ANALYSIS RESULTS")
print(f"{'=' * 80}\n")

# Group by crop
crop_summary = defaultdict(lambda: {'diseases': {}, 'total': 0})

for (crop, disease_name), images in sorted(images_to_move.items()):
    count = len(images)
    crop_summary[crop]['diseases'][disease_name] = count
    crop_summary[crop]['total'] += count

# Display summary
print("🌾 IMAGES BY CROP:\n")
total_mapped = 0
for crop in sorted(crop_summary.keys()):
    crop_data = crop_summary[crop]
    print(f"  📁 {crop}")
    for disease, count in sorted(crop_data['diseases'].items()):
        total_mapped += count
        print(f"      • {disease:35} : {count:,}")
    print(f"      ✅ Subtotal: {crop_data['total']:,}\n")

print(f"{'=' * 80}")
print(f"✅ Total mapped: {total_mapped:,}")
print(f"❓ Unmapped: {len(unmapped):,}")
print(f"{'=' * 80}\n")

if total_mapped == 0:
    print("⚠️  No images matched any pattern!")
    exit(1)

# Confirm move
print(f"Moving {total_mapped:,} images to crop folders...")
confirm = input("Continue? (yes/no): ").strip().lower()

if confirm != 'yes':
    print("Cancelled.")
    exit(0)

print("\n🚀 MOVING IMAGES...\n")

# Move images to correct folders
moved = 0
errors = []

for (crop, disease_name), image_list in sorted(images_to_move.items()):
    
    # Create crop/disease folder
    dest_folder = BASE_DIR / crop / disease_name
    dest_folder.mkdir(parents=True, exist_ok=True)
    
    print(f"  📁 {crop}/{disease_name}")
    
    for img_file in image_list:
        try:
            dest_path = dest_folder / img_file.name
            shutil.move(str(img_file), str(dest_path))
            moved += 1
        except Exception as e:
            errors.append(str(e))
            print(f"      ❌ {img_file.name}")
    
    print(f"      ✅ {len(image_list):,} moved")

# Handle unmapped images
if unmapped:
    unmapped_folder = BASE_DIR / "Unknown" / "Uncategorized_Unmatched"
    unmapped_folder.mkdir(parents=True, exist_ok=True)
    print(f"\n  📁 Unknown/Uncategorized_Unmatched")
    for img_file in unmapped:
        try:
            shutil.move(str(img_file), str(unmapped_folder / img_file.name))
        except:
            pass
    print(f"      ✅ {len(unmapped):,} unmapped images kept")

# Remove empty folders
try:
    if len(list(UNKNOWN_DIR.glob('*.*'))) == 0:
        UNKNOWN_DIR.rmdir()
        print(f"\n  ✅ Removed empty 'Unknown/Uncategorized' folder")
except:
    pass

print(f"\n{'=' * 80}")
print(f"✅ COMPLETE!")
print(f"{'=' * 80}\n")
print(f"  Moved: {moved:,} images")
print(f"  Errors: {len(errors)}")

# Final structure
print(f"\n{'=' * 80}")
print("📁 FINAL ORGANIZED STRUCTURE")
print(f"{'=' * 80}\n")

grand_total = 0
for crop_folder in sorted(BASE_DIR.iterdir()):
    if crop_folder.is_dir():
        crop_name = crop_folder.name
        crop_total = 0
        
        print(f"  {crop_name}/")
        for disease_folder in sorted(crop_folder.iterdir()):
            if disease_folder.is_dir():
                count = len(list(disease_folder.glob("*.*")))
                if count > 0:
                    crop_total += count
                    grand_total += count
                    print(f"      • {disease_folder.name:35} : {count:,}")
        
        if crop_total > 0:
            print(f"      ✅ {crop_total:,}\n")

print(f"{'=' * 80}")
print(f"🎯 TOTAL ORGANIZED: {grand_total:,} images")
print(f"{'=' * 80}")
print(f"\n✨ All images are now correctly organized in crop folders!")
