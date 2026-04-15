#!/usr/bin/env powershell
<#
.SYNOPSIS
    Unified Disease Detection - API Startup Script
    Launches the inference API server for predictions

.DESCRIPTION
    Activates virtual environment and starts the Flask API server
    for disease detection predictions from uploaded images
#>

Write-Host ""
Write-Host "=" * 80
Write-Host "UNIFIED DISEASE DETECTION - API STARTUP"
Write-Host "=" * 80
Write-Host ""

# Check if in correct directory
if (-not (Test-Path "inference_unified_api.py")) {
    Write-Host "ERROR: This script must be run from ai-service directory" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please navigate to: EDP PROJECT VI SEM\ai-service"
    Write-Host "Then run: .\startup_api.ps1"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if virtual environment exists
if (-not (Test-Path ".venv\Scripts\Activate.ps1")) {
    Write-Host "ERROR: Virtual environment not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure .venv exists in this directory"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if model exists
if (-not (Test-Path "models_unified\best_model.h5")) {
    Write-Host "WARNING: Trained model not found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Model path: models_unified\best_model.h5"
    Write-Host ""
    Write-Host "Have you completed training? Check training_log.txt"
    Write-Host ""
    
    $response = Read-Host "Continue anyway? (Y/N)"
    if ($response -ne "Y" -and $response -ne "y") {
        exit 1
    }
}

Write-Host ""
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
. .\.venv\Scripts\Activate.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to activate virtual environment" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "=" * 80
Write-Host "STARTING INFERENCE API SERVER" -ForegroundColor Green
Write-Host "=" * 80
Write-Host ""
Write-Host "API will be available at: http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Endpoints:"
Write-Host "  GET  http://localhost:5000/api/health      - Health check"
Write-Host "  POST http://localhost:5000/api/predict     - Single image prediction"
Write-Host "  POST http://localhost:5000/api/batch-predict - Multiple images"
Write-Host "  GET  http://localhost:5000/api/classes     - List disease classes"
Write-Host ""
Write-Host "Documentation: INFERENCE_API_GUIDE.md"
Write-Host "Test suite: python test_inference_unified.py"
Write-Host "Monitor training: python monitor_training.py"
Write-Host ""
Write-Host "Press Ctrl+C to stop the server"
Write-Host "=" * 80
Write-Host ""

python inference_unified_api.py

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: API server failed to start" -ForegroundColor Red
    Write-Host "Check inference_unified_api.py for details"
    Write-Host ""
}

Read-Host "Press Enter to exit"
