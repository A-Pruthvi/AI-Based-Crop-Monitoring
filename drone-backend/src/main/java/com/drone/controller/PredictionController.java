package com.drone.controller;

import com.drone.dto.ApiResponse;
import com.drone.dto.PredictionResponse;
import com.drone.dto.PredictionStatsResponse;
import com.drone.model.User;
import com.drone.service.AuthService;
import com.drone.service.PredictionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
@Slf4j
public class PredictionController {

    private final PredictionService predictionService;
    private final AuthService authService;

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PredictionResponse>> analyzeCropImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "cropType", required = false) String cropType,
            @RequestParam(value = "fieldLocation", required = false) String fieldLocation,
            @RequestParam(value = "notes", required = false) String notes
    ) {
        log.info("Received image for analysis: {}", file.getOriginalFilename());

        // Validate file
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Please select an image file"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Only image files are allowed"));
        }

        try {
            User user = authService.getCurrentUser();
            PredictionResponse response = predictionService.analyzeCropImage(
                    file, cropType, fieldLocation, notes, user
            );
            return ResponseEntity.ok(ApiResponse.success("Analysis completed", response));
        } catch (IOException e) {
            log.error("Failed to process image: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to process image"));
        } catch (Exception e) {
            log.error("Analysis failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PredictionResponse>>> getUserPredictions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        try {
            User user = authService.getCurrentUser();
            Sort sort = sortDir.equalsIgnoreCase("asc") ? 
                    Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<PredictionResponse> predictions = predictionService.getUserPredictions(user, pageable);
            return ResponseEntity.ok(ApiResponse.success(predictions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<PredictionResponse>>> getAllUserPredictions() {
        try {
            User user = authService.getCurrentUser();
            List<PredictionResponse> predictions = predictionService.getUserPredictions(user);
            return ResponseEntity.ok(ApiResponse.success(predictions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PredictionResponse>> getPredictionById(@PathVariable Long id) {
        try {
            User user = authService.getCurrentUser();
            PredictionResponse prediction = predictionService.getPredictionById(id, user);
            return ResponseEntity.ok(ApiResponse.success(prediction));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deletePrediction(@PathVariable Long id) {
        try {
            User user = authService.getCurrentUser();
            predictionService.deletePrediction(id, user);
            return ResponseEntity.ok(ApiResponse.success("Prediction deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<PredictionStatsResponse>> getUserStats() {
        try {
            User user = authService.getCurrentUser();
            PredictionStatsResponse stats = predictionService.getUserStats(user);
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/disease-distribution")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getDiseaseDistribution() {
        try {
            User user = authService.getCurrentUser();
            Map<String, Long> distribution = predictionService.getDiseaseDistribution(user);
            return ResponseEntity.ok(ApiResponse.success(distribution));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<PredictionResponse>>> getRecentPredictions(
            @RequestParam(defaultValue = "5") int limit
    ) {
        try {
            User user = authService.getCurrentUser();
            List<PredictionResponse> predictions = predictionService.getRecentPredictions(user, limit);
            return ResponseEntity.ok(ApiResponse.success(predictions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<List<PredictionResponse>>> getPredictionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        try {
            User user = authService.getCurrentUser();
            List<PredictionResponse> predictions = predictionService.getPredictionsByDateRange(user, startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success(predictions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
