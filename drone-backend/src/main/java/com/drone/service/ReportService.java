package com.drone.service;

import com.drone.model.Prediction;
import com.drone.model.Report;
import com.drone.model.User;
import com.drone.repository.PredictionRepository;
import com.drone.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final ReportRepository reportRepository;
    private final PredictionRepository predictionRepository;

    @Transactional
    public Report generateReport(
            User user,
            String title,
            String description,
            Report.ReportType type,
            LocalDateTime dateFrom,
            LocalDateTime dateTo
    ) {
        log.info("Generating report for user: {}", user.getEmail());

        // Get predictions for the date range
        List<Prediction> predictions = predictionRepository.findByUserAndDateRange(user, dateFrom, dateTo);

        // Calculate statistics
        int totalScans = predictions.size();
        int healthyCount = (int) predictions.stream().filter(Prediction::getIsHealthy).count();
        int diseasedCount = totalScans - healthyCount;

        // Get prediction IDs
        String predictionIds = predictions.stream()
                .map(p -> p.getId().toString())
                .collect(Collectors.joining(","));

        // Generate summary
        String summary = generateSummary(predictions, dateFrom, dateTo);

        // Create report
        Report report = Report.builder()
                .user(user)
                .title(title)
                .description(description)
                .type(type)
                .dateFrom(dateFrom)
                .dateTo(dateTo)
                .totalScans(totalScans)
                .healthyCount(healthyCount)
                .diseasedCount(diseasedCount)
                .predictionIds(predictionIds)
                .summary(summary)
                .status(Report.ReportStatus.GENERATED)
                .build();

        report = reportRepository.save(report);
        log.info("Report generated successfully: {}", report.getId());

        return report;
    }

    private String generateSummary(List<Prediction> predictions, LocalDateTime from, LocalDateTime to) {
        if (predictions.isEmpty()) {
            return "No scans were performed during this period.";
        }

        int total = predictions.size();
        int healthy = (int) predictions.stream().filter(Prediction::getIsHealthy).count();
        int diseased = total - healthy;
        
        double healthyPercentage = (healthy * 100.0) / total;
        
        // Count diseases
        var diseaseCount = predictions.stream()
                .filter(p -> !p.getIsHealthy())
                .collect(Collectors.groupingBy(Prediction::getDiseaseName, Collectors.counting()));

        StringBuilder summary = new StringBuilder();
        summary.append(String.format("During the period from %s to %s, ", from.toLocalDate(), to.toLocalDate()));
        summary.append(String.format("a total of %d scans were performed. ", total));
        summary.append(String.format("%.1f%% of crops were healthy (%d scans). ", healthyPercentage, healthy));
        
        if (!diseaseCount.isEmpty()) {
            summary.append("Detected diseases: ");
            String diseases = diseaseCount.entrySet().stream()
                    .map(e -> String.format("%s (%d)", e.getKey(), e.getValue()))
                    .collect(Collectors.joining(", "));
            summary.append(diseases).append(". ");
        }

        // Count critical/high severity
        long criticalCount = predictions.stream()
                .filter(p -> p.getSeverity() == Prediction.Severity.CRITICAL || 
                            p.getSeverity() == Prediction.Severity.HIGH)
                .count();
        
        if (criticalCount > 0) {
            summary.append(String.format("ALERT: %d cases require immediate attention.", criticalCount));
        }

        return summary.toString();
    }

    public List<Report> getUserReports(User user) {
        return reportRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Page<Report> getUserReports(User user, Pageable pageable) {
        return reportRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }

    public Report getReportById(Long id, User user) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        // Verify ownership
        if (!report.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        return report;
    }

    @Transactional
    public void deleteReport(Long id, User user) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        // Verify ownership
        if (!report.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        reportRepository.delete(report);
    }

    public List<Report> getReportsByType(User user, Report.ReportType type) {
        return reportRepository.findByUserAndType(user, type);
    }

    public Long countUserReports(User user) {
        return reportRepository.countByUser(user);
    }
}
