"""
DISEASE PREDICTION API
When image is uploaded, shows: CROP TYPE + DISEASE TYPE + CONFIDENCE
"""

import os
import json
import numpy as np
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image as keras_image
from PIL import Image
import io

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

# Load trained model
try:
    model = load_model('disease_classifier_final.h5')
    print("✓ Model loaded successfully")
except:
    print("✗ Model not found. Train first!")
    model = None

# Load class names from results
try:
    with open('results_final.json', 'r') as f:
        results = json.load(f)
    CLASS_NAMES = results['class_names']
    print(f"✓ Loaded {len(CLASS_NAMES)} disease classes")
except:
    print("✗ Results file not found")
    CLASS_NAMES = list(DISEASE_TO_CROP.keys())

@app.route('/predict', methods=['POST'])
def predict():
    """
    Upload image and get crop type + disease type
    """
    try:
        # Accept 'file' (from backend) or 'image' (from direct uploads)
        if 'file' not in request.files and 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files.get('file') or request.files.get('image')
        
        # Read image
        img = Image.open(io.BytesIO(file.read())).convert('RGB')
        img = img.resize((256, 256))
        
        # Preprocess
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Predict
        predictions = model.predict(img_array, verbose=0)
        confidence = np.max(predictions[0])
        predicted_class_idx = np.argmax(predictions[0])
        predicted_disease = CLASS_NAMES[predicted_class_idx]
        
        # Get crop type
        crops = DISEASE_TO_CROP.get(predicted_disease, ['Unknown'])
        
        # Format response
        response = {
            'status': 'success',
            'crop': crops[0],  # First crop (if multiple, show first)
            'disease': predicted_disease,
            'confidence': float(confidence) * 100,
            'all_crops_affected': crops,
            'message': f"This leaf is from a {crops[0]} crop and has {predicted_disease} disease"
        }
        
        # Add top 3 predictions
        top_3_idx = np.argsort(predictions[0])[-3:][::-1]
        response['top_predictions'] = []
        for idx in top_3_idx:
            disease = CLASS_NAMES[idx]
            conf = float(predictions[0][idx]) * 100
            crop = DISEASE_TO_CROP.get(disease, ['Unknown'])[0]
            response['top_predictions'].append({
                'disease': disease,
                'crop': crop,
                'confidence': conf
            })
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/predict/url', methods=['POST'])
def predict_from_url():
    """
    Predict from image path (for testing)
    Usage: POST {"image_path": "path/to/image.jpg"}
    """
    try:
        data = request.get_json()
        image_path = data.get('image_path')
        
        if not os.path.exists(image_path):
            return jsonify({'error': f'Image not found: {image_path}'}), 404
        
        # Read and preprocess
        img = Image.open(image_path).convert('RGB')
        img = img.resize((256, 256))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Predict
        predictions = model.predict(img_array, verbose=0)
        confidence = np.max(predictions[0])
        predicted_class_idx = np.argmax(predictions[0])
        predicted_disease = CLASS_NAMES[predicted_class_idx]
        
        # Get crop type
        crops = DISEASE_TO_CROP.get(predicted_disease, ['Unknown'])
        
        response = {
            'status': 'success',
            'image_path': image_path,
            'crop': crops[0],
            'disease': predicted_disease,
            'confidence': float(confidence) * 100,
            'message': f"Detected: {crops[0]} crop with {predicted_disease} (confidence: {float(confidence)*100:.1f}%)"
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/diseases', methods=['GET'])
def list_diseases():
    """
    Get list of all diseases and which crops they affect
    """
    response = {
        'total_diseases': len(DISEASE_TO_CROP),
        'diseases': []
    }
    
    for disease, crops in sorted(DISEASE_TO_CROP.items()):
        response['diseases'].append({
            'disease': disease,
            'affects_crops': crops
        })
    
    return jsonify(response)


@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'diseases_available': len(CLASS_NAMES),
        'crops_available': len(set(c for crops in DISEASE_TO_CROP.values() for c in crops))
    })


if __name__ == '__main__':
    print("\n" + "="*60)
    print("DISEASE PREDICTION API")
    print("="*60)
    print(f"Model: disease_classifier_final.h5")
    print(f"Diseases: {len(CLASS_NAMES)}")
    print(f"Crops: 10 (Apple, Banana, Corn, Grape, Mango, Pepper, Potato, Rice, Tomato, Wheat)")
    print("\nEndpoints:")
    print("  POST /predict - Upload image to predict")
    print("  POST /predict/url - Predict from image path")
    print("  GET /diseases - List all diseases and crops")
    print("  GET /health - Check API status")
    print("\n" + "="*60)
    print("Starting server on http://localhost:5000")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
