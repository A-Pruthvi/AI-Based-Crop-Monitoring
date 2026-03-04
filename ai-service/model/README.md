# Crop Disease Detection Model

This folder should contain the trained CNN model file.

## Expected File
- `crop_model.h5` - Trained Keras/TensorFlow model

## Model Requirements
- **Input Shape**: (224, 224, 3) - RGB images
- **Output**: 10 classes (softmax activation)

## Disease Classes (in order):
0. Healthy
1. Bacterial Blight
2. Brown Spot
3. Leaf Blast
4. Leaf Rust
5. Tungro
6. Sheath Blight
7. False Smut
8. Hispa
9. Neck Blast

## Training the Model
If you need to train a new model, you can use the following architecture:

```python
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
from tensorflow.keras.applications import MobileNetV2

# Option 1: Custom CNN
model = Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
    BatchNormalization(),
    MaxPooling2D(2, 2),
    
    Conv2D(64, (3, 3), activation='relu'),
    BatchNormalization(),
    MaxPooling2D(2, 2),
    
    Conv2D(128, (3, 3), activation='relu'),
    BatchNormalization(),
    MaxPooling2D(2, 2),
    
    Conv2D(256, (3, 3), activation='relu'),
    BatchNormalization(),
    MaxPooling2D(2, 2),
    
    Flatten(),
    Dense(512, activation='relu'),
    Dropout(0.5),
    Dense(256, activation='relu'),
    Dropout(0.3),
    Dense(10, activation='softmax')
])

# Option 2: Transfer Learning with MobileNetV2
base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
base_model.trainable = False

model = Sequential([
    base_model,
    GlobalAveragePooling2D(),
    Dense(256, activation='relu'),
    Dropout(0.5),
    Dense(10, activation='softmax')
])
```

## Dataset Recommendations
- PlantVillage Dataset
- Rice Disease Image Dataset
- Custom drone-captured crop images

## Without Model
When the `crop_model.h5` file is not present, the service runs in **simulation mode** 
and returns realistic mock predictions for development and testing purposes.
