"""
IMPROVED DISEASE PREDICTION API
Features:
- Uses unified trained model (1,395 images)
- Shows CROP + DISEASE + CONFIDENCE + TREATMENT
- Proper field handling (accepts 'file' from backend, 'image' from direct upload)
"""

import os
import json
import numpy as np
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image as keras_image
from PIL import Image
import io
import traceback

app = Flask(__name__)

# Disease to Crop Mapping
DISEASE_TO_CROP = {
    'Anthracnose': ['Mango', 'Pepper'],
    'Apple scab': ['Apple'],
    'Bacterial leaf blight': ['Rice'],
    'Black Sigatoka': ['Banana'],
    'Brown spot': ['Rice'],
    'Cedar apple rust': ['Apple'],
    'Downy mildew': ['Grape'],
    'Early blight': ['Potato', 'Tomato'],
    'Gray leaf spot': ['Corn'],
    'Late blight': ['Potato'],
    'Leaf smut': ['Rice'],
    'Northern leaf blight': ['Corn'],
    'Powdery mildew': ['Grape', 'Wheat'],
    'Septoria leaf blotch': ['Wheat'],
    'Tomato mosaic virus': ['Tomato'],
    'Tomato yellow leaf curl': ['Tomato']
}

# Treatment Recommendations
DISEASE_TREATMENTS = {
    'Anthracnose': [
        'Remove and destroy infected plant parts',
        'Apply fungicides (Copper-based or Triazoles)',
        'Improve air circulation and reduce humidity',
        'Avoid overhead watering',
        'Use resistant varieties if available'
    ],
    'Apple scab': [
        'Remove infected leaves and fallen fruit',
        'Apply sulfur or fungicide sprays',
        'Prune to improve air circulation',
        'Clean up fallen leaves in autumn',
        'Plant resistant apple varieties'
    ],
    'Bacterial leaf blight': [
        'Remove infected leaves and destroy them',
        'Apply copper-based bactericides',
        'Avoid overhead irrigation and wet conditions',
        'Improve drainage and air flow',
        'Use disease-free seeds and seedlings'
    ],
    'Black Sigatoka': [
        'Remove affected leaves immediately',
        'Apply fungicide sprays (Mancozeb, Azoxystrobin)',
        'Ensure good air circulation around plants',
        'Reduce humidity and wet periods',
        'Use resistant banana varieties'
    ],
    'Brown spot': [
        'Remove infected leaves and debris',
        'Apply fungicides (Copper-based or Triazoles)',
        'Maintain proper plant spacing for air flow',
        'Avoid overhead watering',
        'Use clean seeds and resistant varieties'
    ],
    'Cedar apple rust': [
        'Remove infected apple leaves promptly',
        'Apply fungicide sprays starting early in season',
        'Eliminate cedar trees nearby if possible',
        'Plant resistant apple varieties',
        'Maintain good tree health through proper care'
    ],
    'Downy mildew': [
        'Remove infected leaves and flowers',
        'Apply copper-based fungicides or sulfur',
        'Improve air circulation and reduce humidity',
        'Avoid overhead watering',
        'Use resistant grape varieties'
    ],
    'Early blight': [
        'Remove lower infected leaves regularly',
        'Apply fungicide sprays (Chlorothalonil, Mancozeb)',
        'Mulch to prevent soil splash',
        'Prune for better air circulation',
        'Stake plants to keep foliage dry'
    ],
    'Gray leaf spot': [
        'Remove infected leaves promptly',
        'Apply fungicides (Strobilurins recommended)',
        'Ensure adequate plant spacing',
        'Irrigation early in day to minimize wet foliage',
        'Use resistant corn hybrids'
    ],
    'Late blight': [
        'Remove infected leaves and stems immediately',
        'Apply copper fungicides or sulfur',
        'Improve air circulation and drainage',
        'Avoid overhead irrigation',
        'Plant resistant varieties'
    ],
    'Leaf smut': [
        'Remove affected leaves and debris',
        'Apply systemic fungicides',
        'Ensure proper spacing for air circulation',
        'Reduce standing water and humidity',
        'Use disease-free seeds'
    ],
    'Northern leaf blight': [
        'Remove infected leaves and plant debris',
        'Apply fungicides (Triazoles, Carbamates)',
        'Practice crop rotation',
        'Use resistant corn hybrids',
        'Proper field sanitation'
    ],
    'Powdery mildew': [
        'Remove heavily infected leaves',
        'Apply sulfur powder or fungicide sprays',
        'Improve air circulation and light exposure',
        'Reduce humidity levels',
        'Use resistant grape or wheat varieties'
    ],
    'Septoria leaf blotch': [
        'Remove infected leaves and debris',
        'Apply fungicides (Triazoles or Benzoates)',
        'Improve air circulation',
        'Rotate crops annually',
        'Use resistant wheat varieties'
    ],
    'Tomato mosaic virus': [
        'Remove infected plants entirely',
        'Disinfect tools with bleach between uses',
        'Avoid working in wet plants',
        'Wash hands between plants',
        'Plant resistant tomato varieties'
    ],
    'Tomato yellow leaf curl': [
        'Remove infected plants immediately',
        'Control whitefly vectors with insecticides',
        'Use reflective mulches to repel insects',
        'Use resistant tomato varieties',
        'Install insect screens on greenhouse'
    ]
}

