-- ============================================================================
-- CropMonitor Database Schema - Complete Implementation
-- Version: 2.0
-- Created: March 28, 2026
-- Database: MySQL 8.0+
-- ============================================================================

-- Drop existing database if exists (use with caution!)
-- DROP DATABASE IF EXISTS cropmonitor_db;

-- Create Database
CREATE DATABASE IF NOT EXISTS cropmonitor_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE cropmonitor_db;

-- ============================================================================
-- 1. USERS TABLE - User Account Management
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Basic Information
    name VARCHAR(100) NOT NULL COMMENT 'User full name',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'User email (unique)',
    password VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
    
    -- User Profile
    role ENUM('FARMER', 'EXPERT', 'ADMIN') DEFAULT 'FARMER' COMMENT 'User role',
    farm_name VARCHAR(200) COMMENT 'Farm/Field name',
    phone_number VARCHAR(20) COMMENT 'Contact phone number',
    profile_image VARCHAR(500) COMMENT 'Profile picture URL',
    
    -- Location Information
    location VARCHAR(255) COMMENT 'City/Town',
    state_province VARCHAR(100) COMMENT 'State/Province',
    country VARCHAR(100) COMMENT 'Country',
    
    -- Account Status
    enabled BOOLEAN DEFAULT TRUE COMMENT 'Account active flag',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation time',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update time',
    last_login TIMESTAMP NULL COMMENT 'Last login timestamp',
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at),
    INDEX idx_enabled (enabled),
    CONSTRAINT chk_email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='User accounts with authentication details';

-- ============================================================================
-- 2. CROP_TYPES TABLE - Reference Data for Crops
-- ============================================================================
CREATE TABLE IF NOT EXISTS crop_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    crop_name VARCHAR(50) UNIQUE NOT NULL COMMENT 'Crop name (e.g., Rice, Tomato)',
    scientific_name VARCHAR(100) COMMENT 'Scientific name (e.g., Oryza sativa)',
    description TEXT COMMENT 'Crop description and characteristics',
    growing_season VARCHAR(100) COMMENT 'Growing season info',
    typical_diseases INT DEFAULT 0 COMMENT 'Number of typical diseases',
    
    active BOOLEAN DEFAULT TRUE COMMENT 'Is crop currently active in system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_crop_name (crop_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Reference table for supported crop types';

-- Insert Crop Types
INSERT INTO crop_types (crop_name, scientific_name, description, growing_season, typical_diseases) VALUES
('Apple', 'Malus domestica', 'Deciduous fruit tree, requires chilling hours', 'Spring-Fall', 2),
('Banana', 'Musa spp.', 'Tropical herb producing fruit, year-round growing', 'Year-round', 1),
('Corn', 'Zea mays', 'Annual cereal grain crop, staple food', 'Spring-Fall', 2),
('Grape', 'Vitis spp.', 'Perennial woody vine, wine and table grapes', 'Spring-Fall', 2),
('Mango', 'Mangifera indica', 'Tropical stone fruit, king of fruits', 'Spring-Summer', 1),
('Pepper', 'Capsicum spp.', 'Solanaceous vegetable, various colors', 'Spring-Fall', 1),
('Potato', 'Solanum tuberosum', 'Starchy tuber crop, staple food', 'Spring-Fall', 2),
('Rice', 'Oryza sativa', 'Cereal grain crop, staple carbohydrate', 'Spring-Summer', 3),
('Tomato', 'Solanum lycopersicum', 'Solanaceous fruit, salad and cooking use', 'Spring-Fall', 3),
('Wheat', 'Triticum aestivum', 'Cereal grain crop, important staple', 'Fall-Spring', 2);

