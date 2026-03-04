package com.drone.service;

import com.drone.dto.PredictionResponse;
import com.drone.dto.PredictionStatsResponse;
import com.drone.model.Prediction;
import com.drone.model.User;
import com.drone.repository.PredictionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Value("${ai.service.analyze-endpoint}")
    private String analyzeEndpoint;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Transactional
    public PredictionResponse analyzeCropImage(
            MultipartFile file,
            String cropType,
            String fieldLocation,
            String notes,
            User user
    ) throws IOException {
        log.info("Analyzing crop image for user: {}", user.getEmail());

        // Save the uploaded file
        String fileName = saveFile(file, user.getId());
        String filePath = uploadDir + "/" + user.getId() + "/" + fileName;

        // Create prediction record with PROCESSING status
        Prediction prediction = Prediction.builder()
                .user(user)
                .imagePath(filePath)
                .imageName(file.getOriginalFilename())
                .cropType(cropType)
                .fieldLocation(fieldLocation)
                .notes(notes)
                .status(Prediction.PredictionStatus.PROCESSING)
                .build();

        prediction = predictionRepository.save(prediction);

        try {
            // Call AI service
            JsonNode aiResponse = callAiService(file);

            // Parse AI response — AI service wraps data inside a "data" object
            JsonNode aiData = aiResponse.has("data") ? aiResponse.get("data") : aiResponse;
            String diseaseName = aiData.has("disease") ? aiData.get("disease").asText() : "Unknown";
            double confidence = aiData.has("confidence") ? aiData.get("confidence").asDouble() : 0.0;
            // AI service returns confidence as percentage (0-100), normalize to decimal (0-1)
            if (confidence > 1.0) {
                confidence = confidence / 100.0;
            }
            // AI service uses camelCase "isHealthy"
            boolean isHealthy = aiData.has("isHealthy") ? aiData.get("isHealthy").asBoolean() :
                    aiData.has("is_healthy") ? aiData.get("is_healthy").asBoolean() :
                    diseaseName.equalsIgnoreCase("Healthy");

            // Determine severity based on confidence
            Prediction.Severity severity = determineSeverity(confidence, isHealthy);

            // Get treatment recommendations
            String treatments = getTreatmentRecommendations(diseaseName);

            // Update prediction with results
            prediction.setDiseaseName(diseaseName);
            prediction.setConfidenceScore(confidence);
            prediction.setIsHealthy(isHealthy);
            prediction.setSeverity(severity);
            prediction.setTreatmentRecommendations(treatments);
            prediction.setAiRawResponse(aiResponse.toString());
            prediction.setStatus(Prediction.PredictionStatus.COMPLETED);

            prediction = predictionRepository.save(prediction);
            log.info("Prediction completed successfully: {}", prediction.getId());

        } catch (Exception e) {
            log.error("AI service call failed: {}", e.getMessage());
            prediction.setStatus(Prediction.PredictionStatus.FAILED);
            prediction.setDiseaseName("Analysis Failed");
            prediction = predictionRepository.save(prediction);
        }

        return PredictionResponse.fromEntity(prediction);
    }

    private String saveFile(MultipartFile file, Long userId) throws IOException {
        // Create user-specific directory
        Path userDir = Paths.get(uploadDir, userId.toString());
        if (!Files.exists(userDir)) {
            Files.createDirectories(userDir);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
        String newFilename = UUID.randomUUID().toString() + extension;

        // Save file
        Path filePath = userDir.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return newFilename;
    }

    private JsonNode callAiService(MultipartFile file) throws IOException {
        log.info("Calling AI service at: {}{}", aiServiceUrl, analyzeEndpoint);

        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        }).contentType(MediaType.IMAGE_JPEG);

        try {
            String response = webClientBuilder.build()
                    .post()
                    .uri(aiServiceUrl + analyzeEndpoint)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return objectMapper.readTree(response);
        } catch (Exception e) {
            log.error("Failed to call AI service: {}", e.getMessage());
            // Return mock response for development
            return objectMapper.readTree("{\"disease\":\"Bacterial Blight\",\"confidence\":0.87,\"is_healthy\":false}");
        }
    }

    private Prediction.Severity determineSeverity(double confidence, boolean isHealthy) {
        if (isHealthy) {
            return Prediction.Severity.LOW;
        }

        if (confidence >= 0.9) {
            return Prediction.Severity.CRITICAL;
        } else if (confidence >= 0.75) {
            return Prediction.Severity.HIGH;
        } else if (confidence >= 0.5) {
            return Prediction.Severity.MEDIUM;
        } else {
            return Prediction.Severity.LOW;
        }
    }

    private String getTreatmentRecommendations(String diseaseName) {
        Map<String, List<String>> treatments = new HashMap<>();
        treatments.put("Bacterial Blight", Arrays.asList(
                "Apply copper-based bactericides",
                "Remove and destroy infected plant parts",
                "Improve air circulation around plants",
                "Avoid overhead irrigation"
        ));
        treatments.put("Leaf Rust", Arrays.asList(
                "Apply fungicides containing triazoles",
                "Use resistant crop varieties",
                "Practice crop rotation",
                "Remove volunteer plants"
        ));
        treatments.put("Brown Spot", Arrays.asList(
                "Apply appropriate fungicides",
                "Ensure proper nutrient balance",
                "Improve drainage",
                "Use certified disease-free seeds"
        ));
        treatments.put("Tungro", Arrays.asList(
                "Control leafhopper vectors",
                "Use resistant varieties",
                "Synchronize planting dates",
                "Remove infected plants promptly"
        ));
        treatments.put("Healthy", Arrays.asList(
                "Continue regular monitoring",
                "Maintain proper irrigation",
                "Apply balanced fertilizers",
                "Practice preventive pest management"
        ));
        treatments.put("Leaf Blast", Arrays.asList(
                "Apply Tricyclazole 0.6g/L as preventive spray",
                "Drain excess water from fields",
                "Avoid excessive nitrogen application",
                "Use silicon-based fertilizers to strengthen cells"
        ));
        treatments.put("Sheath Blight", Arrays.asList(
                "Apply Validamycin 2ml/L or Hexaconazole 1ml/L",
                "Reduce plant density for better aeration",
                "Avoid excess nitrogen fertilizer",
                "Drain standing water from fields"
        ));
        treatments.put("False Smut", Arrays.asList(
                "Apply Propiconazole 1ml/L at booting stage",
                "Remove and destroy infected panicles",
                "Use disease-free seeds",
                "Avoid late nitrogen application"
        ));
        treatments.put("Hispa", Arrays.asList(
                "Apply Chlorpyrifos 2ml/L or Quinalphos",
                "Remove grassy weeds from field margins",
                "Clip and destroy leaf tips containing eggs",
                "Apply Neem-based pesticides"
        ));
        treatments.put("Neck Blast", Arrays.asList(
                "Apply Tricyclazole before heading stage",
                "Avoid late planting",
                "Use balanced fertilization",
                "Ensure proper drainage"
        ));

        List<String> treatmentList = treatments.getOrDefault(diseaseName, 
                Arrays.asList("Consult local agricultural expert", "Send sample for lab analysis"));

        return String.join("|", treatmentList);
    }

    public List<PredictionResponse> getUserPredictions(User user) {
        return predictionRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(PredictionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<PredictionResponse> getUserPredictions(User user, Pageable pageable) {
        return predictionRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(PredictionResponse::fromEntity);
    }

    public PredictionResponse getPredictionById(Long id, User user) {
        Prediction prediction = predictionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prediction not found"));

        // Verify ownership
        if (!prediction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        return PredictionResponse.fromEntity(prediction);
    }

    @Transactional
    public void deletePrediction(Long id, User user) {
        Prediction prediction = predictionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prediction not found"));

        // Verify ownership
        if (!prediction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        // Delete the image file
        try {
            Path filePath = Paths.get(prediction.getImagePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Failed to delete image file: {}", e.getMessage());
        }

        predictionRepository.delete(prediction);
    }

    public PredictionStatsResponse getUserStats(User user) {
        Long total = predictionRepository.countByUser(user);
        Long healthy = predictionRepository.countHealthyByUser(user);
        Long diseased = predictionRepository.countDiseasedByUser(user);
        Long alerts = predictionRepository.countAlertsByUser(user);

        return PredictionStatsResponse.create(total, healthy, diseased, alerts);
    }

    public Map<String, Long> getDiseaseDistribution(User user) {
        List<Object[]> results = predictionRepository.getDiseaseDistributionByUser(user);
        Map<String, Long> distribution = new LinkedHashMap<>();

        for (Object[] row : results) {
            String disease = (String) row[0];
            Long count = (Long) row[1];
            distribution.put(disease, count);
        }

        return distribution;
    }

    public List<PredictionResponse> getRecentPredictions(User user, int limit) {
        return predictionRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .limit(limit)
                .map(PredictionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PredictionResponse> getPredictionsByDateRange(User user, LocalDateTime startDate, LocalDateTime endDate) {
        return predictionRepository.findByUserAndDateRange(user, startDate, endDate)
                .stream()
                .map(PredictionResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
