"""
CropMonitor AI Service - Flask API Server
Main entry point for disease prediction API
"""

from api_predictions_improved import app

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 CropMonitor AI Service Starting")
    print("=" * 60)
    print("Flask server running on: http://localhost:5000")
    print("Endpoints:")
    print("  - POST /predict  : Disease prediction")
    print("  - GET  /health   : Health check")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
