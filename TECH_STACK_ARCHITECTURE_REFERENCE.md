# 🏗️ CropMonitor - Technology Stack & Architecture Reference

**Version**: 1.0  
**Date**: March 28, 2026  
**Purpose**: Complete technical reference for the CropMonitor system

---

## 📊 System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Browser)                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  React 18.x + Redux/Zustand                                         │   │
│  │  ├─ Dashboard (Analytics, Charts, KPIs)                             │   │
│  │  ├─ Upload Interface (Drag-drop, Preview, Progress)                 │   │
│  │  ├─ Prediction Viewer (Results, Heatmap, Recommendations)           │   │
│  │  ├─ Report Generator (Date range, Filters, Export)                  │   │
│  │  ├─ User Management (Profile, Settings, Preferences)                │   │
│  │  ├─ Admin Panel (User management, System settings)                  │   │
│  │  └─ Dark Mode & Responsive Design (Tailwind CSS)                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                         Port: 3000 (HTTP/HTTPS)                             │
└─────────────────────────────────────────────────────────────────────────────┘
                              ↑ ↓ HTTP(S) + REST
┌─────────────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER (Spring Boot)                           │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Spring Boot 3.4.1 + Spring Security 6.x + JWT                      │   │
│  │  ├─ Authentication (Register, Login, JWT Token, Refresh)            │   │
│  │  ├─ Authorization (RBAC: FARMER, EXPERT, ADMIN)                     │   │
│  │  ├─ Prediction Management (Upload, Get, Filter, Delete)             │   │
│  │  ├─ Report Generation (Create, Download, Schedule)                  │   │
│  │  ├─ Analytics (Dashboard, Trends, Statistics)                       │   │
│  │  ├─ User Management (Profile, Settings, Preferences)                │   │
│  │  ├─ Admin Endpoints (User CRUD, System config, Logs)                │   │
│  │  ├─ File Upload/Download (Multipart form-data)                      │   │
│  │  └─ Error Handling (Global exception handler, Logging)              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                 Port: 8081 (HTTP/HTTPS) with JWT Auth                      │
└─────────────────────────────────────────────────────────────────────────────┘
         ↓ Calls AI      ↓ Reads/Writes        ↓ Stores Files
       Service DB         MySQL               Local FS or S3
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  AI Service      │ │  MySQL Database  │ │  File Storage    │
│  (Flask)         │ │  (Port 3306)     │ │  /uploads        │
│                  │ │                  │ │                  │
│  ┌────────────┐  │ │  ┌────────────┐  │ │  ├─ Images      │
│  │ Prediction │  │ │  │ Tables:    │  │ │  ├─ Reports    │
│  │ Endpoint   │  │ │  │            │  │ │  ├─ Heatmaps   │
│  │ /api/pred  │──┼─┼──│ - users    │  │ │  └─ Backups    │
│  └────────────┘  │ │  │ - predictions
│                  │ │  │ - reports  │  │ │  UTF-8 encoding│
│  ┌────────────┐  │ │  │ - crops    │  │ │  ~100GB needed │
│  │ ML Models  │  │ │  │ - diseases │  │ │                │
│  │ Loading    │  │ │  │ - mappings │  │ │ Backup:        │
│  └────────────┘  │ │  │ - logs     │  │ │ 6hr incremental│
│  Port: 5000      │ │  └────────────┘  │ │ 1x daily full  │
│  (Python 3.11)   │ │                  │ │ 30-day online  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## 🛠️ Detailed Technology Stack

### Frontend Layer (Client-Side)

#### Core Framework
| Technology | Version | Purpose | Why Chosen |
|-----------|---------|---------|-----------|
| **React** | 18.2+ | UI library | Component-based, large ecosystem |
| **React Router** | 6.x | Navigation | SPA routing, lazy loading |
| **TypeScript** | 5.x | Type safety | Catch errors early |
| **Vite** | 4.x | Build tool | Fast development server |

#### UI & Styling
| Technology | Version | Purpose | Why Chosen |
|-----------|---------|---------|-----------|
| **Tailwind CSS** | 3.x | Utility-first CSS | Rapid development, responsive |
| **Shadcn/ui** | Latest | Component library | Pre-built, accessible components |
| **Recharts** | 2.x | Charts & graphs | React-friendly charting |
| **React Dropzone** | 14.x | File upload | Drag-drop image upload |
| **React Hot Toast** | 2.x | Notifications | User feedback & alerts |
| **Lucide Icons** | Latest | Icon library | Beautiful, consistent icons |

