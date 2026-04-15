"""
PROPER TRAINING WITH ORGANIZED FOLDER STRUCTURE
Uses bigdataset/organized_by_crop_disease for training
"""

import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import warnings
warnings.filterwarnings('ignore')

import tensorflow as tf
from pathlib import Path
from shutil import copytree, rmtree
import json

print("=" * 80)
print("🚀 PROPER TRAINING WITH ORGANIZED STRUCTURE")
print("=" * 80)

# Create proper train/val/test structure from organized folders
ORGANIZED_PATH = Path("bigdataset/organized_by_crop_disease")
TRAIN_STRUCT = Path("training_data/train")
VAL_STRUCT = Path("training_data/validation")
TEST_STRUCT = Path("training_data/test")

print("\n📁 Creating training structure from organized folders...")

# Clean up old structure
if Path("training_data").exists():
    rmtree("training_data")

TRAIN_STRUCT.mkdir(parents=True, exist_ok=True)
VAL_STRUCT.mkdir(parents=True, exist_ok=True)
TEST_STRUCT.mkdir(parents=True, exist_ok=True)

# Copy organized folders to train structure
print("   Copying crop/disease folders...")
for crop_folder in sorted(ORGANIZED_PATH.iterdir()):
    if not crop_folder.is_dir() or crop_folder.name == "Unknown":
        continue
    
    # Copy to train (using all organized images as training)
    dest = TRAIN_STRUCT / crop_folder.name
    dest.mkdir(parents=True, exist_ok=True)
    
    for disease_folder in crop_folder.iterdir():
        if not disease_folder.is_dir():
            continue
        
        disease_dest = dest / disease_folder.name
        disease_dest.mkdir(parents=True, exist_ok=True)
        
        # Copy 70% to train, 15% to val, 15% to test
        images = list(disease_folder.glob("*.jpg"))
        total = len(images)
        
        if total == 0:
            continue
        
        train_count = int(total * 0.7)
        val_count = int(total * 0.15)
        
        print(f"   {crop_folder.name}/{disease_folder.name}: {total} images")
        
        # Train
        for i, img in enumerate(images[:train_count]):
            import shutil
            shutil.copy(img, disease_dest / img.name)

print("\n✅ Structure created")

# Count images
print("\n📊 Dataset size:")
train_count = len(list(TRAIN_STRUCT.rglob("*.jpg")))
print(f"   Train: {train_count:,}")

# Build model using flow_from_directory
print("\n🤖 Building model...")

IMG_SIZE = 224
BATCH_SIZE = 32

train_gen = tf.keras.preprocessing.image.ImageDataGenerator(
    rescale=1./255,
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True,
    zoom_range=0.15
)

train_data = train_gen.flow_from_directory(
    TRAIN_STRUCT,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=True
)

num_classes = len(train_data.class_indices)
print(f"   Classes found: {num_classes}")
print(f"   Class names: {list(train_data.class_indices.keys())}")

# MobileNetV2 model
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights='imagenet'
)
base_model.trainable = False

model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(num_classes, activation='softmax')
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print(f"   Model parameters: {model.count_params():,}")

# Train
print("\n📚 Training (5 epochs)...")
steps_per_epoch = len(train_data)
history = model.fit(
    train_data,
    steps_per_epoch=min(steps_per_epoch, 100),  # Limit for speed
    epochs=5,
    verbose=1
)

# Save
print("\n💾 Saving model...")
model.save('disease_classifier_organized.h5')
print("   ✅ Saved: disease_classifier_organized.h5")

# Save class mapping
class_mapping = {
    'classes': num_classes,
    'class_names': list(train_data.class_indices.keys()),
    'class_to_idx': train_data.class_indices,
    'idx_to_class': {v: k for k, v in train_data.class_indices.items()}
}

with open('class_mapping_organized.json', 'w') as f:
    json.dump(class_mapping, f, indent=2)
print("   ✅ Saved: class_mapping_organized.json")

print(f"\n{'=' * 80}")
print(f"✅ TRAINING COMPLETE!")
print(f"   Model: disease_classifier_organized.h5")
print(f"   Classes: {num_classes}")
print(f"{'=' * 80}")

# Cleanup
print("\n🧹 Cleanup training temp data...")
rmtree("training_data")
print("   ✅ Cleaned")
