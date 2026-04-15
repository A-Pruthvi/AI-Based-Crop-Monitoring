"""
Unified Disease Detection API
Handles disease/crop prediction from images with recommendations and severity
Uses the trained unified EfficientNetB4 model (models_unified/best_model.h5)
"""

import json
import os
import sys
from datetime import datetime
from typing import Dict, List, Tuple, Optional

import numpy as np
import tensorflow as tf
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Import treatment recommender for new scalable system
try:
    from recommendations.treatment_recommender import TreatmentRecommender
    TREATMENT_RECOMMENDER_AVAILABLE = True
except ImportError:
    TREATMENT_RECOMMENDER_AVAILABLE = False
    print("⚠️  Treatment recommender module not available")

# Import Grad-CAM visualization integration
try:
    from gradcam_api_integration import register_gradcam_routes
    GRADCAM_AVAILABLE = True
except ImportError:
    GRADCAM_AVAILABLE = False
    print("⚠️  Grad-CAM visualization module not available")

app = Flask(__name__)
CORS(app, origins=["*"])  # Allow all origins for development

# ============================================================================
# CONFIG
# ============================================================================
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, 'models_unified', 'best_model.h5')
CLASS_MAPPING_PATH = os.path.join(SCRIPT_DIR, 'dataset_unified', 'class_mapping.json')
TREATMENTS_PATH = os.path.join(SCRIPT_DIR, 'recommendations', 'treatments.json')
ADVISORIES_PATH = os.path.join(SCRIPT_DIR, 'recommendations', 'advisories.json')
UPLOADS_DIR = os.path.join(SCRIPT_DIR, 'uploads')

# Create directories if needed
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'bmp'}
CONFIDENCE_THRESHOLD = 0.45
IMAGE_SIZE = 512

# ============================================================================
# GLOBAL STATE
# ============================================================================
unified_model = None
class_mapping = None
treatments_data = None
advisories_data = None
treatment_recommender = None  # New scalable treatment system

# ============================================================================
# INITIALIZATION
# ============================================================================

