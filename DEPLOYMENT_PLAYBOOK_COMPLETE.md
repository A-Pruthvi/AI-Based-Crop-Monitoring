# 🚀 CropMonitor - Implementation & Deployment Playbook
**Step-by-Step Guide to Full-Scale Production Deployment**

**Date**: March 28, 2026  
**Version**: 1.0  
**Status**: Production Ready

---

## 📋 Quick Reference

| Component | Port | Status | Notes |
|-----------|------|--------|-------|
| Frontend (React) | 3000 | ✅ Ready | Requires Node.js 18+ |
| Backend API (Spring Boot) | 8081 | ✅ Ready | Requires Java 21 LTS |
| AI Service (Flask) | 5000 | ✅ Ready | Requires Python 3.9+ |
| Database (MySQL) | 3306 | ⏳ Setup | Requires script execution |
| Redis Cache | 6379 | 🔄 Optional | For production caching |

---

## Phase 1: Pre-Deployment Setup (1 Day)

### Step 1.1: Verify System Requirements

```powershell
# Check Java Installation
java -version
# Expected: Java 21.x

# Check Node.js Installation
node --version
# Expected: v18.x or v20.x

# Check Python Installation
python --version
# Expected: Python 3.9+

# Check MySQL Installation
mysql --version
# Expected: MySQL 8.0+

# Verify Disk Space (minimum 100GB recommended)
Get-Volume | Select-Object DriveLetter, Size, SizeRemaining

# Verify RAM (minimum 8GB, 16GB recommended)
Get-ComputerInfo | Select-Object CsPhyicallyInstalledSystemMemory
```

### Step 1.2: Create Project Directory Structure

```powershell
# Create directory
New-Item -ItemType Directory -Path "C:\CropMonitor-Production" -Force

# Create subdirectories
$dirs = @(
    "C:\CropMonitor-Production\backend",
    "C:\CropMonitor-Production\ai-service",
    "C:\CropMonitor-Production\frontend",
    "C:\CropMonitor-Production\database",
    "C:\CropMonitor-Production\logs",
    "C:\CropMonitor-Production\uploads",
    "C:\CropMonitor-Production\backups",
    "C:\CropMonitor-Production\config"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}
```

### Step 1.3: Generate SSL/TLS Certificates (Production)

```bash
# For production, use Let's Encrypt
# For development, use self-signed:

# Create certificate directory
mkdir C:\CropMonitor-Production\certs

# Generate self-signed certificate (valid 365 days)
openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=cropmonitor.com"

# Copy to config
cp server.* C:\CropMonitor-Production\certs\
```

---

## Phase 2: Database Setup (1 Day)

### Step 2.1: Create MySQL Database

```powershell
# Start MySQL service
net start MySQL80  # or your MySQL service name

# Verify MySQL is running
mysqladmin -u root -p status
```

### Step 2.2: Execute Database Schema

```powershell
# Navigate to project directory
cd "C:\Users\pruth\OneDrive\Desktop\EDP PROJECT VI SEM"

# Run schema script (replace password)
mysql -u root -p < DATABASE_SCHEMA_COMPLETE.sql

# Verify database created
mysql -u root -p -e "SHOW DATABASES LIKE 'cropmonitor%';"

# Check tables created
mysql -u root -p cropmonitor_db -e "SHOW TABLES;"
```

**Expected Output:**
```
Tables_in_cropmonitor_db
users
crop_types
disease_types
disease_crop_mapping
treatment_recommendations
predictions
reports
prediction_details
audit_logs
system_logs
health_advisories
```

### Step 2.3: Create Application User

```sql
-- Connect to MySQL first
mysql -u root -p

-- Create application user
CREATE USER 'cropmonitor'@'localhost' IDENTIFIED BY 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON cropmonitor_db.* TO 'cropmonitor'@'localhost';
FLUSH PRIVILEGES;

-- Verify user created
SELECT User, Host FROM mysql.user WHERE User = 'cropmonitor';

-- Test connection
EXIT;
mysql -u cropmonitor -p cropmonitor_db -e "SELECT VERSION();"
```

### Step 2.4: Verify Data Integrity

