"""
Map 76,675 Unknown/Uncategorized images to correct Crop/Disease folders
Using disease-to-crop classification mapping provided by user
"""

import os
import shutil
from pathlib import Path
from collections import defaultdict
import json

print("=" * 80)
print("🌾 MAPPING UNKNOWN IMAGES TO CROPS")
print("=" * 80)

# DISEASE TO CROP MAPPING (from user's exact classification)
DISEASE_CROP_MAPPING = {
    # Apple
    'apple_scab': 'Apple',
    'cedar_apple_rust': 'Apple',
    
    # Banana
    'black_sigatoka': 'Banana',
    
    # Corn
    'northern_leaf_blight': 'Corn',
    'gray_leaf_spot': 'Corn',
    
    # Mango
    'powdery_mildew': 'Mango',
    
    # Grapes
    'anthracnose': 'Grapes',
    'downy_mildew': 'Grapes',
    
    # Tomato
    'yellow_leaf_curl': 'Tomato',
    'early_blight': 'Tomato',
    
    # Potato
    'late_blight': 'Potato',
    
    # Rice
    'bacterial_leaf_blight': 'Rice',
    'brown_spot': 'Rice',
    'leaf_smut': 'Rice',
    'septoria_leaf_blotch': 'Rice',
}

# DISEASE DISPLAY NAMES (for folder creation)
DISEASE_NAMES = {
    'apple_scab': 'Apple Scab',
    'cedar_apple_rust': 'Cedar Apple Rust',
    'black_sigatoka': 'Black Sigatoka',
    'northern_leaf_blight': 'Northern Leaf Blight',
    'gray_leaf_spot': 'Gray Leaf Spot',
    'powdery_mildew': 'Powdery Mildew',
    'anthracnose': 'Anthracnose',
    'downy_mildew': 'Downy Mildew',
    'yellow_leaf_curl': 'Yellow Leaf Curl',
    'early_blight': 'Early Blight',
    'late_blight': 'Late Blight',
    'bacterial_leaf_blight': 'Bacterial Leaf Blight',
    'brown_spot': 'Brown Spot',
    'leaf_smut': 'Leaf Smut',
    'septoria_leaf_blotch': 'Septoria Leaf Blotch',
}

BASE_DIR = Path("bigdataset/organized_by_crop_disease")
UNKNOWN_DIR = BASE_DIR / "Unknown" / "Uncategorized"

if not UNKNOWN_DIR.exists():
    print(f"❌ Unknown folder not found at: {UNKNOWN_DIR}")
    exit(1)

print(f"\n📁 Scanning: {UNKNOWN_DIR}")
print(f"   Total files: {len(list(UNKNOWN_DIR.glob('*.*')))}")

# Scan and categorize images
images_by_disease = defaultdict(list)
unmapped_images = []
mapped_count = 0
disease_stats = defaultdict(int)

print("\n🔍 Analyzing filenames...\n")

for img_file in sorted(UNKNOWN_DIR.glob("*.*")):
    if not img_file.is_file():
        continue
    
    filename = img_file.name.lower()
    
    # Try to extract disease name from filename
    matched_disease = None
    
    for disease_key in DISEASE_CROP_MAPPING.keys():
        if disease_key in filename or disease_key.replace('_', ' ') in filename:
            matched_disease = disease_key
            break
    
    if matched_disease:
        images_by_disease[matched_disease].append(img_file)
        mapped_count += 1
        disease_stats[matched_disease] += 1
    else:
        unmapped_images.append(img_file)

print(f"{'=' * 80}")
print(f"📊 MAPPING ANALYSIS")
print(f"{'=' * 80}\n")

# Show mapping statistics
print("✅ MAPPED IMAGES BY DISEASE:\n")
for disease in sorted(disease_stats.keys()):
    crop_name = DISEASE_CROP_MAPPING[disease]
    count = disease_stats[disease]
    print(f"  {disease:30} → {crop_name:15} : {count:,} images")

print(f"\n❓ UNMAPPED IMAGES: {len(unmapped_images):,}")
if len(unmapped_images) > 0 and len(unmapped_images) <= 20:
    print("   Sample unmapped filenames:")
    for img in unmapped_images[:20]:
        print(f"      • {img.name[:60]}")