def load_model_and_mappings():
    """Load trained model and class mappings"""
    global unified_model, class_mapping, treatments_data, advisories_data, treatment_recommender
    
    print("Loading unified disease detection model...")
    
    try:
        # Check if model exists
        if not os.path.exists(MODEL_PATH):
            return False, f"Model not found at {MODEL_PATH}. Training may not be complete."
        
        # Load model
        unified_model = tf.keras.models.load_model(MODEL_PATH)
        print(f"✅ Model loaded: {MODEL_PATH}")
        
        # Load class mapping
        with open(CLASS_MAPPING_PATH, 'r') as f:
            class_mapping = json.load(f)
        print(f"✅ Class mapping loaded: {len(class_mapping['class_names'])} classes")
        
        # Load treatments (legacy format support)
        if os.path.exists(TREATMENTS_PATH):
            with open(TREATMENTS_PATH, 'r') as f:
                treatments_data = json.load(f)
            print(f"✅ Treatments loaded")
        else:
            treatments_data = {}
            print("⚠️  Treatments file not found")
        
        # Load advisories
        if os.path.exists(ADVISORIES_PATH):
            with open(ADVISORIES_PATH, 'r') as f:
                advisories_data = json.load(f)
            print(f"✅ Advisories loaded")
        else:
            advisories_data = {}
            print("⚠️  Advisories file not found")
        
        # Initialize new scalable treatment recommender
        if TREATMENT_RECOMMENDER_AVAILABLE:
            treatment_recommender = TreatmentRecommender(TREATMENTS_PATH)
            print(f"✅ Treatment recommender initialized with {len(treatment_recommender.get_all_diseases())} diseases")
        else:
            print("⚠️  New treatment recommender not available, using legacy system")
        
        return True, "Model and mappings loaded successfully"
    
    except Exception as e:
        return False, f"Error loading model: {str(e)}"

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def allowed_file(filename: str) -> bool:
    """Check if file has allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_and_preprocess_image(image_path: str) -> Optional[np.ndarray]:
    """Load and preprocess image for model"""
    try:
        # Load image
        image = tf.keras.utils.load_img(image_path, target_size=(IMAGE_SIZE, IMAGE_SIZE))
        
        # Convert to array and normalize
        image_array = tf.keras.utils.img_to_array(image)
        image_array = image_array / 255.0  # Normalize to [0, 1]
        image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension
        
        return image_array
    
    except Exception as e:
        print(f"Error preprocessing image: {str(e)}")
        return None

def estimate_severity(confidence: float, image_array: np.ndarray) -> Dict[str, any]:
    """
    Estimate disease severity based on confidence and image features
    Returns severity score (0-100) and level (Mild/Moderate/Severe)
    """
    # Calculate severity based on confidence (higher confidence = more severe disease is detected)
    base_severity = int(confidence * 100)
    
    # Calculate image darkness/discoloration as indicator of severity
    if image_array is not None:
        mean_brightness = np.mean(image_array[0])  # Average pixel brightness
        
        # Lower brightness might indicate more disease damage
        if mean_brightness < 0.4:
            severity_adjustment = 20
            brightness_level = "Very dark"
        elif mean_brightness < 0.5:
            severity_adjustment = 10
            brightness_level = "Dark"
        elif mean_brightness < 0.6:
            severity_adjustment = 5
            brightness_level = "Moderate"
        else:
            severity_adjustment = 0
            brightness_level = "Bright"
        
        severity_score = min(100, base_severity + severity_adjustment)
    else:
        severity_score = base_severity
        brightness_level = "Unknown"
    
    # Determine severity level
    if severity_score < 30:
        severity_level = "Mild"
    elif severity_score < 70:
        severity_level = "Moderate"
    else:
        severity_level = "Severe"
    
    return {
        "score": severity_score,
        "level": severity_level,
        "confidence": round(confidence * 100, 2)
    }

def get_recommendations(disease_name: str, crop_name: str) -> Dict[str, any]:
    """Get treatment recommendations and health advice using scalable system"""
    disease_id = f"{crop_name}/{disease_name}"
    
    recommendations = {
        "treatment": "Standard care - consult your local agricultural extension office",
        "application_method": "Follow recommended protocols",
        "duration": "7-14 days",
        "tips": [],
        "source": "legacy"
    }
    
    # Try new treatment recommender first (scalable system)
    if treatment_recommender:
        try:
            treatment = treatment_recommender.get_treatment(disease_id)
            if treatment:
                primary = treatment.get('primary_treatment', {})
                recommendations = {
                    "disease_name": treatment.get('disease_name'),
                    "crop": treatment.get('crop'),
                    "severity": treatment.get('severity'),
                    "treatment": primary.get('pesticide', 'Unknown'),
                    "brand_name": primary.get('brand_name', ''),
                    "dosage": primary.get('dosage', {}),
                    "application_method": primary.get('application_method'),
                    "duration": primary.get('duration'),
                    "precautions": treatment.get('precautions', []),
                    "best_practices": treatment.get('best_practices', []),
                    "effectiveness": treatment.get('effectiveness'),
                    "cost_estimate": treatment.get('cost_estimate'),
                    "alternative_treatments": treatment.get('alternative_treatments', []),
                    "source": "scalable_new"
                }
                return recommendations
        except Exception as e:
            print(f"Warning: Error using treatment recommender: {e}")
    
    # Fallback to legacy treatment data
    if treatments_data and 'treatment_index' in treatments_data:
        if disease_id in treatments_data['treatment_index']:
            legacy_treatment = treatments_data['treatment_index'][disease_id]
            primary = legacy_treatment.get('primary_treatment', {})
            recommendations = {
                "disease_name": legacy_treatment.get('disease_name'),
                "crop": legacy_treatment.get('crop'),
                "severity": legacy_treatment.get('severity'),
                "treatment": primary.get('pesticide', 'Unknown'),
                "brand_name": primary.get('brand_name', ''),
                "dosage": primary.get('dosage', {}),
                "application_method": primary.get('application_method'),
                "duration": legacy_treatment.get('duration'),
                "precautions": legacy_treatment.get('precautions', []),
                "best_practices": legacy_treatment.get('best_practices', []),
                "effectiveness": legacy_treatment.get('effectiveness'),
                "cost_estimate": legacy_treatment.get('cost_estimate'),
                "source": "database"
            }
            return recommendations
    
    # Add generic tips for fallback case
    generic_tips = [
        "Ensure proper drainage to prevent fungal growth",
        "Remove infected leaves to prevent disease spread",
        "Maintain optimal humidity levels",
        "Apply treatment in early morning or late evening",
        "Monitor plant health regularly"
    ]
    recommendations["tips"] = generic_tips
    
    return recommendations

def parse_prediction(class_name: str) -> Tuple[str, str]:
    """Parse 'Crop/Disease' format into crop and disease"""
    if '/' in class_name:
        crop, disease = class_name.split('/', 1)
        return crop.strip(), disease.strip()
    return "Unknown", class_name

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    model_status = "Ready" if unified_model is not None else "Not loaded"
    return jsonify({
        "status": "healthy",
        "model": model_status,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint
    Accepts image upload and returns disease prediction with recommendations
    """
    
    if unified_model is None:
        return jsonify({
            "success": False,
            "error": "Model not loaded. Training may not be complete."
        }), 503
    
    # Check if file is in request
    if 'image' not in request.files:
        return jsonify({
            "success": False,
            "error": "No image provided"
        }), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({
            "success": False,
            "error": "No file selected"
        }), 400
    
    if not allowed_file(file.filename):
        return jsonify({
            "success": False,
            "error": f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        }), 400
    
    try:
        # Save uploaded file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{filename}"
        image_path = os.path.join(UPLOADS_DIR, filename)
        file.save(image_path)
        
        # Load and preprocess image
        image_array = load_and_preprocess_image(image_path)
        if image_array is None:
            return jsonify({
                "success": False,
                "error": "Failed to process image"
            }), 400
        
        # Make prediction
        predictions = unified_model.predict(image_array, verbose=0)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx])
        
        # Get class name
        predicted_class_name = class_mapping['class_names'][predicted_class_idx]
        crop_name, disease_name = parse_prediction(predicted_class_name)
        
        # Check confidence threshold
        if confidence < CONFIDENCE_THRESHOLD:
            return jsonify({
                "success": True,
                "prediction": {
                    "status": "uncertain",
                    "message": f"Confidence too low ({confidence:.2%}) - prediction may be unreliable",
                    "confidence": round(confidence * 100, 2)
                }
            }), 200
        
        # Estimate severity
        severity_info = estimate_severity(confidence, image_array)
        
        # Get recommendations
        recommendations = get_recommendations(disease_name, crop_name)
        
        # Build response
        response = {
            "success": True,
            "prediction": {
                "status": "detected",
                "disease": disease_name,
                "crop": crop_name,
                "confidence": round(confidence * 100, 2),
                "all_probabilities": [
                    {
                        "class": class_mapping['class_names'][i],
                        "probability": round(float(predictions[0][i]) * 100, 2)
                    }
                    for i in np.argsort(predictions[0])[::-1][:5]  # Top 5
                ]
            },
            "severity": severity_info,
            "recommendations": recommendations,
            "metadata": {
                "uploaded_file": filename,
                "model_confidence_threshold": round(CONFIDENCE_THRESHOLD * 100, 2),
                "timestamp": datetime.now().isoformat(),
                "model_version": "EfficientNetB4-Unified"
            }
        }
        
        return jsonify(response), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Prediction failed: {str(e)}"
        }), 500