print("\nLoading model and data...")

# Try ORGANIZED model first (trained on proper crop/disease structure)
model = None
CLASS_NAMES = []

try:
    model = load_model('disease_classifier_organized.h5')
    print("[+] Loaded ORGANIZED model (trained on 8 crop classes)")
    model_name = 'organized'
except:
    try:
        model = load_model('disease_classifier_bigdataset.h5')
        print("[+] Loaded bigdataset model (80,702 images)")
        model_name = 'bigdataset'
    except:
        try:
            model = load_model('disease_classifier_unified.h5')
            print("[+] Loaded unified model (1,395 images)")
            model_name = 'unified'
        except:
            try:
                model = load_model('disease_classifier_final.h5')
                print("[+] Loaded final model (950 images)")
                model_name = 'final'
            except:
                print("[-] No trained model found")
                model_name = 'none'

# Load class names from organized mapping first
try:
    with open('class_mapping_organized.json', 'r') as f:
        mapping = json.load(f)
        CLASS_NAMES = mapping.get('idx_to_class', {})
        CLASS_NAMES = {int(k): v for k, v in CLASS_NAMES.items()}
    print(f"[+] Loaded {len(CLASS_NAMES)} crop classes: {list(CLASS_NAMES.values())}")
except:
    try:
        with open('disease_class_mapping_bigdataset.json', 'r') as f:
            mapping = json.load(f)
            CLASS_NAMES = mapping.get('idx_to_class', {})
            CLASS_NAMES = {int(k): v for k, v in CLASS_NAMES.items()}
        print(f"[+] Loaded {len(CLASS_NAMES)} classes from bigdataset")
    except:
        try:
            with open('results_unified.json', 'r') as f:
                results = json.load(f)
                CLASS_NAMES = results.get('class_names', {})
                CLASS_NAMES = {int(k): v for k, v in CLASS_NAMES.items()}
            print(f"[+] Loaded {len(CLASS_NAMES)} classes from unified")
        except:
            print("[-] No class names found - predictions may be incorrect")

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'classes_loaded': len(CLASS_NAMES) > 0
    }), 200