print(f"\n{'=' * 80}")
print(f"📈 TOTAL: {mapped_count:,} mapped + {len(unmapped_images):,} unmapped = {len(list(UNKNOWN_DIR.glob('*.*'))):,} files")
print(f"{'=' * 80}\n")

if mapped_count == 0:
    print("⚠️  No images could be mapped! Check filename patterns.")
    exit(1)

# Confirm before moving
confirm = input("🔴 MOVE IMAGES TO CROP FOLDERS? (yes/no): ").strip().lower()

if confirm != 'yes':
    print("⏭️  Cancelled.")
    exit(0)

# Create crop folders and move images
print("\n🚀 MOVING IMAGES...\n")
moved_count = 0
errors = []

for disease_key, image_files in sorted(images_by_disease.items()):
    crop_name = DISEASE_CROP_MAPPING[disease_key]
    disease_display_name = DISEASE_NAMES[disease_key]
    
    # Create crop/disease folder structure
    disease_folder = BASE_DIR / crop_name / disease_display_name
    disease_folder.mkdir(parents=True, exist_ok=True)
    
    print(f"📁 {crop_name}/{disease_display_name}/")
    print(f"   Moving {len(image_files):,} images...")
    
    for img_file in image_files:
        try:
            dest_file = disease_folder / img_file.name
            shutil.move(str(img_file), str(dest_file))
            moved_count += 1
        except Exception as e:
            errors.append(f"Error moving {img_file.name}: {e}")
            print(f"   ❌ Error: {img_file.name}")
    
    print(f"   ✅ {len(image_files):,} moved")

# Handle unmapped images
if len(unmapped_images) > 0:
    uncategorized_folder = BASE_DIR / "Unknown" / "Uncategorized_Unmapped"
    uncategorized_folder.mkdir(parents=True, exist_ok=True)
    
    print(f"\n📁 Uncategorized/Unmapped/")
    print(f"   Keeping {len(unmapped_images):,} unmapped images...")
    for img_file in unmapped_images:
        try:
            dest_file = uncategorized_folder / img_file.name
            shutil.move(str(img_file), str(dest_file))
        except Exception as e:
            errors.append(f"Error moving unmapped {img_file.name}: {e}")

# Clean up empty Unknown folder if needed
try:
    if len(list(UNKNOWN_DIR.glob('*.*'))) == 0:
        UNKNOWN_DIR.rmdir()
        print(f"   ✅ Empty 'Unknown/Uncategorized' folder removed")
except Exception as e:
    pass

print(f"\n{'=' * 80}")
print(f"✅ MAPPING COMPLETE!")
print(f"{'=' * 80}\n")
print(f"  Images moved: {moved_count:,}")
print(f"  Images kept unmapped: {len(unmapped_images):,}")
if errors:
    print(f"  Errors: {len(errors)}")
    print(f"\n⚠️  Errors occurred:")
    for error in errors[:5]:
        print(f"     • {error}")

# Show final structure
print(f"\n{'=' * 80}")
print("📊 FINAL CROP/DISEASE STRUCTURE")
print(f"{'=' * 80}\n")

grand_total = 0
for crop_folder in sorted(BASE_DIR.iterdir()):
    if crop_folder.is_dir() and crop_folder.name != ".gitkeep":
        crop_name = crop_folder.name
        crop_total = 0
        print(f"📁 {crop_name}/")
        
        for disease_folder in sorted(crop_folder.iterdir()):
            if disease_folder.is_dir():
                disease_name = disease_folder.name
                disease_count = len(list(disease_folder.glob("*.*")))
                if disease_count > 0:
                    crop_total += disease_count
                    grand_total += disease_count
                    print(f"    • {disease_name:35} : {disease_count:,} images")
        
        if crop_total > 0:
            print(f"    ✅ Subtotal: {crop_total:,}")
        print()

print(f"{'=' * 80}")
print(f"🎯 GRAND TOTAL: {grand_total:,} images organized")
print(f"{'=' * 80}")

# Save mapping report
report = {
    "total_mapped": mapped_count,
    "total_unmapped": len(unmapped_images),
    "disease_stats": dict(disease_stats),
    "crop_mapping": {crop: DISEASE_CROP_MAPPING[crop] for crop in disease_stats.keys()}
}

with open("mapping_report.json", "w") as f:
    json.dump(report, f, indent=2)

print(f"\n📄 Mapping report saved: mapping_report.json")
print(f"✨ Images are now ready for training with correct crop/disease organization!")
