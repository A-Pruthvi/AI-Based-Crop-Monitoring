package com.drone.dto;

import com.drone.model.Prediction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionResponse {

    private Long id;
    private String imagePath;
    private String imageName;
    private String cropType;
    private String fieldLocation;
    private String notes;
    private String diseaseName;
    private Double confidenceScore;
    private String severity;
    private Boolean isHealthy;
    private List<String> treatmentRecommendations;
    private String status;
    private LocalDateTime createdAt;

    // New fields from AI service
    private String detectedCrop;
    private Integer plantHealthScore;
    private String heatmapUrl;
    private String cause;
    private String prevention;

    public static PredictionResponse fromEntity(Prediction prediction) {
        List<String> treatments = null;
        if (prediction.getTreatmentRecommendations() != null && !prediction.getTreatmentRecommendations().isEmpty()) {
            treatments = List.of(prediction.getTreatmentRecommendations().split("\\|"));
        }

        return PredictionResponse.builder()
                .id(prediction.getId())
                .imagePath(prediction.getImagePath())
                .imageName(prediction.getImageName())
                .cropType(prediction.getCropType())
                .fieldLocation(prediction.getFieldLocation())
                .notes(prediction.getNotes())
                .diseaseName(prediction.getDiseaseName())
                .confidenceScore(prediction.getConfidenceScore())
                .severity(prediction.getSeverity() != null ? prediction.getSeverity().name() : null)
                .isHealthy(prediction.getIsHealthy())
                .treatmentRecommendations(treatments)
                .status(prediction.getStatus() != null ? prediction.getStatus().name() : null)
                .createdAt(prediction.getCreatedAt())
                .detectedCrop(prediction.getDetectedCrop())
                .plantHealthScore(prediction.getPlantHealthScore())
                .heatmapUrl(prediction.getHeatmapUrl())
                .cause(prediction.getCause())
                .prevention(prediction.getPrevention())
                .build();
    }
}
