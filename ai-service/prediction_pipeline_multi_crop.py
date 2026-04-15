"""
Multi-Crop Disease Detection Pipeline
Production-grade inference using 10-crop + disease-specific classifiers
"""

import os
import json
import numpy as np
from datetime import datetime
from PIL import Image
import tensorflow as tf
import warnings

warnings.filterwarnings('ignore')

from config_multi_crop import (
    CROPS, MODEL_PATHS, IMAGE_SIZE, 
    CROP_PREDICTION_THRESHOLD, DISEASE_PREDICTION_THRESHOLD
)

# ============================================================================
# MULTI-CROP DISEASE DETECTION PIPELINE
# ============================================================================
class MultiCropDiseaseDetectionPipeline:
    """
    Production-grade pipeline for multi-crop disease detection
    - Stage 1: Identify crop type (10 crops)
    - Stage 2: Identify disease (crop-specific)
    - Stage 3: Calculate severity & recommendations
    """
    
    def __init__(self):
        """Initialize pipeline with all models"""
        print("\n🚀 Initializing Multi-Crop Disease Detection Pipeline...")
        
        self.crop_model = None
        self.disease_models = {}
        self.crop_classes = None
        self.disease_classes = {}
        self.recommendations = None
        
        self._load_models()
        self._load_class_indices()
        self._load_recommendations()
        
        print("✅ Pipeline initialized successfully\n")
    
    def _load_models(self):
        """Load crop classifier and all disease classifiers"""
        print("🔄 Loading models...")
        
        # Load crop classifier
        try:
            crop_model_path = MODEL_PATHS['crop_classifier']
            if os.path.exists(crop_model_path):
                self.crop_model = tf.keras.models.load_model(crop_model_path)
                print(f"   ✓ Crop classifier loaded")
            else:
                print(f"   ⚠ Crop classifier not found: {crop_model_path}")
        except Exception as e:
            print(f"   ❌ Error loading crop classifier: {e}")
        
        # Load disease classifiers for each crop
        for crop_name in CROPS.keys():
            try:
                model_path = MODEL_PATHS['disease_models'][crop_name]
                if os.path.exists(model_path):
                    self.disease_models[crop_name] = tf.keras.models.load_model(model_path)
                    print(f"   ✓ {crop_name} disease classifier loaded")
                else:
                    print(f"   ⚠ {crop_name} disease classifier not found")
            except Exception as e:
                print(f"   ❌ Error loading {crop_name} classifier: {e}")
    
    def _load_class_indices(self):
        """Load class indices for all crops"""
        print("🔄 Loading class indices...")
        
        # Crop classes
        try:
            with open(MODEL_PATHS['crop_class_indices'], 'r') as f:
                self.crop_classes = json.load(f)
                self.inverse_crop_classes = {v: k for k, v in self.crop_classes.items()}
                print(f"   ✓ Crop classes: {len(self.crop_classes)} crops")
        except Exception as e:
            print(f"   ⚠ Error loading crop classes: {e}")
        
        # Disease classes for each crop
        for crop_name in CROPS.keys():
            try:
                class_indices_path = MODEL_PATHS['disease_class_indices'][crop_name]
                if os.path.exists(class_indices_path):
                    with open(class_indices_path, 'r') as f:
                        self.disease_classes[crop_name] = json.load(f)
                        print(f"   ✓ {crop_name} disease classes: {len(self.disease_classes[crop_name])} diseases")
                else:
                    print(f"   ⚠ {crop_name} disease classes not found")
            except Exception as e:
                print(f"   ⚠ Error loading {crop_name} disease classes: {e}")
    
    def _load_recommendations(self):
        """Load treatment and advisory recommendations"""
        print("🔄 Loading recommendations...")
        
        try:
            # Load disease_crop_mapping for recommendations
            mapping_path = os.path.join(os.path.dirname(__file__), 'disease_crop_mapping.json')
            with open(mapping_path, 'r') as f:
                self.recommendations = json.load(f)
                print(f"   ✓ Recommendations loaded")
        except Exception as e:
            print(f"   ⚠ Error loading recommendations: {e}")
            self.recommendations = None
    
    def preprocess_image(self, image_path):
        """Preprocess image for model prediction"""
        try:
            image = Image.open(image_path).convert('RGB')
            image = image.resize((IMAGE_SIZE, IMAGE_SIZE))
            image_array = np.array(image) / 255.0
            return np.expand_dims(image_array, axis=0)
        except Exception as e:
            raise Exception(f"Error preprocessing image: {e}")
    
    def predict_crop(self, image_array):
        """Stage 1: Predict crop type"""
        if self.crop_model is None:
            return None, 0.0
        
        try:
            predictions = self.crop_model.predict(image_array, verbose=0)
            confidence = np.max(predictions)
            crop_idx = np.argmax(predictions)
            crop_name = self.inverse_crop_classes.get(crop_idx, "Unknown")
            
            return crop_name, float(confidence)
        except Exception as e:
            raise Exception(f"Error in crop prediction: {e}")
    
    def predict_disease(self, crop_name, image_array):
        """Stage 2: Predict disease (crop-specific)"""
        if crop_name not in self.disease_models or self.disease_models[crop_name] is None:
            return None, 0.0
        
        try:
            model = self.disease_models[crop_name]
            predictions = model.predict(image_array, verbose=0)
            confidence = np.max(predictions)
            disease_idx = np.argmax(predictions)
            
            # Map index to disease name
            disease_classes = self.disease_classes.get(crop_name, {})
            inverse_disease_classes = {v: k for k, v in disease_classes.items()}
            disease_name = inverse_disease_classes.get(disease_idx, "Unknown")
            
            return disease_name, float(confidence)
        except Exception as e:
            raise Exception(f"Error in disease prediction: {e}")
    
    def calculate_severity(self, crop_conf, disease_conf):
        """Calculate severity based on confidence scores"""
        avg_confidence = (crop_conf + disease_conf) / 2 * 100
        
        if avg_confidence > 85:
            level = "High"
            description = "High disease severity - immediate action recommended"
        elif avg_confidence >= 65:
            level = "Medium"
            description = "Medium disease severity - monitor and apply treatment"
        else:
            level = "Low"
            description = "Low disease severity - preventive measures sufficient"
        
        return {
            'level': level,
            'percentage': f"{avg_confidence:.2f}%",
            'description': description
        }
    
    def get_treatment(self, crop_name, disease_name):
        """Get treatment recommendation"""
        # Default treatments
        treatments = {
            'Bacterial Blight': 'Apply copper-based fungicide. Use disease-resistant varieties.',
            'Brown Spot': 'Apply fungicide containing mancozeb or carbendazim.',
            'Leaf Smut': 'Use seed treatment and apply fungicides during growing season.',
            'Early Blight': 'Apply copper-based or chlorothalonil fungicides. Remove infected leaves.',
            'Late Blight': 'Use metalaxyl-based fungicides. Improve air circulation.',
            'Leaf Mold': 'Maintain proper ventilation. Apply sulfur-based fungicides.',
            'Common Rust': 'Apply triadimefon or sulfur. Use resistant varieties.',
            'Leaf Blight': 'Apply fungicide. Remove infected plant parts.',
            'Scab': 'Apply sulfur or lime-sulfur spray during growing season.',
            'Black Rot': 'Prune infected branches. Apply fungicide regularly.',
            'Sigatoka': 'Apply proper fungicide program. Remove infected leaves.',
            'Anthracnose': 'Apply mancozeb or copper fungicides.',
            'Bacterial Spot': 'Apply copper-based fungicide. Remove infected parts.',
            'Canker': 'Prune infected branches. Apply copper fungicide.',
            'Rust': 'Apply sulfur or triadimefon fungicides.',
            'White Rust': 'Apply copper-based fungicides. Improve drainage.',
            'Powdery Mildew': 'Apply sulfur-based fungicides. Improve air circulation.',
            'Septoria Tritici Blotch': 'Apply azole fungicides at boot stage.',
            'Leaf Curl': 'Apply systemic insecticide. Improve irrigation.',
            'Pink Root': 'Use resistant varieties. Proper field sanitation.',
            'Fusarium Basal Rot': 'Use hot water treatment on bulbs.',
            'Phomopsis Blight': 'Apply chlorothalonil fungicides.',
            'Leaf Spot': 'Apply mancozeb fungicides. Remove infected leaves.',
        }
        
        return treatments.get(disease_name, "Consult agricultural expert for treatment recommendations.")
    
    def get_advisory(self, crop_name, disease_name):
        """Get advisory/prevention tip"""
        advisories = {
            'Bacterial Blight': 'Avoid overhead irrigation. Use clean seeds. Ensure crop rotation.',
            'Brown Spot': 'Avoid waterlogging. Use good drainage. Plant resistant varieties.',
            'Leaf Smut': 'Clean field before planting. Use certified seeds. Avoid high humidity.',
            'Early Blight': 'Remove lower infected leaves. Ensure good air circulation.',
            'Late Blight': 'Plant resistant varieties. Avoid crowding. Monitor humidity levels.',
            'Leaf Mold': 'Reduce humidity. Improve ventilation. Space plants properly.',
            'Common Rust': 'Plant resistant varieties. Remove infected leaves promptly.',
            'Leaf Blight': 'Maintain field hygiene. Use resistant varieties.',
            'Scab': 'Use disease-free seeds. Prune during dormancy.',
            'Black Rot': 'Remove infected branches immediately. Sterilize pruning tools.',
            'Sigatoka': 'Remove older leaves. Proper canopy management.',
            'Anthracnose': 'Remove infected fruit. Improve air flow.',
            'Bacterial Spot': 'Use disease-free seeds. Avoid wetting foliage.',
            'Canker': 'Prune in dry weather. Remove diseased parts.',
            'Rust': 'Plant resistant varieties. Avoid excess moisture.',
            'White Rust': 'Ensure proper drainage. Use resistant varieties.',
            'Powdery Mildew': 'Maintain dry conditions. Good air circulation essential.',
            'Septoria Tritici Blotch': 'Use resistant varieties. Timely fungicide application.',
            'Leaf Curl': 'Control vector insects. Irrigate properly.',
            'Pink Root': 'Crop rotation essential. Use resistant varieties.',
            'Fusarium Basal Rot': 'Store bulbs in cool dry conditions.',
            'Phomopsis Blight': 'Use resistant varieties. Field sanitation important.',
            'Leaf Spot': 'Remove infected leaves. Avoid overhead watering.',
        }
        
        return advisories.get(disease_name, "Practice good agricultural management and field hygiene.")
    
    def predict(self, image_path):
        """Complete prediction pipeline"""
        result = {
            'status': 'error',
            'crop': None,
            'crop_confidence': 0,
            'disease': None,
            'disease_confidence': 0,
            'severity': None,
            'treatment': None,
            'advisory': None,
            'timestamp': datetime.now().isoformat(),
            'error': None
        }
        
        try:
            # Verify image exists
            if not os.path.exists(image_path):
                result['error'] = f"Image not found: {image_path}"
                return result
            
            # Preprocess
            image_array = self.preprocess_image(image_path)
            
            # Stage 1: Crop prediction
            crop_name, crop_conf = self.predict_crop(image_array)
            
            if crop_conf < CROP_PREDICTION_THRESHOLD:
                result['error'] = f"Crop prediction confidence too low ({crop_conf:.4f} < {CROP_PREDICTION_THRESHOLD})"
                return result
            
            result['crop'] = crop_name
            result['crop_confidence'] = crop_conf
            
            # Stage 2: Disease prediction
            disease_name, disease_conf = self.predict_disease(crop_name, image_array)
            
            if disease_conf < DISEASE_PREDICTION_THRESHOLD:
                result['error'] = f"Disease prediction confidence too low ({disease_conf:.4f} < {DISEASE_PREDICTION_THRESHOLD})"
                return result
            
            result['disease'] = disease_name
            result['disease_confidence'] = disease_conf
            
            # Stage 3: Severity calculation
            result['severity'] = self.calculate_severity(crop_conf, disease_conf)
            
            # Stage 4: Recommendations
            result['treatment'] = self.get_treatment(crop_name, disease_name)
            result['advisory'] = self.get_advisory(crop_name, disease_name)
            
            result['status'] = 'success'
            
        except Exception as e:
            result['error'] = str(e)
        
        return result
    
    def batch_predict(self, image_paths):
        """Batch predict multiple images"""
        results = []
        for i, image_path in enumerate(image_paths, 1):
            print(f"[{i}/{len(image_paths)}] Processing {os.path.basename(image_path)}...")
            result = self.predict(image_path)
            results.append(result)
        
        return results

