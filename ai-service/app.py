"""
AI Service - Drone Crop Monitoring System
Flask application for crop disease detection using CNN model
"""

import os
import json
import random
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import numpy as np

# Import preprocessing utilities
from utils.image_preprocessing import preprocess_image, validate_image

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://localhost:8080'])

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MODEL_PATH'] = 'model/crop_model.h5'

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('model', exist_ok=True)

# Disease classes (based on common crop diseases)
DISEASE_CLASSES = [
    'Healthy',
    'Bacterial Blight',
    'Brown Spot',
    'Leaf Blast',
    'Leaf Rust',
    'Tungro',
    'Sheath Blight',
    'False Smut',
    'Hispa',
    'Neck Blast'
]

# Treatment recommendations for each disease
TREATMENT_RECOMMENDATIONS = {
    'Healthy': [
        'Continue regular monitoring',
        'Maintain proper irrigation schedule',
        'Apply balanced fertilizers as needed'
    ],
    'Bacterial Blight': [
        'Apply copper-based bactericides (Copper hydroxide 2g/L)',
        'Remove and destroy infected plant parts',
        'Avoid overhead irrigation to reduce moisture',
        'Use resistant varieties in future planting',
        'Apply streptomycin sulfate (500ppm) as foliar spray'
    ],
    'Brown Spot': [
        'Apply fungicide (Mancozeb 2.5g/L or Carbendazim 1g/L)',
        'Improve field drainage',
        'Apply balanced nitrogen fertilization',
        'Spray Propiconazole 1ml/L at 15-day intervals',
        'Remove crop residues after harvest'
    ],
    'Leaf Blast': [
        'Apply Tricyclazole 0.6g/L as preventive spray',
        'Drain excess water from fields',
        'Avoid excessive nitrogen application',
        'Apply Isoprothiolane 1.5ml/L',
        'Use silicon-based fertilizers to strengthen plant cells'
    ],
    'Leaf Rust': [
        'Apply fungicide Propiconazole (1ml/L) or Tebuconazole',
        'Remove infected leaves immediately',
        'Ensure proper spacing for air circulation',
        'Apply Mancozeb 2.5g/L preventively',
        'Use rust-resistant crop varieties'
    ],
    'Tungro': [
        'Control green leafhopper vectors with Imidacloprid',
        'Remove and destroy infected plants',
        'Synchronize planting with neighboring fields',
        'Use Tungro-resistant varieties',
        'Apply Carbofuran granules in nursery'
    ],
    'Sheath Blight': [
        'Apply Validamycin 2ml/L or Hexaconazole 1ml/L',
        'Reduce plant density for better aeration',
        'Avoid excess nitrogen fertilizer',
        'Drain standing water from fields',
        'Apply Trichoderma-based biocontrol agents'
    ],
    'False Smut': [
        'Apply Propiconazole 1ml/L at booting stage',
        'Remove and destroy infected panicles',
        'Use disease-free seeds',
        'Apply Copper oxychloride at flowering',
        'Avoid late nitrogen application'
    ],
    'Hispa': [
        'Apply Chlorpyrifos 2ml/L or Quinalphos',
        'Remove grassy weeds from field margins',
        'Clip and destroy leaf tips containing eggs',
        'Apply Neem-based pesticides',
        'Release natural predators like parasitic wasps'
    ],
    'Neck Blast': [
        'Apply Tricyclazole before heading stage',
        'Avoid late planting',
        'Use balanced fertilization',
        'Apply Isoprothiolane 1.5ml/L at panicle initiation',
        'Ensure proper drainage'
    ]
}

# Severity mapping based on confidence
def get_severity(confidence, is_healthy):
    if is_healthy:
        return 'LOW'
    if confidence >= 90:
        return 'CRITICAL'
    elif confidence >= 75:
        return 'HIGH'
    elif confidence >= 50:
        return 'MEDIUM'
    else:
        return 'LOW'

# Model placeholder - will load actual model when available
model = None

def load_model():
    """Load the trained CNN model."""
    global model
    model_path = app.config['MODEL_PATH']
    
    if os.path.exists(model_path):
        try:
            from tensorflow.keras.models import load_model as keras_load
            model = keras_load(model_path)
            print(f"Model loaded successfully from {model_path}")
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    else:
        print(f"Model file not found at {model_path}. Using simulation mode.")
        return False


def simulate_prediction(image_array):
    """
    Simulate model prediction when actual model is not available.
    This is for development/testing purposes.
    """
    # Simulate processing delay
    import time
    time.sleep(0.5)
    
    # Generate random predictions with realistic distribution
    # Healthy crops should be more common
    weights = [0.4, 0.1, 0.08, 0.07, 0.1, 0.05, 0.06, 0.04, 0.05, 0.05]
    disease_index = random.choices(range(len(DISEASE_CLASSES)), weights=weights)[0]
    
    # Generate confidence score
    if disease_index == 0:  # Healthy
        confidence = random.uniform(85, 99)
    else:
        confidence = random.uniform(60, 98)
    
    return disease_index, confidence


def predict_disease(image_array):
    """
    Predict disease from preprocessed image array.
    
    Args:
        image_array: Preprocessed image numpy array
        
    Returns:
        tuple: (disease_name, confidence_score, is_healthy)
    """
    global model
    
    if model is not None:
        # Use actual model prediction
        predictions = model.predict(image_array, verbose=0)
        disease_index = np.argmax(predictions[0])
        confidence = float(predictions[0][disease_index]) * 100
    else:
        # Use simulation
        disease_index, confidence = simulate_prediction(image_array)
    
    disease_name = DISEASE_CLASSES[disease_index]
    is_healthy = disease_index == 0
    
    return disease_name, round(confidence, 2), is_healthy


