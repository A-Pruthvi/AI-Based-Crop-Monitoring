@echo off
REM Unified Disease Detection - Startup Script
REM Launches the inference API server for predictions

setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo UNIFIED DISEASE DETECTION - API STARTUP
echo ============================================================================
echo.

REM Check if in correct directory
if not exist "inference_unified_api.py" (
    echo ERROR: This script must be run from ai-service directory
    echo.
    echo Please navigate to: EDP PROJECT VI SEM\ai-service
    echo Then run: startup_api.bat
    echo.
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist ".venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found
    echo.
    echo Please ensure .venv exists in this directory
    echo.
    pause
    exit /b 1
)

REM Check if model exists
if not exist "models_unified\best_model.h5" (
    echo WARNING: Trained model not found
    echo.
    echo Model path: models_unified\best_model.h5
    echo.
    echo Have you completed training? Check training_log.txt
    echo.
    choice /C YN /M "Continue anyway? (Y/N): "
    if errorlevel 2 (
        exit /b 1
    )
    if errorlevel 1 (
        goto start_api
    )
)

:start_api
echo.
echo Activating virtual environment...
call .venv\Scripts\activate.bat

if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)

echo.
echo ============================================================================
echo STARTING INFERENCE API SERVER
echo ============================================================================
echo.
echo API will be available at: http://localhost:5000
echo.
echo Endpoints:
echo   GET  http://localhost:5000/api/health      - Health check
echo   POST http://localhost:5000/api/predict     - Single image prediction
echo   POST http://localhost:5000/api/batch-predict - Multiple images
echo   GET  http://localhost:5000/api/classes     - List disease classes
echo.
echo Documentation: INFERENCE_API_GUIDE.md
echo Test suite: python test_inference_unified.py
echo Monitor training: python monitor_training.py
echo.
echo Press Ctrl+C to stop the server
echo ============================================================================
echo.

python inference_unified_api.py

if errorlevel 1 (
    echo.
    echo ERROR: API server failed to start
    echo Check inference_unified_api.py for details
    echo.
)

pause
