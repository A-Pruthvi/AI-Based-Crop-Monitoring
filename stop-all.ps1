
# CropMonitor - Stop All Services
# Run this script to stop all running services

Write-Host "🛑 Stopping CropMonitor Services..." -ForegroundColor Red
Write-Host ""

# Function to kill process by port
function Stop-ServiceByPort {
    param(
        [int]$Port,
        [string]$ServiceName
    )
    
    $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($process) {
        Write-Host "Stopping $ServiceName (Port $Port)..." -ForegroundColor Yellow
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ $ServiceName stopped" -ForegroundColor Green
    } else {
        Write-Host "  $ServiceName not running on port $Port" -ForegroundColor Gray
    }
}

# Stop services by port
Stop-ServiceByPort -Port 8081 -ServiceName "Backend (Spring Boot)"
Stop-ServiceByPort -Port 5000 -ServiceName "AI Service (Flask)"
Stop-ServiceByPort -Port 3000 -ServiceName "Frontend (React)"

Write-Host ""
Write-Host "✅ All services stopped!" -ForegroundColor Green