#### State Management
| Technology | Version | Purpose | Why Chosen |
|-----------|---------|---------|-----------|
| **React Query** | 4.x | Server state | Cache management, sync |
| **Zustand** | 4.x | Client state | Lightweight, simple |
| **Local Storage** | Native | Persistence | Simple & fast caching |

#### HTTP & Communication
| Technology | Version | Purpose | Why Chosen |
|-----------|---------|---------|-----------|
| **Axios** | 1.x | HTTP client | Interceptors, error handling |
| **Retry Logic** | Custom | Network resilience | Handle transient failures |
| **Error Boundary** | React 18 | Error handling | Prevent full-app crashes |

#### Development Tools
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x.x",
    "axios": "^1.x.x",
    "react-query": "^4.x.x",
    "zustand": "^4.x.x",
    "tailwindcss": "^3.x.x",
    "recharts": "^2.x.x",
    "react-dropzone": "^14.x.x",
    "react-hot-toast": "^2.x.x"
  },
  "devDependencies": {
    "typescript": "^5.x.x",
    "vite": "^4.x.x",
    "@vitejs/plugin-react": "^4.x.x",
    "eslint": "^8.x.x",
    "prettier": "^3.x.x",
    "jest": "^29.x.x",
    "@testing-library/react": "^14.x.x"
  }
}
```

### Backend Layer (API Server)

#### Framework & Core
| Technology | Version | Purpose | Details |
|-----------|---------|---------|---------|
| **Spring Boot** | 3.4.1 | Main framework | Latest LTS, Java 21 compatible |
| **Java** | 21 LTS | Language | Long-term support edition |
| **Spring MVC** | 6.x | REST APIs | Annotation-based routing |
| **Spring Data JPA** | 3.x | ORM | Database abstraction layer |
| **Lombok** | 1.18.38 | Boilerplate reduction | Auto getters/setters, constructors |

#### Security
| Technology | Version | Purpose | Details |
|-----------|---------|---------|---------|
| **Spring Security** | 6.x | Authentication | User identity verification |
| **JWT (jjwt)** | 0.12.3 | Token based auth | Stateless authentication |
| **Bcrypt** | Spring built-in | Password hashing | Secure password storage |
| **CORS** | Spring built-in | Cross-origin requests | Browser security |

#### Database & Persistence
| Technology | Version | Purpose | Details |
|-----------|---------|---------|---------|
| **MySQL** | 8.0+ | Relational DB | ACID transactions |
| **HikariCP** | Latest | Connection pool | High-performance pool |
| **Liquibase** | 4.x | Schema versioning | Database migrations |
| **H2 Database** | 2.x | Testing | In-memory test DB |

#### File Handling
| Technology | Purpose | Configuration |
|-----------|---------|---------|
| **Multipart upload** | Image intake | Max size: 10MB |
| **FileSystemStorage** | Local storage | Path: `/uploads` |
| **AWS S3** | Cloud storage | Optional for production |
| **Image resizing** | Thumb generation | ImageMagick integration |

#### Dependencies
```xml
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.3</version>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.38</version>
    </dependency>
    
    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```

### AI/ML Layer (Deep Learning Service)

#### Deep Learning Framework
| Technology | Version | Purpose | GPU Support |
|-----------|---------|---------|-----------|
| **TensorFlow** | 2.13+ | ML framework | Yes (CUDA/cuDNN) |
| **Keras** | Latest | High-level API | Through TensorFlow |
| **NumPy** | 1.24+ | Numerical computing | Foundation for all ML |

#### Model Architecture
| Component | Type | Details |
|-----------|------|---------|
| **Crop Classifier** | EfficientNetB4 | Pre-trained on ImageNet |
| **Disease Classifier** | EfficientNetB4 | Fine-tuned for diseases |
| **Ensemble** | Multi-model | Averaging predictions |

#### Image Processing
| Technology | Purpose | Details |
|-----------|---------|---------|
| **Pillow** | Image I/O | Load, save, manipulate |
| **OpenCV** | Computer vision | Preprocessing, resizing |
| **scikit-image** | Image analysis | Segmentation, filtering |
| **Grad-CAM** | Explainability | Visualization heatmaps |

#### Web Framework
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Flask** | 2.3+ | Lightweight REST API |
| **Flask-CORS** | 4.x | Cross-origin requests |
| **Gunicorn** | 21.x | Production WSGI server |

#### Dependencies
```bash
# requirements_complete.txt
tensorflow==2.13.0
keras==2.13.0
numpy==1.24.3
pandas==2.0.2
scikit-learn==1.3.0
scikit-image==0.21.0
opencv-python==4.8.0.74
pillow==10.0.0
flask==2.3.3
flask-cors==4.0.0
gunicorn==21.2.0
python-dotenv==1.0.0
tqdm==4.65.0
requests==2.31.0
matplotlib==3.7.2
seaborn==0.12.2
```

### Database Layer

#### MySQL Schema
| Layer | Description | Details |
|-------|-------------|---------|
| **Tables** | 11 core tables | Users, Predictions, Reports, Reference data |
| **Views** | 2 aggregate views | User summary, Disease statistics |
| **Procedures** | 2 stored procedures | Dashboard summary, Data archival |
| **Indexes** | 25+ indexes | Optimized query performance |

#### Database Characteristics
```sql
-- Configuration
Character Set: utf8mb4 (full Unicode support)
Collation: utf8mb4_unicode_ci (case-insensitive)
Engine: InnoDB (transactions, foreign keys)
Max Connections: 1000
Thread Pool: 100-1000
Query Cache: 64MB
Buffer Pool: 25% of available RAM
```

### DevOps & Deployment

#### Containerization
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Docker** | 20.10+ | Container runtime |
| **Docker Compose** | 2.x | Multi-container orchestration |
| **Docker Buildkit** | Latest | Optimized builds |

#### CI/CD
| Technology | Purpose | Features |
|-----------|---------|---------|
| **GitHub Actions** | CI/CD pipeline | Auto-test, build, deploy |
| **SonarQube** | Code quality | Coverage, bugs, security |
| **Dependabot** | Dependency updates | Security patches |

#### Cloud Deployment
| Platform | Services Used | Configuration |
|----------|---------------|---------|
| **AWS** | ECS, RDS, S3, ALB, CloudWatch | Production deployment |
| **Azure** | Container Instances, MySQL, Blob, App Insights | Alternative cloud |
| **Docker Hub** | Image registry | Container storage |

#### Kubernetes (Optional, Advanced)
```yaml
# k8s-deployment.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: cropmonitor

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cropmonitor-backend
  namespace: cropmonitor
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: cropmonitor:backend-1.0.0
        ports:
        - containerPort: 8081
        env:
        - name: DB_HOST
          value: mysql-service
        resources:
          requests:
            cpu: "500m"
            memory: "1Gi"
          limits:
            cpu: "2000m"
            memory: "2Gi"
