"""
AI-SERVICE FOLDER CLEANUP
Removes unnecessary and duplicate files while keeping essential ones
"""

import os
import shutil
from pathlib import Path
from datetime import datetime

print("=" * 80)
print("🧹 AI-SERVICE FOLDER CLEANUP")
print("=" * 80)

BASE_DIR = Path.cwd()

# DEFINE FILES TO KEEP (Essential files)
KEEP_SCRIPTS = {
    # Main API
    'api_predictions_improved.py',
    
    # Main training scripts (keep best versions only)
    'train_unified_complete.py',
    
    # Utility scripts
    'organize_apple_images.py',
    'final_reorganize_crops.py',
    'consolidate_all_to_bigdataset.py',
    'merge_all_datasets.py',
    
    # Config
    'config.py',
    
    # Inference
    'inference_unified_api.py',
    'prediction_pipeline.py',
}

KEEP_DOCS = {
    'ARCHITECTURE_V2.md',
    'COMPARISON_OLD_VS_NEW.md',
    'DATASET_DOWNLOAD_GUIDE.md',
    'DISEASE_TRAINING_REPORT.md',
    'EXECUTIVE_SUMMARY.md',
    'GRADCAM_DOCUMENTATION.md',
    'QUICK_START_DEPLOYMENT.md',
    'QUICK_START_REAL_DATA.txt',
    'QUICK_START_V2.md',
    'README_REAL_DATASETS.md',
    'README_V2.md',
    'TRAINING_COMPLETE.md',
    'TRAINING_STATUS.md',
}

KEEP_CONFIGS = {
    '.gitignore',
    'requirements.txt',
    'requirements_complete.txt',
    'startup_api.bat',
    'startup_api.ps1',
}

# Files/folders to DELETE
DELETE_PATTERNS = [
    # Old duplicate Python scripts
    'app.py',
    'app_v2.py',
    'api_simple.py',
    'train_crop_*.py',
    'train_disease*.py',
    'train_quick*.py',
    'train_fast*.py',
    'train_correct*.py',
    'train_multi*.py',
    'train_diseases*.py',
    'train_*.py',  # Old training scripts
    'test_*.py',
    'consolidate_datasets.py',
    'consolidate_datasets_v2.py',
    'reorganize_*.py',  # Old reorganize scripts
    'consolidate_datasets_complete.py',  # Older version
    'analyze_bigdataset_structure.py',
    'verify_*.py',
    'crop_classifier*.py',
    'disease_classifier*.py',
    'config_multi_crop.py',
    'download_*.py',
    'prepare_dataset.py',
    'preprocess_*.py',
    'analyze_image_quality.py',
    'auto_download_images.py',
    'gradcam*.py',
    'treatment_recommender.py',
    'severity_estimator.py',
    'monitor_training.py',
    'organize_plantvillage.py',
    'organize_datasets.py',
    'smartly_reorganize_crops.py',
    'reorganize_precise_crops.py',
    'fast_reorganize_crops.py',
    'generate_synthetic_enhanced.py',
    'image_preprocessing.py',
    'image_preprocessing_v2.py',
    
    # Cache and temp
    '__pycache__',
    '.pytest_cache',
    
    # Old/unnecessary markdown docs
    'MULTI_CROP_SETUP_GUIDE.md',
    'COMPARISON_ORIGINAL_VS_ENHANCED.md',
    'COMPLETE_PIPELINE_GUIDE.md',
    'ACCURACY_IMPROVEMENT_GUIDE.md',
    'IMPLEMENTATION_COMPLETE.md',
    'INFERENCE_API_GUIDE.md',
    'QUICK_START.md',
    'QUICK_START_REAL_DATA.txt',
    
    # Log files
    '*.txt',
    'training_log.txt',
    'preprocessing_output.txt',
    'DATASET_QUALITY_ANALYSIS.txt',
    
    # Consolidated data (keep only bigdataset)
    'dataset_unified_complete_backup',
    'dataset_unified_backup',
]