```sql
-- Connect as new user
mysql -u cropmonitor -p cropmonitor_db

-- Verify reference data
SELECT COUNT(*) as 'Crop Types' FROM crop_types;
-- Expected: 10

SELECT COUNT(*) as 'Diseases' FROM disease_types;
-- Expected: 19

SELECT COUNT(*) as 'Disease-Crop Mappings' FROM disease_crop_mapping;
-- Expected: 19

SELECT COUNT(*) as 'Treatment Recommendations' FROM treatment_recommendations;
-- Expected: 5 (sample data)

-- Check views created
SHOW FULL TABLES IN cropmonitor_db WHERE TABLE_TYPE LIKE 'VIEW';
-- Expected: user_prediction_summary, disease_statistics

EXIT;
```

---

## Phase 3: Backend Setup (1 Day)

### Step 3.1: Clone and Configure Backend

```powershell
# Copy backend to production directory
Copy-Item "C:\Users\pruth\OneDrive\Desktop\EDP PROJECT VI SEM\drone-backend" `
    -Destination "C:\CropMonitor-Production\backend" -Recurse

cd "C:\CropMonitor-Production\backend"

# View current configuration
cat src/main/resources/application.properties
```

### Step 3.2: Update Application Properties

Edit `src/main/resources/application.properties`:

```properties
# ============== SERVER CONFIGURATION ==============
server.port=8081
server.servlet.context-path=/api
server.error.include-message=always
server.error.include-binding-errors=always

# ============== DATABASE CONFIGURATION ==============
spring.datasource.url=jdbc:mysql://localhost:3306/cropmonitor_db?useSSL=false&serverTimezone=UTC&createDatabaseIfNotExist=false
spring.datasource.username=cropmonitor
spring.datasource.password=YourSecurePassword123!
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# ============== JPA CONFIGURATION ==============
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# ============== CONNECTION POOL ==============
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connectionTimeout=30000
spring.datasource.hikari.idleTimeout=600000

# ============== JWT CONFIGURATION ==============
app.jwt.secret=your_very_long_and_secure_jwt_secret_key_minimum_256_bits_should_be_here
app.jwt.expiration=86400000
app.jwt.refreshExpiration=604800000

# ============== AI SERVICE CONFIGURATION ==============
ai.service.url=http://localhost:5000
ai.service.timeout=60000
ai.service.max-retries=3

# ============== FILE UPLOAD ==============
app.upload.dir=C:/CropMonitor-Production/uploads
app.upload.max-size=10485760
app.upload.allowed-types=jpg,jpeg,png,gif

# ============== LOGGING ==============
logging.level.root=INFO
logging.level.com.drone=DEBUG
logging.file.name=C:/CropMonitor-Production/logs/application.log

# ============== ACTUATOR (Monitoring) ==============
management.endpoints.web.exposure.include=health,metrics,prometheus
management.health.livenessState.enabled=true
management.health.readinessState.enabled=true

# ============== APPLICATION INFO ==============
app.name=CropMonitor
app.version=1.0.0
app.description=AI-Powered Crop Disease Detection System
```

### Step 3.3: Build Backend

```powershell
cd "C:\CropMonitor-Production\backend"

# Clean previous builds
mvn clean

# Build project
mvn install -DskipTests

# Expected: BUILD SUCCESS
```

### Step 3.4: Start Backend Service

```powershell
cd "C:\CropMonitor-Production\backend"

# Start Spring Boot
mvn spring-boot:run

