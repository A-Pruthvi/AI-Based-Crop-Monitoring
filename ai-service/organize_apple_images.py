"""
ORGANIZE ALL APPLE IMAGES FROM FLAT FOLDERS
Moves Apple Scab (1039) and Cedar Apple Rust (1054) images to organized_by_crop
"""

import os
import shutil
from pathlib import Path
from collections import defaultdict

print("=" * 80)
print("🍎 ORGANIZING APPLE IMAGES TO organized_by_crop/")
print("=" * 80)

BASE_DIR = Path.cwd()
BIGDATASET_DIR = BASE_DIR / 'bigdataset'

# Source folders to search
SOURCE_FOLDERS = [
    BIGDATASET_DIR / 'all_images',
    BIGDATASET_DIR / 'train',
    BIGDATASET_DIR / 'validation',
    BIGDATASET_DIR / 'test',
]

# Create Apple folders in organized_by_crop
apple_dir = BIGDATASET_DIR / 'organized_by_crop' / 'Apple'
apple_dir.mkdir(parents=True, exist_ok=True)

scab_dir = apple_dir / 'Apple Scab'
rust_dir = apple_dir / 'Cedar Apple Rust'
scab_dir.mkdir(exist_ok=True)
rust_dir.mkdir(exist_ok=True)

print("\n✅ Created Apple folder structure:")
print(f"  ├─ Apple Scab/")
print(f"  └─ Cedar Apple Rust/\n")

# Process all sources
stats = defaultdict(int)
total_moved = 0

print("📂 Processing Apple images from all sources...\n")

for source_folder in SOURCE_FOLDERS:
    if not source_folder.exists():
        continue
    
    print(f"🔍 Searching: {source_folder.name}/")
    
    # Find all Apple images
    apple_files = list(source_folder.glob('*apple*'))
    
    if len(apple_files) == 0:
        print(f"   → No Apple images found")
        continue
    
    print(f"   → Found {len(apple_files)} Apple images")
    
    for image_file in apple_files:
        filename = image_file.name.lower()
        
        # Determine disease type
        if 'scab' in filename:
            dest_dir = scab_dir
            disease_type = 'Scab'
        elif 'cedar' in filename or 'rust' in filename:
            dest_dir = rust_dir
            disease_type = 'Rust'
        else:
            continue
        
        dest_path = dest_dir / image_file.name
        
        # Copy file if not already there
        if not dest_path.exists():
            try:
                shutil.copy2(image_file, dest_path)
                stats[disease_type] += 1
                total_moved += 1
            except Exception as e:
                print(f"     ❌ Error: {e}")
    
    print(f"   ✅ Processed\n")

print("=" * 80)
print("✅ APPLE ORGANIZATION COMPLETE!")
print("=" * 80)

print(f"""
📊 STATISTICS:
  Apple Scab: {stats['Scab']:,} images
  Cedar Apple Rust: {stats['Rust']:,} images
  ────────────────────────
  TOTAL MOVED: {total_moved:,} images

📁 FINAL APPLE STRUCTURE:
  bigdataset/organized_by_crop/Apple/
  ├─ Apple Scab/ ({stats['Scab']:,} images)
  └─ Cedar Apple Rust/ ({stats['Rust']:,} images)

✨ All Apple images now organized!
""")

# Verify
print("\n🔍 VERIFICATION:")
scab_count = len(list(scab_dir.glob('*.*')))
rust_count = len(list(rust_dir.glob('*.*')))
print(f"  Apple Scab folder: {scab_count:,} images")
print(f"  Cedar Apple Rust folder: {rust_count:,} images")
print(f"  Total in organized_by_crop/Apple/: {scab_count + rust_count:,} images")