```

### Monitoring & Logging

#### Application Monitoring
| Tool | Version | Purpose | Metrics |
|------|---------|---------|---------|
| **Spring Boot Actuator** | Built-in | Health checks, metrics | 100+ metrics |
| **Prometheus** | 2.45+ | Metrics collection | Time-series data |
| **Grafana** | 10.x | Visualization | Custom dashboards |

#### Log Management
| Tool | Purpose | Configuration |
|------|---------|---------|
| **SLF4J + Logback** | Logging framework | Spring Boot default |
| **ELK Stack** | Log aggregation | Elasticsearch, Logstash, Kibana |
| **CloudWatch** | AWS logs | Centralized logging |

#### APM (Application Performance Monitoring)
| Tool | Purpose | Features |
|------|---------|---------|
| **DataDog** | Full-stack monitoring | Traces, metrics, logs |
| **New Relic** | Performance monitoring | Real-time insights |
| **Elastic APM** | Open-source APM | Part of ELK stack |

---

## 📐 Data Flow Architecture

### Image Upload & Prediction Flow

```
USER INTERFACE
    ↓
[Drag/Drop Image]
    ↓
Frontend Validation
├─ File type check (jpg, png)
├─ File size check (<10MB)
└─ Image preview
    ↓
[Submit Upload]
    ↓
POST /api/predictions/upload
    ↓
Backend Request Handler
├─ JWT validation
├─ User authorization  
└─ File size verification
    ↓
Save to File System (/uploads/)
    ↓