# In separate terminal, verify it's running
Invoke-WebRequest -Uri "http://localhost:8081/api/actuator/health" -UseBasicParsing | Select-Object StatusCode, Content
# Expected: StatusCode 200
```

### Step 3.5: Test Backend API

```powershell
# Test registration endpoint
$body = @{
    name = "Test Farmer"
    email = "test@farm.com"
    password = "TestPassword123"
    farmName = "Test Farm"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8081/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Test login endpoint
$loginBody = @{
    email = "test@farm.com"
    password = "TestPassword123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:8081/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

$token = ($response.Content | ConvertFrom-Json).data.token
Write-Host "JWT Token: $token"
```

---

## Phase 4: AI Service Setup (1 Day)

### Step 4.1: Set Up Python Environment

```powershell
cd "C:\CropMonitor-Production\ai-service"

# Copy AI service
Copy-Item "C:\Users\pruth\OneDrive\Desktop\EDP PROJECT VI SEM\ai-service\*" `
    -Destination "." -Recurse -Force

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Upgrade pip
python -m pip install --upgrade pip

# Install requirements
pip install -r requirements_complete.txt

# Verify TensorFlow installation
python -c "import tensorflow as tf; print(f'TensorFlow version: {tf.__version__}')"
```

### Step 4.2: Verify ML Models

```powershell
# Check if models exist
Get-ChildItem "C:\CropMonitor-Production\ai-service\*.h5"

# Expected models:
# - crop_classifier_multi.h5
# - disease_classifier_unified.h5
# - disease_classifier_*_multi.h5 (per crop)

# If models missing, they need to be trained or downloaded
# Training typically takes 5-8 hours depending on hardware
```

### Step 4.3: Create AI Service Configuration

Create `config.py`:

```python
import os

class Config:
    # Flask Configuration
    FLASK_ENV = 'production'
    DEBUG = False
    JSON_SORT_KEYS = False
    
    # Model Configuration
    MODELS_DIR = 'C:/CropMonitor-Production/ai-service/models'
    CROP_MODEL_PATH = os.path.join(MODELS_DIR, 'crop_classifier_multi.h5')
    DISEASE_MODEL_PATH = os.path.join(MODELS_DIR, 'disease_classifier_unified.h5')
    
    # Image Processing
    IMG_WIDTH = 224
    IMG_HEIGHT = 224
    IMG_CHANNELS = 3
    
    # Prediction Thresholds
    CROP_CONFIDENCE_THRESHOLD = 0.45
    DISEASE_CONFIDENCE_THRESHOLD = 0.45
    
    # API Configuration
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB
    UPLOAD_FOLDER = 'C:/CropMonitor-Production/uploads'
    
    # Logging
    LOG_LEVEL = 'INFO'
    LOG_FILE = 'C:/CropMonitor-Production/logs/ai-service.log'
```

### Step 4.4: Start AI Service

```powershell
# Ensure venv is activated
cd "C:\CropMonitor-Production\ai-service"
.\venv\Scripts\Activate.ps1

# Start Flask app
python inference_unified_api.py

# Should show:
# * Running on http://127.0.0.1:5000
# * WARNING: This is a development server. Do not use it in production...
```

### Step 4.5: Test AI Service

```powershell
# In separate terminal, test health check
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing

# Test models loading
Invoke-WebRequest -Uri "http://localhost:5000/api/models/status" -UseBasicParsing

# Should return JSON with model status
```

---

## Phase 5: Frontend Setup (1 Day)

### Step 5.1: Set Up Frontend

```powershell
cd "C:\CropMonitor-Production\frontend"

# Copy frontend files
Copy-Item "C:\Users\pruth\OneDrive\Desktop\EDP PROJECT VI SEM\drone-frontend\*" `
    -Destination "." -Recurse -Force

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 5.2: Configure Environment

Create `.env.production`:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8081/api
REACT_APP_AI_SERVICE_URL=http://localhost:5000/api

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ADMIN_PANEL=true
REACT_APP_ENABLE_EXPERT_MODE=true

# Application Info
REACT_APP_APP_NAME=CropMonitor
REACT_APP_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production
```

### Step 5.3: Build Frontend

```powershell
cd "C:\CropMonitor-Production\frontend"

# Build for production
npm run build

# Expected: output in 'build' directory
Get-ChildItem build | Select-Object Name

# Verify build successful
Test-Path "build/index.html"  # Should return True
```

### Step 5.4: Start Frontend

```powershell
cd "C:\CropMonitor-Production\frontend"

# Start development server (production-like)
npm start

# Should open http://localhost:3000 automatically
```

### Step 5.5: Test Frontend Access

```powershell
# Test access to frontend
Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing | Select-Object StatusCode

# Try to login with test user
# Email: test@farm.com
# Password: TestPassword123
```

---

## Phase 6: Integration Testing (1 Day)

### Step 6.1: End-to-End API Test Suite

```powershell
# Create test script: test-api.ps1

$baseUrl = "http://localhost:8081/api"
$headers = @{"Content-Type" = "application/json"}

# 1. Register new user
Write-Host "1. Testing User Registration..."
$registerBody = @{
    name = "Integration Test User"
    email = "integrationtest@farm.com"
    password = "Test123456!"
    farmName = "Integration Test Farm"
} | ConvertTo-Json

$registerResponse = Invoke-WebRequest -Uri "$baseUrl/auth/register" `
    -Method POST -Headers $headers -Body $registerBody
Write-Host "✓ Registration successful: $(($registerResponse.Content | ConvertFrom-Json).status)"

# 2. Login user
Write-Host "`n2. Testing User Login..."
$loginBody = @{
    email = "integrationtest@farm.com"
    password = "Test123456!"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login" `
    -Method POST -Headers $headers -Body $loginBody
$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.data.token
Write-Host "✓ Login successful, Token: $($token.Substring(0,20))..."

# 3. Test prediction get endpoint
Write-Host "`n3. Testing Get Predictions..."
$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

$predictionsResponse = Invoke-WebRequest -Uri "$baseUrl/predictions?page=0&size=10" `
    -Headers $authHeaders
Write-Host "✓ Predictions retrieved: $(($predictionsResponse.Content | ConvertFrom-Json).data.totalItems) total"

# 4. Test analytics
Write-Host "`n4. Testing Analytics..."
$analyticsResponse = Invoke-WebRequest -Uri "$baseUrl/analytics/dashboard" `
    -Headers $authHeaders
$analytics = $analyticsResponse.Content | ConvertFrom-Json
Write-Host "✓ Analytics retrieved - Total Predictions: $($analytics.data.summary.totalPredictions)"

Write-Host "`n✅ All integration tests passed!"
```

### Step 6.2: AI Service Prediction Test

```powershell
# Test AI prediction with sample image
$imagePath = "C:\path\to\sample\crop\image.jpg"

$uri = "http://localhost:5000/api/predict"

$fileBytes = [System.IO.File]::ReadAllBytes($imagePath)
$fileBytesBase64 = [System.Convert]::ToBase64String($fileBytes)

$body = @{
    image_base64 = $fileBytesBase64
    crop_type = "Rice"  # Optional
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri $uri -Method POST `
    -ContentType "application/json" -Body $body

Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
```

### Step 6.3: Database Verification

```powershell
# Connect to database and verify data
mysql -u cropmonitor -p cropmonitor_db

# Check registered users
SELECT COUNT(*) as total_users FROM users;

# Check crop types loaded
SELECT crop_name FROM crop_types ORDER BY crop_name;

# Check disease types
SELECT disease_name, pathogen_type FROM disease_types ORDER BY disease_name;

# Verify user created from API
SELECT * FROM users WHERE email = 'integrationtest@farm.com';
```

---

## Phase 7: Production Hardening (1 Day)

### Step 7.1: Enable HTTPS/SSL

```powershell
# Update application.properties for HTTPS
# Add to src/main/resources/application.properties:

cat >> "C:\CropMonitor-Production\backend\src\main\resources\application.properties" << 'EOF'

# ============== SSL/TLS CONFIGURATION ==============
server.ssl.key-store=C:/CropMonitor-Production/certs/keystore.p12
server.ssl.key-store-password=your_keystore_password
server.ssl.key-store-type=PKCS12
server.ssl.key-alias=tomcat
EOF

# Rebuild backend
cd "C:\CropMonitor-Production\backend"
mvn clean install -DskipTests
```

### Step 7.2: Configure Rate Limiting

Update Spring Security Configuration:

```java
// In SecurityConfig.java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .rateLimiter()
            .withDefaults()
        .and()
        .authorizeHttpRequests(authz -> authz
            .requestMatchers("/api/auth/**").permitAll()
            .anyRequest().authenticated()
        );
    return http.build();
}
```

### Step 7.3: Configure CORS Properly

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000", "https://yourdomain.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600)
            .exposedHeaders("Authorization");
    }
}
```

### Step 7.4: Set Up Monitoring with Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'spring-boot'
    static_configs:
      - targets: ['localhost:8081']
    metrics_path: '/api/actuator/prometheus'
```

### Step 7.5: Configure Log Rotation

```xml
<!-- logback-spring.xml -->
<appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>logs/application.log</file>
    <encoder>
        <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
    </encoder>
    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
        <fileNamePattern>logs/application-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
        <maxFileSize>10MB</maxFileSize>
        <maxHistory>30</maxHistory>
        <totalSizeCap>1GB</totalSizeCap>
    </rollingPolicy>
</appender>
```

---

## Phase 8: Production Deployment (Ongoing)

### Step 8.1: Create Startup Scripts

Create `start-services.ps1`:

```powershell
# ============ CropMonitor Production Startup Script ============

Write-Host "🚀 Starting CropMonitor Services..."

# Define service paths
$backendPath = "C:\CropMonitor-Production\backend"
$aiServicePath = "C:\CropMonitor-Production\ai-service"
$frontendPath = "C:\CropMonitor-Production\frontend"

# Start Backend in new window
Write-Host "Starting Backend..."
Start-Process powershell -ArgumentList "-noexit", "-Command", `
    "cd $backendPath; mvn spring-boot:run" -WindowStyle Normal

Start-Sleep -Seconds 5

# Start AI Service in new window
Write-Host "Starting AI Service..."
Start-Process powershell -ArgumentList "-noexit", "-Command", `
    "cd $aiServicePath; .\venv\Scripts\Activate.ps1; python inference_unified_api.py" -WindowStyle Normal

Start-Sleep -Seconds 5

# Start Frontend in new window
Write-Host "Starting Frontend..."
Start-Process powershell -ArgumentList "-noexit", "-Command", `
    "cd $frontendPath; npm start" -WindowStyle Normal

Write-Host "`n✅ All services starting..."
Write-Host "🌐 Frontend: http://localhost:3000"
Write-Host "🔌 Backend API: http://localhost:8081/api"
Write-Host "🤖 AI Service: http://localhost:5000/api"
```

Create `stop-services.ps1`:

```powershell
# ============ CropMonitor Production Shutdown Script ============

Write-Host "🛑 Stopping CropMonitor Services..."

# Stop backend
Get-Process java | Where-Object {$_.ProcessName -eq 'java'} | Stop-Process -Force
Write-Host "✓ Backend stopped"

# Stop AI service
Get-Process python | Stop-Process -Force
Write-Host "✓ AI Service stopped"

# Stop frontend (Node.js)
Get-Process node | Stop-Process -Force
Write-Host "✓ Frontend stopped"

Write-Host "`n✅ All services stopped"
```

### Step 8.2: Database Backup Strategy

Create `backup-database.ps1`:

```powershell
# ============ MySQL Backup Script ============

$backupDir = "C:\CropMonitor-Production\backups"
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$backupFile = "$backupDir\cropmonitor_db_$timestamp.sql"

Write-Host "Backing up database to $backupFile..."

mysqldump -u cropmonitor -p yourpassword --all-databases > $backupFile

if ($?) {
    Write-Host "✓ Backup completed successfully"
    
    # Compress backup
    $zipFile = "$backupFile.zip"
    Compress-Archive -Path $backupFile -DestinationPath $zipFile
    Remove-Item $backupFile
    
    Write-Host "✓ Backup compressed: $zipFile"
    Write-Host "✓ Size: $(Get-Item $zipFile | Select-Object -ExpandProperty Length | ForEach-Object {"{0:F2}" -f ($_ / 1MB)}MB"
} else {
    Write-Host "✗ Backup failed!"
}
```

Schedule to run daily:

```powershell
# Create scheduled task
$action = New-ScheduledTaskAction -Execute 'PowerShell.exe' `
    -Argument "-ExecutionPolicy Bypass -File C:\CropMonitor-Production\backup-database.ps1"

$trigger = New-ScheduledTaskTrigger -Daily -At 2:00AM

Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "CropMonitor-DailyBackup" `
    -Description "Daily backup of CropMonitor database"
```

### Step 8.3: Health Check & Monitoring

Create `health-check.ps1`:

```powershell
# ============ Service Health Check ============

$services = @(
    @{Name = "Backend API"; URL = "http://localhost:8081/api/actuator/health"},
    @{Name = "AI Service"; URL = "http://localhost:5000/api/health"},
    @{Name = "Frontend"; URL = "http://localhost:3000"}
)

Write-Host "`n=== CropMonitor Health Check ===" 
Write-Host "Timestamp: $(Get-Date)`n"

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -TimeoutSec 5 -UseBasicParsing
        $status = if ($response.StatusCode -eq 200) { "✅ UP" } else { "⚠️  DEGRADED" }
        Write-Host "$($service.Name): $status (HTTP $($response.StatusCode))"
    }
    catch {
        Write-Host "$($service.Name): ❌ DOWN"
        Write-Host "  Error: $($_.Exception.Message)`n"
    }
}