# ==================== API Endpoints ====================

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'Drone Crop AI Service',
        'version': '1.0.0',
        'model_loaded': model is not None
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint.
    
    Input: Multipart form with 'file' field containing the image
    Output: JSON with disease prediction results
    """
    # Check if file is present
    if 'file' not in request.files:
        return jsonify({
            'success': False,
            'error': 'No file provided',
            'message': 'Please upload an image file'
        }), 400
    
    file = request.files['file']
    
    # Check if filename is empty
    if file.filename == '':
        return jsonify({
            'success': False,
            'error': 'No file selected',
            'message': 'Please select an image file to upload'
        }), 400
    
    # Validate the image
    is_valid, error_message = validate_image(file)
    if not is_valid:
        return jsonify({
            'success': False,
            'error': 'Invalid image',
            'message': error_message
        }), 400
    
    try:
        # Preprocess the image
        image_array = preprocess_image(file)
        
        # Get prediction
        disease_name, confidence, is_healthy = predict_disease(image_array)
        severity = get_severity(confidence, is_healthy)
        treatments = TREATMENT_RECOMMENDATIONS.get(disease_name, [])
        
        # Build response
        response = {
            'success': True,
            'data': {
                'disease': disease_name,
                'confidence': confidence,
                'isHealthy': is_healthy,
                'severity': severity,
                'treatments': treatments,
                'recommendations': treatments[:3] if treatments else []
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Prediction failed',
            'message': str(e)
        }), 500


@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """
    Batch prediction endpoint for multiple images.
    
    Input: Multipart form with multiple 'files' fields
    Output: JSON with predictions for all images
    """
    if 'files' not in request.files:
        return jsonify({
            'success': False,
            'error': 'No files provided'
        }), 400
    
    files = request.files.getlist('files')
    
    if len(files) == 0:
        return jsonify({
            'success': False,
            'error': 'No files selected'
        }), 400
    
    if len(files) > 10:
        return jsonify({
            'success': False,
            'error': 'Maximum 10 images allowed per batch'
        }), 400
    
    results = []
    
    for file in files:
        try:
            is_valid, error_message = validate_image(file)
            if not is_valid:
                results.append({
                    'filename': file.filename,
                    'success': False,
                    'error': error_message
                })
                continue
            
            image_array = preprocess_image(file)
            disease_name, confidence, is_healthy = predict_disease(image_array)
            severity = get_severity(confidence, is_healthy)
            treatments = TREATMENT_RECOMMENDATIONS.get(disease_name, [])
            
            results.append({
                'filename': file.filename,
                'success': True,
                'disease': disease_name,
                'confidence': confidence,
                'isHealthy': is_healthy,
                'severity': severity,
                'treatments': treatments[:3]
            })
            
        except Exception as e:
            results.append({
                'filename': file.filename,
                'success': False,
                'error': str(e)
            })
    
    # Calculate summary
    successful = [r for r in results if r.get('success')]
    healthy_count = len([r for r in successful if r.get('isHealthy')])
    diseased_count = len(successful) - healthy_count
    
    return jsonify({
        'success': True,
        'summary': {
            'total': len(files),
            'processed': len(successful),
            'failed': len(files) - len(successful),
            'healthy': healthy_count,
            'diseased': diseased_count
        },
        'results': results
    }), 200


@app.route('/diseases', methods=['GET'])
def get_diseases():
    """Get list of all detectable diseases."""
    diseases = []
    for i, name in enumerate(DISEASE_CLASSES):
        diseases.append({
            'id': i,
            'name': name,
            'treatments': TREATMENT_RECOMMENDATIONS.get(name, [])
        })
    
    return jsonify({
        'success': True,
        'data': diseases
    })


@app.route('/treatments/<disease_name>', methods=['GET'])
def get_treatments(disease_name):
    """Get treatment recommendations for a specific disease."""
    # Find disease (case-insensitive)
    for disease in DISEASE_CLASSES:
        if disease.lower() == disease_name.lower():
            treatments = TREATMENT_RECOMMENDATIONS.get(disease, [])
            return jsonify({
                'success': True,
                'disease': disease,
                'treatments': treatments
            })
    
    return jsonify({
        'success': False,
        'error': f'Disease "{disease_name}" not found'
    }), 404


@app.route('/model/info', methods=['GET'])
def model_info():
    """Get information about the loaded model."""
    info = {
        'model_loaded': model is not None,
        'classes': DISEASE_CLASSES,
        'num_classes': len(DISEASE_CLASSES),
        'input_shape': [224, 224, 3],
        'version': '1.0.0'
    }
    
    if model is not None:
        info['model_summary'] = str(model.summary())
    
    return jsonify({
        'success': True,
        'data': info
    })


# Error handlers
@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({
        'success': False,
        'error': 'File too large',
        'message': 'Maximum file size is 10MB'
    }), 413


@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500


# Initialize
if __name__ == '__main__':
    # Try to load model
    load_model()
    
    # Run Flask app
    print("=" * 50)
    print("  Drone Crop AI Service Started")
    print("  Server running on http://localhost:5000")
    print("=" * 50)
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
