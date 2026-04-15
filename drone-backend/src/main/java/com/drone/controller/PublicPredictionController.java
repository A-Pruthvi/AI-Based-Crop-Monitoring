package com.drone.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Public API for Crop Disease Prediction
 * No authentication required - Direct gateway to AI Service
 */
@RestController
@RequestMapping("/api/public/predict")
@RequiredArgsConstructor
@Slf4j
public class PublicPredictionController {

    @Value("${ai.service.url:http://localhost:5000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Analyze crop image - PUBLIC ENDPOINT (No Auth Required)
     * Downloads image → sends to AI Service → returns crop + disease prediction
     */
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> analyzeCropImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "cropType", required = false) String cropType
    ) {
        log.info("PUBLIC API: Received image for analysis: {}", file.getOriginalFilename());

        // Validate file
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(errorResponse("Please select an image file"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(errorResponse("Only image files are allowed (JPG, PNG, WebP)"));
        }

        try {
            // Get file bytes
            byte[] fileBytes = file.getBytes();

            // Create multipart form data for AI Service
            MultiValueMap<String, Object> formData = new LinkedMultiValueMap<>();
            
            // Wrap file bytes in ByteArrayResource with filename
            ByteArrayResource fileResource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            
            formData.add("file", fileResource);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(formData, headers);

            log.info("Calling AI Service at: {}/predict", aiServiceUrl);

            try {
                // Call Python Flask AI Service with multipart form data
                ResponseEntity<String> aiResponse = restTemplate.postForEntity(
                        aiServiceUrl + "/predict",
                        requestEntity,
                        String.class
                );

                if (!aiResponse.getStatusCode().is2xxSuccessful()) {
                    log.error("AI Service returned error: {}", aiResponse.getBody());
                    return ResponseEntity.internalServerError()
                            .body(errorResponse("AI Service error: " + aiResponse.getBody()));
                }

                log.info("AI Service Response: {}", aiResponse.getBody());

                // Parse AI Service response
                JsonNode responseNode = objectMapper.readTree(aiResponse.getBody());

                // Build comprehensive response - map Flask fields correctly
                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("crop", responseNode.has("crop") ? responseNode.get("crop").asText() : "Unknown");
                result.put("disease", responseNode.has("disease") ? responseNode.get("disease").asText() : "Healthy");
                
                // Handle both old format (confidence) and new format (crop_confidence, disease_confidence)
                if (responseNode.has("crop_confidence") && responseNode.has("disease_confidence")) {
                    result.put("crop_confidence", responseNode.get("crop_confidence").asDouble());
                    result.put("disease_confidence", responseNode.get("disease_confidence").asDouble());
                } else if (responseNode.has("confidence")) {
                    result.put("confidence", responseNode.get("confidence").asDouble());
                }
                
                result.put("severity", responseNode.has("severity") ? responseNode.get("severity").asDouble() : 0.0);
                result.put("plant_health_score", responseNode.has("plant_health_score") ? responseNode.get("plant_health_score").asDouble() : 0.0);
                result.put("cause", responseNode.has("cause") ? responseNode.get("cause").asText() : "Not available");
                result.put("treatment", responseNode.has("treatment") ? responseNode.get("treatment").asText() : "No specific treatment available");
                result.put("prevention", responseNode.has("prevention") ? responseNode.get("prevention").asText() : "Not available");
                result.put("heatmap_image", responseNode.has("heatmap_image") ? responseNode.get("heatmap_image").asText() : "");

                // Add metadata
                result.put("timestamp", System.currentTimeMillis());
                result.put("image_name", file.getOriginalFilename());

                return ResponseEntity.ok(result);

            } catch (Exception e) {
                log.error("Failed to call AI Service: {}", e.getMessage());
                return ResponseEntity.internalServerError()
                        .body(errorResponse("AI Service error: " + e.getMessage()));
            }

        } catch (IOException e) {
            log.error("Failed to process image: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(errorResponse("Failed to process image: " + e.getMessage()));
        }
    }

    /**
     * Get list of supported crops
     */
    @GetMapping("/crops")
    public ResponseEntity<Map<String, Object>> getSupportedCrops() {
        try {
            String response = restTemplate.getForObject(aiServiceUrl + "/crops", String.class);
            JsonNode node = objectMapper.readTree(response);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("crops", node.get("crops"));
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to get crops: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(errorResponse("Failed to fetch crops"));
        }
    }

    /**
     * Get diseases for a specific crop
     */
    @GetMapping("/diseases/{crop}")
    public ResponseEntity<Map<String, Object>> getDiseasesForCrop(@PathVariable String crop) {
        try {
            String response = restTemplate.getForObject(
                    aiServiceUrl + "/diseases/" + crop, 
                    String.class
            );
            JsonNode node = objectMapper.readTree(response);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("crop", crop);
            result.put("diseases", node.get("diseases"));
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to get diseases for crop {}: {}", crop, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(errorResponse("Failed to fetch diseases for crop"));
        }
    }

    /**
     * Health check
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        try {
            String aiResponse = restTemplate.getForObject(aiServiceUrl + "/health", String.class);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("backend", "online");
            result.put("ai_service", "online");
            result.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.warn("AI Service health check failed: {}", e.getMessage());
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("backend", "online");
            result.put("ai_service", "offline");
            result.put("error", e.getMessage());
            
            return ResponseEntity.internalServerError().body(result);
        }
    }

    // Helper method to create error response
    private Map<String, Object> errorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("error", message);
        error.put("timestamp", System.currentTimeMillis());
        return error;
    }
}
