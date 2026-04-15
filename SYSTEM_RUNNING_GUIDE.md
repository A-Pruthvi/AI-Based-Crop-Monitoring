# 🚀 CropMonitor System - Running & Testing Guide

## ✅ CURRENT STATUS

### Services Running:
- ✅ **Frontend (React)**: http://localhost:3000 - READY
- ✅ **Backend (Spring Boot)**: http://localhost:8081 - READY  
- ⏳ **AI Service (Flask)**: http://localhost:5000 - Loading models (2-5 min)

---

## 📊 HOW TO ACCESS THE OVERVIEW

### Step 1: Open Frontend Dashboard
1. Open your browser and go to: **http://localhost:3000**
2. You should see the CropMonitor login page

### Step 2: Login
- Use your credentials to login to the system
- If no test account exists, check backend logs for default credentials

### Step 3: Navigate to Overview
Once logged in, look for:
- **Dashboard** or **Overview** menu item in the navigation bar
- Usually located in the main menu or sidebar
- This shows system statistics like:
  - Total predictions made
  - Success rate
  - Crop types tracked
  - Disease classifications
  - Recent predictions

### Step 4: View System Statistics
The Overview dashboard displays:
- 📈 **Prediction Metrics**: Total predictions, accuracy, success rate
- 🌾 **Crop Analysis**: Breakdown by crop type
- 🦠 **Disease Distribution**: Most common diseases detected
- 📅 **Timeline**: Recent prediction history
- 👥 **User Statistics**: Active users, total users

---

## 🧪 TESTING PREDICTIONS

### Option 1: Manual Image Upload (UI)
1. From dashboard, find "Upload Image" or "Predict" section
2. Select a disease leaf image
3. System will:
   - Classify the crop type
   - Identify the disease
   - Show confidence scores
   - Provide treatment recommendations
   - Display Grad-CAM visualization

### Option 2: API Testing (Command Line)
```powershell
# Test prediction with sample image
cd "C:\Users\pruth\OneDrive\Desktop\EDP PROJECT VI SEM"
python test_system.py
```

### Sample Test Images Available
- Apple Scab: `bigdataset\organized_by_crop\Apple\Apple Scab\`
- Banana Black Sigatoka: `bigdataset\organized_by_crop\Banana\Black Sigatoka\`
- Tomato Late Blight: `bigdataset\organized_by_crop\Tomato\Late Blight\`
- And more in the organized_by_crop directory

---

## 🔄 SYSTEM FLOW

```
1. Frontend (React) - User uploads image
   ↓
2. Backend (Spring Boot) - Receives image, stores in DB
   ↓
3. AI Service (Flask) - Processes image
   ├─ Stage 1: Crop Classification (EfficientNetB4)
   ├─ Stage 2: Disease Classification (EfficientNetB4)
   └─ Generate Grad-CAM heatmap
   ↓
4. Backend - Stores results, fetches treatment recommendations
   ↓
5. Frontend - Displays results with visualizations
```

---

## 📊 WHAT TO EXPECT IN OVERVIEW

### Prediction Results Include:
- **Crop Type**: Apple, Banana, Corn, Grape, Mango, Pepper, Potato, Rice, Tomato, Wheat
- **Disease Name**: Specific disease identified
- **Confidence Score**: How confident the model is (0-100%)
- **Health Score**: Plant health rating (0-100)
- **Severity Level**: LOW, MEDIUM, HIGH, CRITICAL
- **Treatment Protocol**: 
  - Recommended fungicides/pesticides
  - Dosage and frequency
  - Safety intervals
  - Cost estimate

### Dashboard Metrics:
| Metric | Example |
|--------|---------|
| Total Predictions | 1,234 |
| Success Rate | 92.3% |
| Crop Classification Accuracy | 92.3% |
| Disease Classification Accuracy | 83.1% |
| Unknown Crop Detection | 96.2% |

---

## ⚠️ AI SERVICE INITIALIZATION

The AI Service is currently loading TensorFlow models. This process:
- Takes 2-5 minutes on first run
- Requires TensorFlow and Keras to compile models
- Normal output includes TensorFlow warnings

**Once loaded, the service will:**
- Handle predictions in 5-6 seconds
- Support concurrent requests
- Cache models in memory for fast inference

---

## 🎯 NEXT STEPS

1. ✅ Open http://localhost:3000
2. ✅ Navigate to Overview/Dashboard
3. ✅ Add test prediction image once AI service is ready
4. ✅ Check prediction results with treatment recommendations

---

## 📝 TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Can't connect to frontend | Check if port 3000 is already in use |
| Backend returns 403 | Need valid JWT token; check credentials |
| AI Service not responding | Check TensorFlow loading in terminal window |
| Images not uploading | Ensure file size < 10MB and format is JPG/PNG |
| No predictions showing | AI service may still be loading; wait 2-5 minutes |

---

## 🔗 USEFUL ENDPOINTS

### Frontend
- UI: `http://localhost:3000`

### Backend APIs (require JWT token)
- Health: `http://localhost:8081/api/health`
- Get Predictions: `http://localhost:8081/api/predictions`
- Get Dashboard: `http://localhost:8081/api/analytics/dashboard`

### AI Service
- Health: `http://localhost:5000/health`
- Predict: `http://localhost:5000/predict` (POST with image)

---

**Status Updated**: System is now running and ready for testing!
**AI Service Note**: Still loading models; predictions will be available in 2-5 minutes.