# ============================================================================
# FACTORY FUNCTION
# ============================================================================
def create_pipeline():
    """Create and return pipeline instance"""
    return MultiCropDiseaseDetectionPipeline()

# ============================================================================
# EXAMPLE USAGE
# ============================================================================
if __name__ == "__main__":
    print("\n" + "="*70)
    print("MULTI-CROP DISEASE DETECTION - INFERENCE TEST")
    print("="*70)
    
    # Create pipeline
    pipeline = create_pipeline()
    
    # Test with sample rice image
    test_image = "dataset/train/Bacterial leaf blight/DSC_0365.JPG"
    
    if os.path.exists(test_image):
        print(f"\n📷 Testing with: {test_image}\n")
        
        result = pipeline.predict(test_image)
        
        print("\n" + "="*70)
        print("PREDICTION RESULTS")
        print("="*70)
        print(json.dumps(result, indent=2))
        
        if result['status'] == 'success':
            print(f"\n✅ Prediction successful!")
            print(f"   Crop: {result['crop']} ({result['crop_confidence']:.2%})")
            print(f"   Disease: {result['disease']} ({result['disease_confidence']:.2%})")
            print(f"   Severity: {result['severity']['level']}")
    else:
        print(f"❌ Test image not found: {test_image}")
        print(f"\n📋 Create dataset structure:")
        print(f"   dataset_multi_crop/")
        print(f"   ├── combined_train/")
        print(f"   │   ├── Rice/")
        print(f"   │   ├── Tomato/")
        print(f"   │   └── ... (10 crops)")
        print(f"   └── combined_validation/")
