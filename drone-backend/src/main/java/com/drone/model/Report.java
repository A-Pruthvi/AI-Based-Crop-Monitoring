package com.drone.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ReportType type = ReportType.MANUAL;

    @Column(name = "date_from")
    private LocalDateTime dateFrom;

    @Column(name = "date_to")
    private LocalDateTime dateTo;

    @Column(name = "total_scans")
    @Builder.Default
    private Integer totalScans = 0;

    @Column(name = "healthy_count")
    @Builder.Default
    private Integer healthyCount = 0;

    @Column(name = "diseased_count")
    @Builder.Default
    private Integer diseasedCount = 0;

    @Column(name = "prediction_ids", columnDefinition = "TEXT")
    private String predictionIds;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "file_path")
    private String filePath;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ReportStatus status = ReportStatus.GENERATED;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum ReportType {
        DAILY,
        WEEKLY,
        MONTHLY,
        CUSTOM,
        MANUAL
    }

    public enum ReportStatus {
        GENERATING,
        GENERATED,
        FAILED
    }
}
