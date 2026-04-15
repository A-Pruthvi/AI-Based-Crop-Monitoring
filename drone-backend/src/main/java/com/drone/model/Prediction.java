package com.drone.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "image_path", nullable = false)
    private String imagePath;

    @Column(name = "image_name")
    private String imageName;

    @Column(name = "crop_type")
    private String cropType;

    @Column(name = "field_location")
    private String fieldLocation;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "disease_name")
    private String diseaseName;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Enumerated(EnumType.STRING)
    private Severity severity;

    @Column(name = "is_healthy")
    @Builder.Default
    private Boolean isHealthy = false;

    @Column(name = "treatment_recommendations", columnDefinition = "TEXT")
    private String treatmentRecommendations;

    @Column(name = "detected_crop")
    private String detectedCrop;

    @Column(name = "plant_health_score")
    private Integer plantHealthScore;

    @Column(name = "heatmap_url")
    private String heatmapUrl;

    @Column(name = "cause", columnDefinition = "TEXT")
    private String cause;

    @Column(name = "prevention", columnDefinition = "TEXT")
    private String prevention;

    @Column(name = "ai_raw_response", columnDefinition = "TEXT")
    private String aiRawResponse;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PredictionStatus status = PredictionStatus.COMPLETED;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum Severity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    public enum PredictionStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED
    }
}