Create Prediction Record (status: PROCESSING)
    ↓
Return predictionId to Frontend
    ↓
Call AI Service Asynchronously
    ↓
POST http://localhost:5000/api/predict
    ↓
AI SERVICE - STAGE 1: CROP CLASSIFICATION
├─ Load EfficientNetB4 model
├─ Preprocess image (224x224 RGB)
├─ Forward pass through network
├─ Output: {crop: "Rice", confidence: 0.87}
└─ If confidence > 45%, proceed to stage 2
    ↓
AI SERVICE - STAGE 2: DISEASE CLASSIFICATION
├─ Load crop-specific disease classifier
├─ Preprocess image (224x224 RGB)
├─ Filter predictions to valid diseases for crop
├─ Output: {disease: "Brown Spot", confidence: 0.92}
    ↓
POST-PROCESSING
├─ Calculate severity (LOW/MEDIUM/HIGH/CRITICAL)
├─ Estimate health score (0-100)
├─ Lookup treatment recommendations
├─ Generate Grad-CAM heatmap
└─ Create JSON response
    ↓
Return to Backend
    ↓
Backend Updates Prediction
├─ Save results to database
├─ Update status to COMPLETED
├─ Create audit log entry
└─ Generate system notification
    ↓
Frontend Polls for Results
    ↓
Display Results
├─ Disease name & confidence
├─ Health score gauge
├─ Severity indicator
├─ Heatmap visualization
├─ Treatment recommendations
└─ Download recommendation button
```

### Report Generation Flow

```
USER INITIATES REPORT
    ↓
Select Date Range & Filters
    ↓
POST /api/reports/generate
    ↓
Backend Processing
├─ Query predictions (filtered)
├─ Aggregate statistics:
│  ├─ Count healthy vs diseased
│  ├─ Average health scores
│  ├─ Disease distribution
│  └─ Severity breakdown
├─ Generate visualizations
├─ Create report sections
└─ Export to format (PDF/Excel)
    ↓
Save Report Metadata
├─ Store file path
├─ Record generation time
└─ Mark status: GENERATED
    ↓
Return Download Link
    ↓
Frontend Downloads/Views Report
```

---

## 🔐 Security Architecture

### Authentication Flow

```
Login Request
    ↓
POST /api/auth/login {email, password}
    ↓
Authenticate User
├─ Find user by email
├─ Compare bcrypt hashes
└─ If match, generate JWT
    ↓
JWT Token Created
├─ Header: {alg: "HS256", typ: "JWT"}
├─ Payload: {userId, email, role, exp: +24h}
└─ Signature: HMAC-SHA256(secret)
    ↓
Return Token to Client
    ↓
Client Stores Token
├─ localStorage (persistent)
├─ or sessionStorage (session-only)
└─ or memory (most secure, loses on refresh)
    ↓
Use Token for Authorization
├─ Each request includes: Authorization: Bearer <token>
├─ Backend extracts & validates token
├─ Spring Security filter verifies signature
└─ Grant/deny access based on role
```

### Authorization (RBAC)

```
ROLES:
├─ FARMER
│  ├─ View own predictions
│  ├─ Upload images
│  ├─ Generate reports
│  └─ View analytics
│
├─ EXPERT
│  ├─ All FARMER permissions
│  ├─ View all users' predictions
│  ├─ Validate predictions
│  ├─ Add expert notes
│  └─ Generate system reports
│
└─ ADMIN
   ├─ All EXPERT permissions
   ├─ User management (CRUD)
   ├─ System configuration
   ├─ View audit logs
   └─ System monitoring
```

---

## 📈 Performance Characteristics

### Benchmarks (Expected)

| Operation | Expected Time | Notes |
|-----------|--------------|-------|
| User Registration | <200ms | Database write |
| User Login | <300ms | Password hash comparison |
| Image Upload | 1-3 sec | File I/O + metadata save |
| Crop Detection | 2-4 sec | ML model inference |
| Disease Detection | 2-4 sec | ML model inference |
| Get Predictions List | <500ms | Database query + cache |
| Generate Report | 10-30 sec | PDF generation |
| Export to Excel | 5-15 sec | Spreadsheet generation |

### Scalability Characteristics

| Component | Capacity | Scaling Strategy |
|-----------|----------|-----------------|
| **Frontend** | 1000+ concurrent | Load balancer + CDN |
| **Backend** | 100k requests/day | Horizontal scaling (replicas) |
| **AI Service** | 50 predictions/min | GPU acceleration, batching |
| **Database** | 10M+ predictions | Read replicas, archival |
| **Storage** | 1TB+ images | S3 bucket, auto-archive |

---

## 🔧 Configuration Files Reference

### application.properties (Backend)
```
# Server
server.port=8081
server.servlet.context-path=/api

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/cropmonitor_db
spring.jpa.hibernate.ddl-auto=validate