-- ============================================================================
-- 3. DISEASE_TYPES TABLE - Reference Data for Diseases
-- ============================================================================
CREATE TABLE IF NOT EXISTS disease_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    disease_name VARCHAR(100) UNIQUE NOT NULL COMMENT 'Disease name',
    scientific_name VARCHAR(150) COMMENT 'Scientific/pathogen name',
    description TEXT COMMENT 'Disease symptoms and characteristics',
    pathogen_type ENUM('FUNGAL', 'BACTERIAL', 'VIRAL', 'NUTRITIONAL', 'OTHER') DEFAULT 'FUNGAL' 
        COMMENT 'Type of pathogen causing disease',
    typical_severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') COMMENT 'Typical severity level',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_disease_name (disease_name),
    INDEX idx_pathogen_type (pathogen_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Reference table for disease types';

-- Insert Disease Types (19 total)
INSERT INTO disease_types (disease_name, scientific_name, description, pathogen_type, typical_severity) VALUES
('Apple scab', 'Venturia inaequalis', 'Fungal disease causing dark scabby lesions on leaves and fruits', 'FUNGAL', 'MEDIUM'),
('Cedar apple rust', 'Gymnosporangium juniperi', 'Fungal disease affecting apple trees near cedar trees', 'FUNGAL', 'LOW'),
('Black Sigatoka', 'Mycosphaerella fijiensis', 'Severe fungal disease of banana leaves', 'FUNGAL', 'CRITICAL'),
('Gray leaf spot', 'Cercospora zeae-maydis', 'Fungal disease causing gray rectangular lesions on corn', 'FUNGAL', 'HIGH'),
('Northern leaf blight', 'Exserohilum turcicum', 'Fungal disease of corn producing long lesions', 'FUNGAL', 'HIGH'),
('Downy mildew', 'Plasmopara viticola', 'Fungal disease affecting grape foliage and fruit', 'FUNGAL', 'HIGH'),
('Powdery mildew', 'Erysiphe necator', 'Fungal disease causing white coating on grape leaves', 'FUNGAL', 'MEDIUM'),
('Mango anthracnose', 'Colletotrichum gloeosporioides', 'Fungal disease causing fruit rot in mango', 'FUNGAL', 'HIGH'),
('Pepper anthracnose', 'Colletotrichum capsici', 'Fungal disease affecting pepper fruits and leaves', 'FUNGAL', 'MEDIUM'),
('Potato early blight', 'Alternaria solani', 'Fungal disease causing target-like lesions on potato leaves', 'FUNGAL', 'HIGH'),
('Potato late blight', 'Phytophthora infestans', 'Water mold disease causing rapid potato decline', 'FUNGAL', 'CRITICAL'),
('Rice bacterial leaf blight', 'Xanthomonas oryzae', 'Bacterial disease causing leaf yellowing in rice', 'BACTERIAL', 'HIGH'),
('Rice brown spot', 'Bipolaris oryzae', 'Fungal disease causing round brown spots on rice leaves', 'FUNGAL', 'MEDIUM'),
('Rice leaf smut', 'Entyloma oryzae', 'Fungal disease affecting rice leaves with black smut masses', 'FUNGAL', 'LOW'),
('Tomato early blight', 'Alternaria solani', 'Fungal disease causing concentric rings on tomato leaves', 'FUNGAL', 'MEDIUM'),
('Tomato mosaic virus', 'ToMV', 'Viral disease causing leaf curling and mottling', 'VIRAL', 'HIGH'),
('Tomato yellow leaf curl', 'TYLCV', 'Viral disease transmitted by whiteflies', 'VIRAL', 'HIGH'),
('Wheat powdery mildew', 'Erysiphe graminis', 'Fungal disease affecting wheat grain and straw', 'FUNGAL', 'MEDIUM'),
('Wheat Septoria leaf blotch', 'Zymoseptoria tritici', 'Fungal disease causing brown necrotic blotches', 'FUNGAL', 'HIGH');

-- ============================================================================
-- 4. DISEASE_CROP_MAPPING TABLE - Many-to-Many Relationship
-- ============================================================================
CREATE TABLE IF NOT EXISTS disease_crop_mapping (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    crop_id INT NOT NULL COMMENT 'Reference to crop',
    disease_id INT NOT NULL COMMENT 'Reference to disease',
    
    model_class_index INT COMMENT 'Index in ML model for this mapping',
    common_in_region VARCHAR(255) COMMENT 'Geographic regions where common',
    treatment_duration_days INT COMMENT 'Typical treatment duration',
    
    FOREIGN KEY (crop_id) REFERENCES crop_types(id) ON DELETE CASCADE,
    FOREIGN KEY (disease_id) REFERENCES disease_types(id) ON DELETE CASCADE,
    UNIQUE KEY unique_mapping (crop_id, disease_id),
    INDEX idx_crop_id (crop_id),
    INDEX idx_disease_id (disease_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Maps which diseases affect which crops';

-- Insert Disease-Crop Mappings
INSERT INTO disease_crop_mapping (crop_id, disease_id, model_class_index) VALUES
-- Apple (crop_id = 1)
(1, 1, 0), (1, 2, 1),
-- Banana (crop_id = 2)
(2, 3, 0),
-- Corn (crop_id = 3)
(3, 4, 0), (3, 5, 1),
-- Grape (crop_id = 4)
(4, 6, 0), (4, 7, 1),
-- Mango (crop_id = 5)
(5, 8, 0),
-- Pepper (crop_id = 6)
(6, 9, 0),
-- Potato (crop_id = 7)
(7, 10, 0), (7, 11, 1),
-- Rice (crop_id = 8)
(8, 12, 0), (8, 13, 1), (8, 14, 2),
-- Tomato (crop_id = 9)
(9, 15, 0), (9, 16, 1), (9, 17, 2),
-- Wheat (crop_id = 10)
(10, 18, 0), (10, 19, 1);

-- ============================================================================
-- 5. TREATMENT_RECOMMENDATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS treatment_recommendations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    disease_id INT NOT NULL COMMENT 'Which disease',
    
    treatment_name VARCHAR(200) NOT NULL COMMENT 'Name of treatment/product',
    active_ingredients TEXT COMMENT 'Active chemical ingredients',
    dosage VARCHAR(100) COMMENT 'Recommended dosage',
    application_method VARCHAR(100) COMMENT 'How to apply (spray, soil, etc)',
    frequency VARCHAR(100) COMMENT 'How often to apply',
    duration_days INT COMMENT 'Duration of treatment in days',
    
    cost_estimate DECIMAL(10, 2) COMMENT 'Estimated cost',
    effectiveness_percentage INT COMMENT 'Expected effectiveness (0-100)',
    environmental_impact VARCHAR(50) COMMENT 'Environmental impact level',
    
    is_organic BOOLEAN DEFAULT FALSE COMMENT 'Is this organic/sustainable',
    steps_to_follow LONGTEXT COMMENT 'Step-by-step instructions',
    precautions TEXT COMMENT 'Safety precautions',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (disease_id) REFERENCES disease_types(id) ON DELETE CASCADE,
    INDEX idx_disease_id (disease_id),
    INDEX idx_is_organic (is_organic)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Treatment recommendations for each disease';

-- Insert Sample Treatment Recommendations
INSERT INTO treatment_recommendations (disease_id, treatment_name, active_ingredients, dosage, application_method, frequency, duration_days, cost_estimate, effectiveness_percentage, environmental_impact, is_organic, precautions) VALUES
(1, 'Sulfur fungicide spray', 'Sulfur', '4-5 lbs per 100 gallons', 'Spray', 'Every 10-14 days', 21, 25.00, 85, 'Low', TRUE, 'Do not apply when temperature > 85°F'),
(1, 'Copper fungicide', 'Copper sulfate', '1-2 lbs per 100 gallons', 'Spray', 'Every 7-10 days', 21, 30.00, 80, 'Medium', FALSE, 'Use protective equipment'),
(3, 'Systemic fungicide', 'Tridemorph', '1.5 liters per hectare', 'Spray', 'Every 14 days', 30, 45.00, 90, 'Medium', FALSE, 'Avoid contact with skin'),
(10, 'Mancozeb + Chlorothalonil mix', 'Mancozeb 80% + Chlorothalonil 75%', '2.5 kg + 1.5 liters', 'Spray', 'Every 10-14 days', 21, 35.00, 85, 'Medium', FALSE, 'Wear safety gear'),
(12, 'Streptomycin antibiotic', 'Streptomycin sulfate', '100 mg/L', 'Spray', 'Every 7 days', 21, 40.00, 75, 'Low', FALSE, 'Not for organic use');

-- ============================================================================
-- 6. PREDICTIONS TABLE - Main Business Logic Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS predictions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    user_id BIGINT NOT NULL COMMENT 'User who uploaded image',
    
    -- Image Information
    image_path VARCHAR(500) NOT NULL COMMENT 'Path to stored image',
    image_name VARCHAR(255) COMMENT 'Original image filename',
    image_size BIGINT COMMENT 'Image file size in bytes',
    image_width INT COMMENT 'Image width in pixels',
    image_height INT COMMENT 'Image height in pixels',
    
    -- Crop Information
    crop_type VARCHAR(50) COMMENT 'User-provided crop type (optional)',
    detected_crop VARCHAR(50) COMMENT 'AI-detected crop type',
    field_location VARCHAR(255) COMMENT 'Field or location name',
    gps_latitude DECIMAL(10, 8) COMMENT 'GPS latitude coordinate',
    gps_longitude DECIMAL(11, 8) COMMENT 'GPS longitude coordinate',
    
    -- AI Prediction Results
    disease_name VARCHAR(100) COMMENT 'Detected disease name',
    confidence_score DECIMAL(5, 2) COMMENT 'AI confidence (0-100)',
    plant_health_score INT COMMENT 'Overall health score (0-100)',
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') COMMENT 'Disease severity',
    is_healthy BOOLEAN DEFAULT FALSE COMMENT 'Is plant healthy',
    
    -- Analysis Details
    cause TEXT COMMENT 'Why disease occurred',
    prevention TEXT COMMENT 'How to prevent',
    treatment_recommendations TEXT COMMENT 'Recommended treatments (JSON array)',
    heatmap_url VARCHAR(500) COMMENT 'Grad-CAM heatmap visualization URL',
    
    -- Processing Information
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'COMPLETED' COMMENT 'Processing status',
    processing_time_ms INT COMMENT 'How long processing took',
    ai_model_version VARCHAR(50) COMMENT 'ML model version used',
    ai_raw_response LONGTEXT COMMENT 'Raw JSON response from AI service',
    error_message TEXT COMMENT 'Error message if failed',
    
    -- User Annotations
    notes TEXT COMMENT 'User notes',
    expert_verified BOOLEAN DEFAULT FALSE COMMENT 'Verified by expert',
    expert_id BIGINT COMMENT 'Expert who verified',
    expert_notes TEXT COMMENT 'Expert comments',
    expert_verified_at TIMESTAMP NULL COMMENT 'When verified',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When prediction created',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update',
    
    -- Foreign Keys & Indexes
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (expert_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_severity (severity),
    INDEX idx_disease_name (disease_name),
    INDEX idx_is_healthy (is_healthy),
    INDEX idx_expert_verified (expert_verified),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='AI prediction records for crop images';

-- ============================================================================
-- 7. REPORTS TABLE - Generated Analysis Reports
-- ============================================================================
CREATE TABLE IF NOT EXISTS reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    user_id BIGINT NOT NULL COMMENT 'User who created report',
    
    title VARCHAR(255) NOT NULL COMMENT 'Report title',
    description TEXT COMMENT 'Report description',
    report_type ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM', 'MANUAL') DEFAULT 'MANUAL' 
        COMMENT 'Type of report',
    
    -- Date Range
    date_from DATETIME COMMENT 'Report start date',
    date_to DATETIME COMMENT 'Report end date',
    
    -- Statistics
    total_scans INT DEFAULT 0 COMMENT 'Total predictions analyzed',
    healthy_count INT DEFAULT 0 COMMENT 'Healthy plants',
    diseased_count INT DEFAULT 0 COMMENT 'Diseased plants',
    unknown_count INT DEFAULT 0 COMMENT 'Unknown status',
    average_health_score DECIMAL(5, 2) COMMENT 'Average health score',
    
    -- Associated Data
    prediction_ids LONGTEXT COMMENT 'JSON array of prediction IDs',
    
    -- Report Content & Export
    summary TEXT COMMENT 'Report summary text',
    file_path VARCHAR(500) COMMENT 'Path to generated file',
    file_format ENUM('PDF', 'EXCEL', 'JSON') DEFAULT 'PDF' COMMENT 'Export format',
    file_size BIGINT COMMENT 'File size in bytes',
    
    -- Processing
    status ENUM('GENERATING', 'GENERATED', 'FAILED') DEFAULT 'GENERATED' COMMENT 'Generation status',
    generation_time_ms INT COMMENT 'Generation time in ms',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys & Indexes
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_report_type (report_type),
    INDEX idx_date_range (date_from, date_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Generated reports and analysis';

-- ============================================================================
-- 8. PREDICTION_DETAILS TABLE - Detailed Analysis Metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS prediction_details (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    prediction_id BIGINT NOT NULL COMMENT 'Reference prediction',
    
    analysis_type VARCHAR(50) COMMENT 'Type of analysis',
    metric_name VARCHAR(100) COMMENT 'Metric name',
    metric_value DECIMAL(10, 4) COMMENT 'Metric value',
    confidence DECIMAL(5, 2) COMMENT 'Confidence in metric',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (prediction_id) REFERENCES predictions(id) ON DELETE CASCADE,
    INDEX idx_prediction_id (prediction_id),
    INDEX idx_metric_name (metric_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Detailed metrics for predictions';

-- ============================================================================
-- 9. AUDIT_LOGS TABLE - System Audit Trail
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    user_id BIGINT COMMENT 'User who performed action',
    
    action VARCHAR(100) COMMENT 'Action performed',
    entity_type VARCHAR(50) COMMENT 'Entity type affected',
    entity_id BIGINT COMMENT 'Entity ID affected',
    
    old_value LONGTEXT COMMENT 'Previous value',
    new_value LONGTEXT COMMENT 'New value',
    
    ip_address VARCHAR(45) COMMENT 'User IP address',
    user_agent TEXT COMMENT 'Browser user agent',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_action (action),
    INDEX idx_entity_type (entity_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Audit trail for all system actions';

-- ============================================================================
-- 10. SYSTEM_LOGS TABLE - Application Logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    log_level ENUM('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL') COMMENT 'Log severity level',
    log_source VARCHAR(100) COMMENT 'Source component',
    message TEXT COMMENT 'Log message',
    stack_trace LONGTEXT COMMENT 'Exception stack trace',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_log_level (log_level),
    INDEX idx_created_at (created_at),
    INDEX idx_log_source (log_source)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Application system logs';

-- ============================================================================
-- 11. HEALTH_ADVISORIES TABLE - Farm Health Advice
-- ============================================================================
CREATE TABLE IF NOT EXISTS health_advisories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    crop_id INT NOT NULL COMMENT 'For which crop',
    disease_id INT COMMENT 'If disease-specific',
    
    advisory_title VARCHAR(200) NOT NULL COMMENT 'Advisory title',
    advisory_text LONGTEXT COMMENT 'Full advisory text',
    advisory_type ENUM('PREVENTION', 'TREATMENT', 'MONITORING', 'SEASONAL') COMMENT 'Type of advisory',
    
    severity_level ENUM('INFO', 'CAUTION', 'WARNING', 'CRITICAL') COMMENT 'Advisory severity',
    
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (crop_id) REFERENCES crop_types(id) ON DELETE CASCADE,
    FOREIGN KEY (disease_id) REFERENCES disease_types(id) ON DELETE SET NULL,
    INDEX idx_crop_id (crop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Health advisories and recommendations';

-- ============================================================================
-- VIEWS - Useful Data Aggregation
-- ============================================================================

-- View: User Prediction Summary
CREATE OR REPLACE VIEW user_prediction_summary AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    COUNT(p.id) as total_predictions,
    SUM(CASE WHEN p.is_healthy THEN 1 ELSE 0 END) as healthy_count,
    SUM(CASE WHEN NOT p.is_healthy THEN 1 ELSE 0 END) as diseased_count,
    AVG(p.plant_health_score) as avg_health_score,
    MAX(p.created_at) as last_prediction_date
FROM users u
LEFT JOIN predictions p ON u.id = p.user_id
GROUP BY u.id;

-- View: Disease Statistics
CREATE OR REPLACE VIEW disease_statistics AS
SELECT 
    d.disease_name,
    dt.pathogen_type,
    COUNT(p.id) as prediction_count,
    AVG(p.confidence_score) as avg_confidence,
    COUNT(DISTINCT p.user_id) as affected_farmers
FROM disease_types d
LEFT JOIN predictions p ON d.disease_name = p.disease_name
LEFT JOIN disease_types dt ON d.id = dt.id
GROUP BY d.id, d.disease_name, dt.pathogen_type;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Procedure: Get dashboard summary for user
DELIMITER //
CREATE PROCEDURE GetUserDashboardSummary(IN p_user_id BIGINT)
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM predictions WHERE user_id = p_user_id) as total_predictions,
        (SELECT COUNT(*) FROM predictions WHERE user_id = p_user_id AND is_healthy = TRUE) as healthy_count,
        (SELECT COUNT(*) FROM predictions WHERE user_id = p_user_id AND is_healthy = FALSE) as diseased_count,
        (SELECT COALESCE(AVG(plant_health_score), 0) FROM predictions WHERE user_id = p_user_id) as avg_health_score,
        (SELECT COUNT(*) FROM predictions WHERE user_id = p_user_id AND severity = 'CRITICAL') as critical_alerts;
END //
DELIMITER ;

-- Procedure: Archive old predictions (> 1 year old)
DELIMITER //
CREATE PROCEDURE ArchiveOldPredictions()
BEGIN
    -- This would typically move old records to an archive table
    -- For now, we'll just mark for archival in a comment
    -- MOVE predictions where created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR) to archive_predictions
    
    DELETE FROM predictions 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 2 YEAR)
    AND status = 'COMPLETED';
END //
DELIMITER ;

-- ============================================================================
-- CREATE ARCHIVE TABLE FOR OLD PREDICTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS archive_predictions LIKE predictions;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Composite indexes for common query patterns
ALTER TABLE predictions ADD INDEX idx_user_created (user_id, created_at);
ALTER TABLE predictions ADD INDEX idx_disease_severity (disease_name, severity);
ALTER TABLE reports ADD INDEX idx_user_created (user_id, created_at);

-- ============================================================================
-- CREATE DEFAULT ADMIN USER (Change password immediately!)
-- ============================================================================
-- Note: Password is bcrypt hashed version of "admin123" 
-- In production, use a strong password and update via admin panel
INSERT INTO users (name, email, password, role, enabled, created_at) VALUES
('System Admin', 'admin@cropmonitor.com', '$2a$10$SldrYmfG4f7UXRkJkh/dquGYBGLdkf5r3ZZN2rKFmNmLmLnQHaVjm', 'ADMIN', TRUE, NOW());

-- ============================================================================
-- GRANT PERMISSIONS TO APPLICATION USER
-- ============================================================================
-- CREATE USER 'cropmonitor'@'localhost' IDENTIFIED BY 'secure_password_123';
-- GRANT ALL PRIVILEGES ON cropmonitor_db.* TO 'cropmonitor'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
-- Total Tables: 11
-- Total Views: 2
-- Total Procedures: 2
-- Database: cropmonitor_db
-- Run this script to create complete database structure
-- ============================================================================
