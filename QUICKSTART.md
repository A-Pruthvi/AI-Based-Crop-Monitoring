# 🚀 CropMonitor - Quick Start Guide

## Running the Application

### **Easy Way (Recommended):**

**Start all services:**
```powershell
cd "C:\Users\pruth\OneDrive\Desktop\EDP PROJECT VI SEM"
.\start-all.ps1
```

**Stop all services:**
```powershell
.\stop-all.ps1
```

---

### **Manual Way:**

#### 1. Start Backend (Spring Boot) - Port 8081
```powershell
cd drone-backend
mvn spring-boot:run
```

#### 2. Start AI Service (Flask) - Port 5000
```powershell
cd ai-service
& "..\\.venv\Scripts\Activate.ps1"
python app.py
```

#### 3. Start Frontend (React) - Port 3000
```powershell
cd drone-frontend
npm start
```

---

## 🌐 Access URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8081/api
- **AI Service:** http://localhost:5000/api

---

## ⚙️ First-Time Setup

### Backend:
```powershell
cd drone-backend
mvn clean install
```

### AI Service:
```powershell
cd ai-service
pip install -r requirements.txt
```

### Frontend:
```powershell
cd drone-frontend
npm install
```

---

## 📌 Prerequisites

- **Java 21** - For Spring Boot backend
- **Maven 3.6+** - For building backend
- **Node.js 16+** - For React frontend
- **Python 3.8+** - For AI service
- **MySQL** - Database (should be running)

---

## 🔧 Troubleshooting

### Backend won't start:
```powershell
# Check Java version
java -version  # Should be 21

# Rebuild
mvn clean install
```

### AI Service errors:
```powershell
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check Python version
python --version  # Should be 3.8+
```

### Frontend issues:
```powershell
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port already in use:
```powershell
# Find process using port (example: 8081)
netstat -ano | findstr :8081

# Kill process
taskkill /PID <PID> /F
```

---

## 📝 Development Commands

### Backend:
- **Run:** `mvn spring-boot:run`
- **Build:** `mvn clean install`
- **Test:** `mvn test`

### AI Service:
- **Run:** `python app.py`
- **Test:** `pytest` (if tests exist)

### Frontend:
- **Dev:** `npm start`
- **Build:** `npm run build`
- **Test:** `npm test`

---

## 🎯 Default Credentials (Development)

Check your database seed data or create a user via registration.

---

## 📚 More Information

- **Production Review:** See `drone-frontend/PRODUCTION_REVIEW.md`
- **Action Items:** See `drone-frontend/ACTION_ITEMS.md`
- **Features:** See `drone-frontend/ADVANCED_FEATURES.md`

---

**Happy Coding! 🌾**
