package com.drone.repository;

import com.drone.model.Report;
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
public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findByUser(User user);

    Page<Report> findByUser(User user, Pageable pageable);

    List<Report> findByUserOrderByCreatedAtDesc(User user);

    Page<Report> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    @Query("SELECT r FROM Report r WHERE r.user = :user AND r.type = :type ORDER BY r.createdAt DESC")
    List<Report> findByUserAndType(@Param("user") User user, @Param("type") Report.ReportType type);

    @Query("SELECT r FROM Report r WHERE r.user = :user AND r.createdAt BETWEEN :startDate AND :endDate ORDER BY r.createdAt DESC")
    List<Report> findByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(r) FROM Report r WHERE r.user = :user")
    Long countByUser(@Param("user") User user);

    // Admin queries
    @Query("SELECT COUNT(r) FROM Report r")
    Long countAll();

    List<Report> findTop10ByOrderByCreatedAtDesc();
}
