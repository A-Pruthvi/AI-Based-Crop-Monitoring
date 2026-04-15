"""
Complete Crop Disease Detection Pipeline
Two-stage prediction: Crop Classification → Disease Classification
With severity estimation and treatment recommendations
"""

import json
import os
import sys
from datetime import datetime
from typing import Dict, Tuple, Optional

import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image as keras_image

from config import (
    CROP_CLASSIFIER_PATH, DISEASE_CLASSIFIER_PATH,
    CROP_CLASS_INDICES_PATH, DISEASE_CLASS_INDICES_PATH,
    CROP_CONFIDENCE_THRESHOLD, DISEASE_CONFIDENCE_THRESHOLD,
    IMAGE_SIZE
)


class CropDiseaseDetectionPipeline:
    """
    Production-grade crop disease detection pipeline.
    
    Attributes:
        crop_model: Loaded crop classification model
        disease_model: Loaded disease classification model
        crop_classes: Mapping of crop class indices to names
        disease_classes: Mapping of disease class indices to names
    """
    
    def __init__(self):
        """Initialize models and class mappings."""
        self.crop_model = None
        self.disease_model = None
        self.crop_classes = {}
        self.disease_classes = {}
        self._initialized = False
        
        try:
            self._load_models()
            self._load_class_indices()
            self._initialized = True
            print("✅ Pipeline initialized successfully")
        except Exception as e:
            print(f"❌ Pipeline initialization failed: {str(e)}")
            self._initialized = False
            raise
    
    def _load_models(self) -> None:
        """
        Load crop and disease classification models.
        
        Raises:
            FileNotFoundError: If model files don't exist
            Exception: If model loading fails
        """
        print("🔄 Loading models...")
        
        # Check model paths exist
        if not os.path.exists(CROP_CLASSIFIER_PATH):
            raise FileNotFoundError(f"Crop model not found: {CROP_CLASSIFIER_PATH}")
        if not os.path.exists(DISEASE_CLASSIFIER_PATH):
            raise FileNotFoundError(f"Disease model not found: {DISEASE_CLASSIFIER_PATH}")
        
        # Load models
        try:
            self.crop_model = load_model(CROP_CLASSIFIER_PATH)
            print(f"   ✓ Crop model loaded: {CROP_CLASSIFIER_PATH}")
        except Exception as e:
            raise Exception(f"Failed to load crop model: {str(e)}")
        
        try:
            self.disease_model = load_model(DISEASE_CLASSIFIER_PATH)
            print(f"   ✓ Disease model loaded: {DISEASE_CLASSIFIER_PATH}")
        except Exception as e:
            raise Exception(f"Failed to load disease model: {str(e)}")
    
    def _load_class_indices(self) -> None:
        """
        Load class name mappings from JSON files.
        
        Raises:
            FileNotFoundError: If class index files don't exist
            json.JSONDecodeError: If JSON parsing fails
        """
        print("🔄 Loading class indices...")
        
        # Load crop classes
        if not os.path.exists(CROP_CLASS_INDICES_PATH):
            raise FileNotFoundError(f"Crop indices not found: {CROP_CLASS_INDICES_PATH}")
        
        try:
            with open(CROP_CLASS_INDICES_PATH, 'r') as f:
                crop_indices = json.load(f)
                # Reverse mapping: index (int string) -> class name
                self.crop_classes = {int(v): k for k, v in crop_indices.items()}
            print(f"   ✓ Crop classes loaded: {len(self.crop_classes)} classes")
        except Exception as e:
            raise Exception(f"Failed to load crop class indices: {str(e)}")
        
        # Load disease classes
        if not os.path.exists(DISEASE_CLASS_INDICES_PATH):
            raise FileNotFoundError(f"Disease indices not found: {DISEASE_CLASS_INDICES_PATH}")
        
        try:
            with open(DISEASE_CLASS_INDICES_PATH, 'r') as f:
                disease_indices = json.load(f)
                # Reverse mapping: index (int string) -> class name
                self.disease_classes = {int(v): k for k, v in disease_indices.items()}
            print(f"   ✓ Disease classes loaded: {len(self.disease_classes)} classes")
        except Exception as e:
            raise Exception(f"Failed to load disease class indices: {str(e)}")
    
    def preprocess_image(self, image_path: str) -> Optional[np.ndarray]:
        """
        Preprocess image for model prediction.
        
        Args:
            image_path: Path to input image
            
        Returns:
            Preprocessed image array or None if preprocessing fails
            
        Raises:
            FileNotFoundError: If image file doesn't exist
            Exception: If image preprocessing fails
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        try:
            # Load and resize image
            img = keras_image.load_img(image_path, target_size=IMAGE_SIZE)
            img_array = keras_image.img_to_array(img)
            
            # Expand batch dimension
            img_array = np.expand_dims(img_array, axis=0)
            
            # Normalize to [0, 1]
            img_array = img_array / 255.0
            
            return img_array
        except Exception as e:
            raise Exception(f"Image preprocessing failed: {str(e)}")
    
    def _predict_crop(self, image_array: np.ndarray) -> Tuple[str, float, Optional[str]]:
        """
        Classify crop from preprocessed image.
        
        Args:
            image_array: Preprocessed image array
            
        Returns:
            Tuple of (crop_name, confidence, error_message)
            - If successful: (crop_name, confidence, None)
            - If failed: (None, 0.0, error_message)
        """
        try:
            predictions = self.crop_model.predict(image_array, verbose=0)
            confidence = float(np.max(predictions))
            class_index = int(np.argmax(predictions))
            crop_name = self.crop_classes.get(class_index, "Unknown")
            
            return crop_name, confidence, None
        except Exception as e:
            return None, 0.0, f"Crop prediction failed: {str(e)}"
    
    def _predict_disease(self, image_array: np.ndarray) -> Tuple[str, float, Optional[str]]:
        """
        Classify disease from preprocessed image.
        
        Args:
            image_array: Preprocessed image array
            
        Returns:
            Tuple of (disease_name, confidence, error_message)
            - If successful: (disease_name, confidence, None)
            - If failed: (None, 0.0, error_message)
        """
        try:
            predictions = self.disease_model.predict(image_array, verbose=0)
            confidence = float(np.max(predictions))
            class_index = int(np.argmax(predictions))
            disease_name = self.disease_classes.get(class_index, "Unknown")
            
            return disease_name, confidence, None
        except Exception as e:
            return None, 0.0, f"Disease prediction failed: {str(e)}"
    
    def calculate_severity(self, 
                          crop_confidence: float, 
                          disease_confidence: float) -> Dict[str, str]:
        """
        Calculate disease severity based on model confidences.
        
        Severity Levels:
        - High (>85%): Average confidence > 0.85
        - Medium (65-85%): Average confidence 0.65-0.85
        - Low (<65%): Average confidence < 0.65
        
        Args:
            crop_confidence: Confidence of crop prediction
            disease_confidence: Confidence of disease prediction
            
        Returns:
            Dictionary with severity level and description
        """
        avg_confidence = (crop_confidence + disease_confidence) / 2
        
        if avg_confidence > 0.85:
            return {
                "level": "High",
                "percentage": f"{avg_confidence*100:.2f}%",
                "description": "High disease severity - immediate action recommended"
            }
        elif avg_confidence >= 0.65:
            return {
                "level": "Medium",
                "percentage": f"{avg_confidence*100:.2f}%",
                "description": "Medium disease severity - monitor and treat"
            }
        else:
            return {
                "level": "Low",
                "percentage": f"{avg_confidence*100:.2f}%",
                "description": "Low disease severity - preventive measures"
            }
    
    def get_treatment(self, disease_name: str) -> str:
        """
        Get treatment recommendation for detected disease.
        
        Args:
            disease_name: Name of detected disease
            
        Returns:
            Treatment recommendation string
        """
        try:
            treatment_path = "recommendations/treatments.json"
            if os.path.exists(treatment_path):
                with open(treatment_path, 'r') as f:
                    treatments = json.load(f)
                    return treatments.get(disease_name, "Consult agricultural specialist")
            else:
                return "Consult agricultural specialist"
        except Exception as e:
            print(f"⚠️  Warning: Failed to load treatments: {str(e)}")
            return "Consult agricultural specialist"
    
    def get_advisory(self, disease_name: str) -> str:
        """
        Get advisory for detected disease.
        
        Args:
            disease_name: Name of detected disease
            
        Returns:
            Advisory string
        """
        try:
            advisory_path = "recommendations/advisories.json"
            if os.path.exists(advisory_path):
                with open(advisory_path, 'r') as f:
                    advisories = json.load(f)
                    return advisories.get(disease_name, "Follow standard agricultural practices")
            else:
                return "Follow standard agricultural practices"
        except Exception as e:
            print(f"⚠️  Warning: Failed to load advisories: {str(e)}")
            return "Follow standard agricultural practices"
    
    def predict(self, image_path: str) -> Dict:
        """
        Complete prediction pipeline: preprocess → crop classification → disease classification.
        
        Args:
            image_path: Path to input image
            
        Returns:
            Structured result dictionary with keys:
            - status: "success" or "error"
            - crop: Detected crop name (or None)
            - crop_confidence: Confidence for crop (0-1)
            - disease: Detected disease name (or None)
            - disease_confidence: Confidence for disease (0-1)
            - severity: Severity level and details
            - treatment: Treatment recommendation
            - advisory: Disease advisory
            - timestamp: When prediction was made
            - error: Error message if status is "error"
        """
        result = {
            "status": "error",
            "crop": None,
            "crop_confidence": 0.0,
            "disease": None,
            "disease_confidence": 0.0,
            "severity": None,
            "treatment": None,
            "advisory": None,
            "timestamp": datetime.now().isoformat(),
            "error": None
        }
        
        try:
            # Step 1: Validate pipeline initialization
            if not self._initialized:
                result["error"] = "Pipeline not properly initialized"
                return result
            
            # Step 2: Preprocess image
            try:
                image_array = self.preprocess_image(image_path)
            except FileNotFoundError:
                result["error"] = f"Image not found: {image_path}"
                return result
            except Exception as e:
                result["error"] = f"Image preprocessing failed: {str(e)}"
                return result
            
            # Step 3: Predict crop
            crop_name, crop_conf, crop_error = self._predict_crop(image_array)
            
            if crop_error:
                result["error"] = crop_error
                return result
            
            result["crop"] = crop_name
            result["crop_confidence"] = crop_conf
            
            # Step 4: Check crop confidence threshold
            if crop_conf < CROP_CONFIDENCE_THRESHOLD:
                result["status"] = "success"
                result["error"] = f"Unknown crop (confidence {crop_conf:.4f} < {CROP_CONFIDENCE_THRESHOLD})"
                return result
            
            # Step 5: Predict disease
            disease_name, disease_conf, disease_error = self._predict_disease(image_array)
            
            if disease_error:
                result["error"] = disease_error
                return result
            
            result["disease"] = disease_name
            result["disease_confidence"] = disease_conf
            
            # Step 6: Check disease confidence threshold
            if disease_conf < DISEASE_CONFIDENCE_THRESHOLD:
                result["status"] = "success"
                result["error"] = f"Unknown disease (confidence {disease_conf:.4f} < {DISEASE_CONFIDENCE_THRESHOLD})"
                return result
            
            # Step 7: Calculate severity
            severity = self.calculate_severity(crop_conf, disease_conf)
            result["severity"] = severity
            
            # Step 8: Get treatment and advisory
            result["treatment"] = self.get_treatment(disease_name)
            result["advisory"] = self.get_advisory(disease_name)
            
            # Step 9: Mark as successful
            result["status"] = "success"
            
            return result
        
        except Exception as e:
            result["error"] = f"Unexpected error: {str(e)}"
            print(f"❌ Pipeline error: {str(e)}")
            return result
    
    def batch_predict(self, image_paths: list) -> list:
        """
        Process multiple images in batch.
        
        Args:
            image_paths: List of image paths
            
        Returns:
            List of prediction results
        """
        results = []
        for idx, image_path in enumerate(image_paths, 1):
            print(f"🔄 Processing {idx}/{len(image_paths)}: {image_path}")
            result = self.predict(image_path)
            results.append(result)
        return results


def create_pipeline() -> CropDiseaseDetectionPipeline:
    """
    Factory function to create and initialize the pipeline.
    
    Returns:
        Initialized pipeline instance
        
    Raises:
        Exception: If pipeline initialization fails
    """
    return CropDiseaseDetectionPipeline()


# Example usage
if __name__ == '__main__':
    print("=" * 70)
    print("CROP DISEASE DETECTION PIPELINE - TEST")
    print("=" * 70)
    
    try:
        # Initialize pipeline
        print("\n🚀 Initializing pipeline...")
        pipeline = create_pipeline()
        
        # Example: Predict on a test image
        test_image = 'dataset/train/Bacterial leaf blight/DSC_0365.JPG'
        
        if os.path.exists(test_image):
            print(f"\n📷 Running prediction on: {test_image}")
            result = pipeline.predict(test_image)
            
            # Display results
            print("\n" + "=" * 70)
            print("PREDICTION RESULTS")
            print("=" * 70)
            print(json.dumps(result, indent=2))
            
            # Print summary
            if result['status'] == 'success':
                print("\n✅ Prediction successful!")
                if result['crop']:
                    print(f"   Crop: {result['crop']} ({result['crop_confidence']:.4f})")
                if result['disease']:
                    print(f"   Disease: {result['disease']} ({result['disease_confidence']:.4f})")
                    print(f"   Severity: {result['severity']['level']}")
                    print(f"   Treatment: {result['treatment']}")
            else:
                print(f"\n⚠️  {result['error']}")
        else:
            print(f"\n❌ Test image not found: {test_image}")
    
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)