# JWT
app.jwt.secret=<128+ character secret>
app.jwt.expiration=86400000

# Logging
logging.level.root=INFO
logging.file.name=logs/application.log

# Actuator
management.endpoints.web.exposure.include=health,metrics,prometheus
```

### .env (Frontend)
```
REACT_APP_API_URL=http://localhost:8081/api
REACT_APP_AI_SERVICE_URL=http://localhost:5000/api
REACT_APP_ENABLE_ADMIN_PANEL=true
```

### config.py (AI Service)
```python
FLASK_ENV = 'production'
CROP_MODEL_PATH = 'models/crop_classifier.h5'
DISEASE_MODEL_PATH = 'models/disease_classifier.h5'
IMG_WIDTH = IMG_HEIGHT = 224
CROP_CONFIDENCE_THRESHOLD = 0.45
```

---

## 📊 Technology Summary Table

```
┌────────────────┬──────────────┬─────────────────┬────────────────┐
│ Layer          │ Technology   │ Version         │ Purpose        │
├────────────────┼──────────────┼─────────────────┼────────────────┤
│ Frontend       │ React        │ 18.2+           │ UI Framework   │
│                │ TypeScript   │ 5.x             │ Type Safety    │
│                │ Tailwind     │ 3.x             │ Styling        │
│ ────────────────┼──────────────┼─────────────────┼────────────────┤
│ Backend        │ Spring Boot  │ 3.4.1           │ API Framework  │
│                │ Java         │ 21 LTS          │ Language       │
│                │ JWT          │ 0.12.3          │ Authentication │
│ ────────────────┼──────────────┼─────────────────┼────────────────┤
│ AI/ML          │ TensorFlow   │ 2.13+           │ ML Framework   │
│                │ Flask        │ 2.3+            │ API Server     │
│                │ Python       │ 3.11            │ Language       │
│ ────────────────┼──────────────┼─────────────────┼────────────────┤
│ Database       │ MySQL        │ 8.0+            │ Primary DB     │
│                │ HikariCP     │ Latest          │ Connection Pool│
│ ────────────────┼──────────────┼─────────────────┼────────────────┤
│ DevOps         │ Docker       │ 20.10+          │ Containerization
│                │ GitHub       │ -               │ CI/CD, VCS     │
│ ────────────────┼──────────────┼─────────────────┼────────────────┤
│ Monitoring     │ Prometheus   │ 2.45+           │ Metrics        │
│                │ Grafana      │ 10.x            │ Visuals        │
└────────────────┴──────────────┴─────────────────┴────────────────┘
```

---

## 🎯 Key Technical Decisions

### Why These Technologies?

**React (Frontend)**
- ✅ Component reusability  
- ✅ Large ecosystem & community
- ✅ Good performance optimization tools  
- ✅ Strong testing frameworks

**Spring Boot (Backend)**  
- ✅ Enterprise-grade framework
- ✅ Security built-in (Spring Security)
- ✅ Excellent database integration (JPA)
- ✅ Cloud-native deployment ready

**TensorFlow (AI/ML)**
- ✅ Pre-trained models available
- ✅ Good documentation
- ✅ GPU support
- ✅ Industry standard

**MySQL (Database)**
- ✅ ACID transactions
- ✅ Mature & stable
- ✅ Good performance
- ✅ Open-source community support

---

**End of Technology Reference**

For detailed implementation, refer to:
- [COMPREHENSIVE_PROJECT_REPORT.md](COMPREHENSIVE_PROJECT_REPORT.md)
- [DEPLOYMENT_PLAYBOOK_COMPLETE.md](DEPLOYMENT_PLAYBOOK_COMPLETE.md)
- [DATABASE_SCHEMA_COMPLETE.sql](DATABASE_SCHEMA_COMPLETE.sql)