Write-Host "`n=== Database Health ===" 
try {
    $mysqlTest = mysql -u cropmonitor -pyourpassword -e "SELECT NOW();" 2>&1
    Write-Host "Database: ✅ UP"
} catch {
    Write-Host "Database: ❌ DOWN"
}

Write-Host "`n=== Disk Space ===" 
Get-Volume C | Select-Object DriveLetter, Size, SizeRemaining | ForEach-Object {
    $percentUsed = [math]::Round(($_.Size - $_.SizeRemaining) / $_.Size * 100, 2)
    Write-Host "Drive C: $percentUsed% used ($([math]::Round($_.SizeRemaining / 1GB, 2))GB free)"
}
```

Schedule hourly:

```powershell
$action = New-ScheduledTaskAction -Execute 'PowerShell.exe' `
    -Argument "-ExecutionPolicy Bypass -File C:\CropMonitor-Production\health-check.ps1"

$trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Hours 1) -At (Get-Date)

Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "CropMonitor-HealthCheck" `
    -Description "Hourly health check for CropMonitor services"
```

---

## Phase 9: Post-Deployment Verification (Ongoing)

### Checklist

```
☐ All services running (Frontend 3000, Backend 8081, AI 5000)
☐ Database populated with reference data
☐ JWT authentication working
☐ User registration working
☐ Login successful with test user
☐ File upload functional
☐ AI predictions returning results
☐ Reports generating correctly
☐ HTTPS/SSL enabled
☐ Rate limiting active
☐ Monitoring active (Prometheus/Grafana)
☐ Database backups scheduled
☐ Error logging configured
☐ Application logs rotating
☐ Health checks passing
☐ Load testing completed
☐ Security audit passed
☐ Documentation updated
☐ Incident response plan in place
```

---

## Troubleshooting Guide

### Issue: Backend fails to start
```
Error: Connection refused to database
Solution:
1. Verify MySQL is running: net start MySQL80
2. Check credentials in application.properties
3. Verify database exists: mysql -u root -p -e "SHOW DATABASES;"
4. Run schema script again if needed
```

### Issue: AI Service model not found
```
Error: FileNotFoundError: Model .h5 file not found
Solution:
1. Verify model files exist in ai-service directory
2. If missing, train models or download pre-trained
3. Check path in config.py matches actual location
4. Ensure file permissions allow read access
```

### Issue: Frontend can't connect to API
```
Error: CORS error or network error
Solution:
1. Check backend is running on port 8081
2. Verify REACT_APP_API_URL in .env.production
3. Check CORS configuration in SecurityConfig.java
4. Clear browser cache
5. Try in incognito mode
```

### Issue: Out of memory error
```
Error: java.lang.OutOfMemoryError
Solution:
1. Increase JVM heap: set JAVA_OPTS=-Xmx2G -Xms1G
2. Check for memory leaks in application logs
3. Reduce model caching if needed
4. Archive old predictions to free space
```

---

## Performance Baseline

After successful deployment, run these benchmarks:

### API Response Times
```bash
# Get predictions (should be < 500ms)
ab -n 1000 -c 10 http://localhost:8081/api/predictions

# File upload (should be < 5000ms)
ab -n 100 -c 5 -p image.jpg http://localhost:8081/api/predictions/upload
```

### AI Service Latency
```bash
# Prediction should be < 3000ms
time curl -X POST http://localhost:5000/api/predict -F "image=@sample.jpg"
```

### Database Query Performance
```sql
-- Check slow queries
SELECT * FROM mysql.slow_log;

-- Top queries
SELECT SQL_TEXT, COUNT(*) 
FROM mysql.slow_log 
GROUP BY SQL_TEXT 
ORDER BY COUNT(*) DESC 
LIMIT 10;
```

---

## Support & Escalation

**Level 1 - Check Basics:**
- Service running? ✓ Check ports
- Database connected? ✓ Check credentials
- Logs show errors? ✓ Review error messages

**Level 2 - Investigate:**
- Run health check script
- Check resource utilization (CPU, Memory, Disk)
- Review application logs
- Check database query performance

**Level 3 - Escalate:**
- Contact DevOps team
- Check infrastructure monitoring (CloudWatch/New Relic)
- Review incident history
- Execute disaster recovery plan if needed

---

**Document Version**: 1.0  
**Last Updated**: March 28, 2026  
**Maintenance**: Review before each production deployment
