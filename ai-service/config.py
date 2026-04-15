"""
Configuration file for the AI service.
"""

# Image processing
IMAGE_SIZE = (224, 224)

# Model paths
CROP_CLASSIFIER_PATH = 'crop_model.h5'
DISEASE_CLASSIFIER_PATH = 'disease_model.h5'
CROP_CLASS_INDICES_PATH = 'crop_class_indices.json'
DISEASE_CLASS_INDICES_PATH = 'disease_class_indices.json'

# Confidence thresholds
CROP_CONFIDENCE_THRESHOLD = 0.60
DISEASE_CONFIDENCE_THRESHOLD = 0.60

# Dataset paths
TRAIN_DIR = 'dataset/train'
VALIDATION_DIR = 'dataset/validation'
DISEASE_TRAIN_DIR = 'dataset/train'
DISEASE_VALIDATION_DIR = 'dataset/validation'
RAW_DATA_DIR = 'raw_data/rice_leaf_diseases'

# Training parameters
EPOCHS = 10
BATCH_SIZE = 32
LEARNING_RATE = 0.0001
