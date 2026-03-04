package com.drone.controller;

import com.drone.dto.ApiResponse;
import com.drone.dto.PredictionResponse;
import com.drone.dto.UserResponse;
import com.drone.model.Prediction;
import com.drone.model.User;
import com.drone.repository.PredictionRepository;
import com.drone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final PredictionRepository predictionRepository;
    private final PasswordEncoder passwordEncoder;

    // ==================== Dashboard Stats ====================

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();

        // User stats
        stats.put("totalUsers", userRepository.count());
        stats.put("totalFarmers", userRepository.countByRole(User.Role.FARMER));
        stats.put("totalExperts", userRepository.countByRole(User.Role.EXPERT));
        stats.put("totalAdmins", userRepository.countByRole(User.Role.ADMIN));
        stats.put("newUsersThisMonth", userRepository.countNewUsersSince(
                LocalDateTime.now().minusMonths(1)));

        // Prediction stats
        stats.put("totalPredictions", predictionRepository.countAll());
        stats.put("predictionsThisMonth", predictionRepository.countSince(
                LocalDateTime.now().minusMonths(1)));

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/stats/disease-distribution")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getGlobalDiseaseDistribution() {
        List<Object[]> results = predictionRepository.getGlobalDiseaseDistribution();
        List<Map<String, Object>> distribution = results.stream()
                .map(row -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("disease", row[0]);
                    item.put("count", row[1]);
                    return item;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(distribution));
    }

    @GetMapping("/stats/daily-predictions")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDailyPredictions(
            @RequestParam(defaultValue = "30") int days
    ) {
        List<Object[]> results = predictionRepository.getDailyPredictionCounts(
                LocalDateTime.now().minusDays(days));

        List<Map<String, Object>> dailyCounts = results.stream()
                .map(row -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("date", row[0].toString());
                    item.put("count", row[1]);
                    return item;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(dailyCounts));
    }

    // ==================== User Management ====================

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<UserResponse> users = userRepository.findAll(pageable)
                .map(UserResponse::fromEntity);

        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(ApiResponse.success(UserResponse.fromEntity(user)));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@RequestBody CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Email already registered"));
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .farmName(request.getFarmName())
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole() != null ? request.getRole() : User.Role.FARMER)
                .enabled(true)
                .build();

        user = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("User created successfully", UserResponse.fromEntity(user)));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getFarmName() != null) user.setFarmName(request.getFarmName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getEnabled() != null) user.setEnabled(request.getEnabled());

        user = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", UserResponse.fromEntity(user)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("User not found"));
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(!user.getEnabled());
        user = userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success(
                user.getEnabled() ? "User enabled" : "User disabled",
                UserResponse.fromEntity(user)
        ));
    }

    @PutMapping("/users/{id}/change-role")
    public ResponseEntity<ApiResponse<UserResponse>> changeUserRole(
            @PathVariable Long id,
            @RequestParam User.Role role
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(role);
        user = userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Role updated successfully", UserResponse.fromEntity(user)));
    }

    // ==================== Prediction Management ====================

    @GetMapping("/predictions")
    public ResponseEntity<ApiResponse<List<PredictionResponse>>> getRecentPredictions() {
        List<Prediction> predictions = predictionRepository.findTop10ByOrderByCreatedAtDesc();
        List<PredictionResponse> responses = predictions.stream()
                .map(PredictionResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    // ==================== Request DTOs ====================

    @lombok.Data
    public static class CreateUserRequest {
        private String name;
        private String email;
        private String password;
        private String farmName;
        private String phoneNumber;
        private User.Role role;
    }

    @lombok.Data
    public static class UpdateUserRequest {
        private String name;
        private String farmName;
        private String phoneNumber;
        private User.Role role;
        private Boolean enabled;
    }
}
