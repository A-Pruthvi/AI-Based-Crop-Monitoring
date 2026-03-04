package com.drone.repository;

import com.drone.model.Prediction;
import com.drone.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {

    List<Prediction> findByUser(User user);

    Page<Prediction> findByUser(User user, Pageable pageable);

    List<Prediction> findByUserOrderByCreatedAtDesc(User user);

    Page<Prediction> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    @Query("SELECT p FROM Prediction p WHERE p.user = :user AND p.createdAt >= :since ORDER BY p.createdAt DESC")
    List<Prediction> findByUserAndCreatedAtSince(@Param("user") User user, @Param("since") LocalDateTime since);

    @Query("SELECT p FROM Prediction p WHERE p.user = :user AND p.diseaseName = :disease")
    List<Prediction> findByUserAndDisease(@Param("user") User user, @Param("disease") String disease);

    @Query("SELECT p FROM Prediction p WHERE p.user = :user AND p.severity = :severity")
    List<Prediction> findByUserAndSeverity(@Param("user") User user, @Param("severity") Prediction.Severity severity);

    @Query("SELECT COUNT(p) FROM Prediction p WHERE p.user = :user")
    Long countByUser(@Param("user") User user);

    @Query("SELECT COUNT(p) FROM Prediction p WHERE p.user = :user AND p.isHealthy = true")
    Long countHealthyByUser(@Param("user") User user);

    @Query("SELECT COUNT(p) FROM Prediction p WHERE p.user = :user AND p.isHealthy = false")
    Long countDiseasedByUser(@Param("user") User user);

    @Query("SELECT COUNT(p) FROM Prediction p WHERE p.user = :user AND p.severity IN ('HIGH', 'CRITICAL')")
    Long countAlertsByUser(@Param("user") User user);

    @Query("SELECT p.diseaseName, COUNT(p) FROM Prediction p WHERE p.user = :user AND p.isHealthy = false GROUP BY p.diseaseName")
    List<Object[]> getDiseaseDistributionByUser(@Param("user") User user);

    @Query("SELECT p FROM Prediction p WHERE p.user = :user AND p.createdAt BETWEEN :startDate AND :endDate ORDER BY p.createdAt DESC")
    List<Prediction> findByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Admin queries
    @Query("SELECT COUNT(p) FROM Prediction p")
    Long countAll();

    @Query("SELECT COUNT(p) FROM Prediction p WHERE p.createdAt >= :since")
    Long countSince(@Param("since") LocalDateTime since);

    @Query("SELECT p.diseaseName, COUNT(p) FROM Prediction p WHERE p.isHealthy = false GROUP BY p.diseaseName ORDER BY COUNT(p) DESC")
    List<Object[]> getGlobalDiseaseDistribution();

    @Query("SELECT FUNCTION('DATE', p.createdAt), COUNT(p) FROM Prediction p WHERE p.createdAt >= :since GROUP BY FUNCTION('DATE', p.createdAt) ORDER BY FUNCTION('DATE', p.createdAt)")
    List<Object[]> getDailyPredictionCounts(@Param("since") LocalDateTime since);

    List<Prediction> findTop10ByOrderByCreatedAtDesc();

    List<Prediction> findByUserAndCropType(User user, String cropType);
}