@app.route('/diseases', methods=['GET'])
def list_diseases():
    """Get list of all detectable diseases and their crops"""
    return jsonify({
        'diseases': DISEASE_TO_CROP,
        'total_diseases': len(DISEASE_TO_CROP),
        'total_crops': len(set([c for crops in DISEASE_TO_CROP.values() for c in crops]))
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict disease from uploaded image
    Accepts 'file' field (from backend) or 'image' field (from direct upload)
    Returns: crop, disease, confidence, treatment
    """
    try:
        if not model or len(CLASS_NAMES) == 0:
            return jsonify({'error': 'Model not loaded'}), 500

        # Accept both 'file' and 'image' field names
        if 'file' not in request.files and 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files.get('file') or request.files.get('image')
        
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Read and preprocess image
        img = Image.open(io.BytesIO(file.read())).convert('RGB')
        img = img.resize((224, 224))  # Match model training size (224x224 for MobileNetV2)
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Make prediction
        predictions = model.predict(img_array, verbose=0)
        confidence = np.max(predictions[0])
        predicted_class_idx = int(np.argmax(predictions[0]))
        
        # Get predicted label from CLASS_NAMES
        if model_name == 'organized':
            # Organized model predicts CROPS directly
            crop_dict = {0: 'Apple', 1: 'Banana', 2: 'Corn', 3: 'Grapes', 4: 'Mango', 5: 'Potato', 6: 'Rice', 7: 'Tomato'}
            crop_type = crop_dict.get(predicted_class_idx, 'Unknown')
            predicted_disease = 'Unknown'
            crops = [crop_type]  # For organized model, crops list contains just the predicted crop
        else:
            # Other models predict DISEASES
            predicted_disease = CLASS_NAMES.get(predicted_class_idx, 'Unknown')
            crops = DISEASE_TO_CROP.get(predicted_disease, ['Unknown'])
            crop_type = crops[0]
        
        # Get treatments
        treatments = DISEASE_TREATMENTS.get(predicted_disease, ['Consult a plant expert'])
        
        # Determine severity based on confidence (CORRECTED)
        if confidence >= 0.8:
            severity = 'HIGH'
        elif confidence >= 0.6:
            severity = 'MEDIUM'
        elif confidence >= 0.4:
            severity = 'LOW'
        else:
            severity = 'UNCERTAIN'
        
        # Get top 3 predictions
        top_3_idx = np.argsort(predictions[0])[-3:][::-1]
        top_predictions = []
        for idx in top_3_idx:
            disease = CLASS_NAMES.get(idx, 'Unknown')
            conf = float(predictions[0][idx]) * 100
            crops_for_disease = DISEASE_TO_CROP.get(disease, ['Unknown'])
            top_predictions.append({
                'disease': disease,
                'crop': crops_for_disease[0],
                'confidence': round(conf, 2)
            })
        
        # Response
        response = {
            'status': 'success',
            'crop': crop_type,
            'disease': predicted_disease,
            'confidence': round(float(confidence) * 100, 2),  # Convert to percentage
            'confidence_decimal': round(float(confidence), 4),  # Also provide decimal
            'severity': severity,
            'treatments': treatments,
            'all_crops_affected': crops,
            'top_predictions': top_predictions,
            'message': f"Disease detected: {predicted_disease} on {crop_type} crops"
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"Error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/predict/url', methods=['POST'])
def predict_from_url():
    """Predict from file path"""
    try:
        data = request.get_json()
        image_path = data.get('image_path')
        
        if not image_path or not os.path.exists(image_path):
            return jsonify({'error': 'Invalid image path'}), 400
        
        with open(image_path, 'rb') as f:
            img = Image.open(f).convert('RGB')
        
        img = img.resize((224, 224))  # Match model training size (224x224 for MobileNetV2)
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        predictions = model.predict(img_array, verbose=0)
        confidence = np.max(predictions[0])
        predicted_class_idx = np.argmax(predictions[0])
        predicted_disease = CLASS_NAMES.get(predicted_class_idx, 'Unknown')
        crops = DISEASE_TO_CROP.get(predicted_disease, ['Unknown'])
        treatments = DISEASE_TREATMENTS.get(predicted_disease, ['Consult a plant expert'])
        
        return jsonify({
            'status': 'success',
            'crop': crops[0],
            'disease': predicted_disease,
            'confidence': round(float(confidence) * 100, 2),
            'treatments': treatments,
            'message': f"Disease detected: {predicted_disease} on {crops[0]} crops"
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("DISEASE PREDICTION API - UNIFIED")
    print("="*60)
    print("Diseases: 16")
    print("Crops: 10 (Apple, Banana, Corn, Grape, Mango, Pepper, Potato, Rice, Tomato, Wheat)")
    print("\nEndpoints:")
    print("  GET /health - Check API status")
    print("  GET /diseases - List all diseases")
    print("  POST /predict - Upload image to analyze")
    print("  POST /predict/url - Analyze image by file path")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