# Scan and categorize files
to_delete = []
final_files = []

print("\n📋 Scanning files...\n")

for file_path in sorted(BASE_DIR.glob('*')):
    filename = file_path.name
    
    # Check if should be deleted
    should_delete = False
    for pattern in DELETE_PATTERNS:
        if filename.startswith(pattern.rstrip('*')) or filename == pattern.rstrip('*'):
            should_delete = True
            break
    
    # Check for wildcard patterns
    if not should_delete:
        for pattern in DELETE_PATTERNS:
            if '*' in pattern:
                import fnmatch
                if fnmatch.fnmatch(filename, pattern):
                    should_delete = True
                    break
    
    if should_delete and filename not in KEEP_SCRIPTS and filename not in KEEP_CONFIGS:
        to_delete.append(file_path)
        print(f"  🗑️  DELETE: {filename}")
    elif filename in KEEP_SCRIPTS or filename in KEEP_DOCS or filename in KEEP_CONFIGS:
        final_files.append(file_path)
        print(f"  ✅ KEEP:   {filename}")
    elif file_path.is_dir() and filename not in ['bigdataset', '.venv', 'model', 'heatmaps', 'recommendations', 'uploads', 'utils']:
        to_delete.append(file_path)
        print(f"  🗑️  DELETE (folder): {filename}")
    elif file_path.is_dir():
        final_files.append(file_path)
        print(f"  ✅ KEEP (folder): {filename}")

print("\n" + "=" * 80)
print(f"📊 CLEANUP SUMMARY")
print("=" * 80)
print(f"\n  Files to DELETE: {len(to_delete)}")
print(f"  Files to KEEP:   {len(final_files)}")

# Calculate space savings
total_delete_size = 0
for item in to_delete:
    if item.is_file():
        total_delete_size += item.stat().st_size
    elif item.is_dir():
        for file in item.rglob('*'):
            if file.is_file():
                total_delete_size += file.stat().st_size

print(f"  Space to free: {total_delete_size / (1024*1024):.1f} MB")

# Confirm deletion
print(f"\n{'=' * 80}")
confirm = input("🔴 DELETE THESE FILES? (yes/no): ").strip().lower()

if confirm == 'yes':
    deleted_count = 0
    errors = []
    
    for item in to_delete:
        try:
            if item.is_file():
                item.unlink()
                print(f"  ✅ Deleted: {item.name}")
                deleted_count += 1
            elif item.is_dir():
                shutil.rmtree(item)
                print(f"  ✅ Deleted folder: {item.name}")
                deleted_count += 1
        except Exception as e:
            errors.append(f"Error deleting {item.name}: {e}")
            print(f"  ❌ Error: {item.name}")
    
    print(f"\n{'=' * 80}")
    print(f"✅ CLEANUP COMPLETE!")
    print(f"   Deleted: {deleted_count} items")
    if errors:
        print(f"\n⚠️  Errors:")
        for error in errors:
            print(f"   • {error}")
else:
    print("\n⏭️  Cleanup cancelled.")

# Show final structure
print(f"\n{'=' * 80}")
print("📁 FINAL AI-SERVICE STRUCTURE")
print("=" * 80)

print("\n📄 Python Scripts (Essential):")
for file in sorted(BASE_DIR.glob('*.py')):
    size = file.stat().st_size / 1024
    print(f"  • {file.name:40} ({size:.1f} KB)")

print("\n📋 Documentation:")
for file in sorted(BASE_DIR.glob('*.md')):
    print(f"  • {file.name}")

print("\n📁 Folders:")
for folder in sorted(BASE_DIR.glob('*')):
    if folder.is_dir() and not folder.name.startswith('.'):
        item_count = len(list(folder.glob('*')))
        print(f"  • {folder.name:40} ({item_count} items)")

print(f"\n✨ Cleanup ready! Workspace is now optimized.")
