package com.drone.controller;

import com.drone.dto.ApiResponse;
import com.drone.model.Report;
import com.drone.model.User;
import com.drone.service.AuthService;
import com.drone.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;
    private final AuthService authService;

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<Report>> generateReport(@RequestBody GenerateReportRequest request) {
        try {
            User user = authService.getCurrentUser();
            Report report = reportService.generateReport(
                    user,
                    request.getTitle(),
                    request.getDescription(),
                    request.getType(),
                    request.getDateFrom(),
                    request.getDateTo()
            );
            return ResponseEntity.ok(ApiResponse.success("Report generated successfully", report));
        } catch (Exception e) {
            log.error("Failed to generate report: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Report>>> getUserReports(
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
            
            Page<Report> reports = reportService.getUserReports(user, pageable);
            return ResponseEntity.ok(ApiResponse.success(reports));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Report>>> getAllUserReports() {
        try {
            User user = authService.getCurrentUser();
            List<Report> reports = reportService.getUserReports(user);
            return ResponseEntity.ok(ApiResponse.success(reports));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Report>> getReportById(@PathVariable Long id) {
        try {
            User user = authService.getCurrentUser();
            Report report = reportService.getReportById(id, user);
            return ResponseEntity.ok(ApiResponse.success(report));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteReport(@PathVariable Long id) {
        try {
            User user = authService.getCurrentUser();
            reportService.deleteReport(id, user);
            return ResponseEntity.ok(ApiResponse.success("Report deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/by-type/{type}")
    public ResponseEntity<ApiResponse<List<Report>>> getReportsByType(@PathVariable Report.ReportType type) {
        try {
            User user = authService.getCurrentUser();
            List<Report> reports = reportService.getReportsByType(user, type);
            return ResponseEntity.ok(ApiResponse.success(reports));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> countUserReports() {
        try {
            User user = authService.getCurrentUser();
            Long count = reportService.countUserReports(user);
            return ResponseEntity.ok(ApiResponse.success(count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Inner class for request body
    @lombok.Data
    public static class GenerateReportRequest {
        private String title;
        private String description;
        private Report.ReportType type;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime dateFrom;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime dateTo;
    }
}
