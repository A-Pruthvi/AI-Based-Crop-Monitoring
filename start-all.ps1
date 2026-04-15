# CropMonitor - Start All Services
# Run this script to start Backend, AI Service, and Frontend

param(
    [switch]$RetrainAI,
    [int]$RetrainEpochs = 2
)

Write-Host "🚀 Starting CropMonitor Application..." -ForegroundColor Green
Write-Host ""

$projectRoot = "C:\Users\pruth\OneDrive\Desktop\EDP PROJECT VI SEM"
$aiPython = "$projectRoot\.venv-tf312\Scripts\python.exe"
$aiDataset = "$projectRoot\ai-service\dataset"

if ($RetrainAI) {
    Write-Host "🧠 Retraining AI models before startup (epochs=$RetrainEpochs)..." -ForegroundColor Magenta
    & $aiPython "$projectRoot\ai-service\train_model.py" --mode all --dataset "$aiDataset" --epochs $RetrainEpochs --batch_size 8 --fine_tune_layers 2

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ AI retraining failed. Startup aborted." -ForegroundColor Red
        exit $LASTEXITCODE
    }

    Write-Host "✅ AI retraining completed." -ForegroundColor Green
    Write-Host ""
}

# Function to start a service in a new window
function Start-Service {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [string]$Color = "Cyan"
    )
    
    Write-Host "Starting $Name..." -ForegroundColor $Color
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Path'; Write-Host '=== $Name ===' -ForegroundColor $Color; $Command"
}

# Start Backend (Spring Boot)
Start-Service -Name "Backend (Spring Boot)" `
              -Path "$projectRoot\drone-backend" `
              -Command "mvn spring-boot:run" `
              -Color "Blue"

Start-Sleep -Seconds 2

# Start AI Service (Python Flask)
Start-Service -Name "AI Service (Flask)" `
              -Path "$projectRoot\ai-service" `
              -Command "& '$aiPython' app.py" `
              -Color "Yellow"

Start-Sleep -Seconds 2

# Start Frontend (React)
Start-Service -Name "Frontend (React)" `
              -Path "$projectRoot\drone-frontend" `
              -Command "npm start" `
              -Color "Green"

Write-Host ""
Write-Host "✅ All services are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  - Backend:     http://localhost:8081" -ForegroundColor Blue
Write-Host "  - AI Service:  http://localhost:5000" -ForegroundColor Yellow
Write-Host "  - Frontend:    http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C in each terminal window to stop services" -ForegroundColor Gray
Write-Host ""
Write-Host "Tip: use '.\start-all.ps1 -RetrainAI' to retrain models before launch" -ForegroundColor Magenta