@app.route('/api/batch-predict', methods=['POST'])
def batch_predict():
    """Batch prediction for multiple images"""
    
    if unified_model is None:
        return jsonify({
            "success": False,
            "error": "Model not loaded"
        }), 503
    
    images = request.files.getlist('images')
    
    if not images:
        return jsonify({
            "success": False,
            "error": "No images provided"
        }), 400
    
    results = []
    
    for file in images:
        if file.filename == '' or not allowed_file(file.filename):
            results.append({
                "filename": file.filename,
                "success": False,
                "error": "Invalid file"
            })
            continue
        
        try:
            # Save and process
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{timestamp}_{filename}"
            image_path = os.path.join(UPLOADS_DIR, filename)
            file.save(image_path)
            
            image_array = load_and_preprocess_image(image_path)
            if image_array is None:
                results.append({
                    "filename": filename,
                    "success": False,
                    "error": "Failed to process image"
                })
                continue
            
            # Predict
            predictions = unified_model.predict(image_array, verbose=0)
            predicted_class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class_idx])
            predicted_class_name = class_mapping['class_names'][predicted_class_idx]
            crop_name, disease_name = parse_prediction(predicted_class_name)
            
            results.append({
                "filename": filename,
                "success": True,
                "disease": disease_name,
                "crop": crop_name,
                "confidence": round(confidence * 100, 2),
                "severity": estimate_severity(confidence, image_array)
            })
        
        except Exception as e:
            results.append({
                "filename": file.filename,
                "success": False,
                "error": str(e)
            })
    
    return jsonify({
        "success": True,
        "total": len(images),
        "processed": len([r for r in results if r.get("success", False)]),
        "results": results
    }), 200

@app.route('/api/classes', methods=['GET'])
def get_classes():
    """Get list of all disease classes"""
    if class_mapping is None:
        return jsonify({"error": "Class mapping not loaded"}), 503
    
    return jsonify({
        "total_classes": len(class_mapping['class_names']),
        "classes": class_mapping['class_names']
    }), 200

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    print("\n" + "="*80)
    print("UNIFIED DISEASE DETECTION API")
    print("="*80)
    
    # Load model on startup
    success, message = load_model_and_mappings()
    print(f"\n{message}\n")
    
    if not success:
        print("⚠️  WARNING: Model failed to load. API will return error on predictions.")
    
    # Register Grad-CAM visualization routes
    if GRADCAM_AVAILABLE:
        try:
            register_gradcam_routes(app)
            print("\n✅ Grad-CAM visualization routes registered")
            print("   /api/gradcam/* endpoints are now available")
        except Exception as e:
            print(f"⚠️  Could not register Grad-CAM routes: {e}")
    else:
        print("⚠️  Grad-CAM visualization not available (gradcam_api_integration module not found)")
    
    print("\nStarting Flask server...")
    print("API available at: http://localhost:5000")
    print("\nEndpoints:")
    print("  GET  /api/health           - Health check")
    print("  POST /api/predict          - Single image prediction")
    print("  POST /api/batch-predict    - Multiple images prediction")
    print("  GET  /api/classes          - List all disease classes")
    print("\n" + "="*80 + "\n")
    
    # Run server
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,
        threaded=True
    )
