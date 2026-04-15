package com.drone.controller;

import com.drone.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Demo Authentication Controller
 * Minimal login for demo/testing without database
 */
@RestController
@RequestMapping("/api/auth")
@Slf4j
public class DemoAuthController {

    @PostMapping("/demo-login")
    public ResponseEntity<Map<String, Object>> demoLogin(
            @RequestBody Map<String, String> request
    ) {
        log.info("Demo login request for: {}", request.get("email"));
        
        String email = request.getOrDefault("email", "");
        String password = request.getOrDefault("password", "");
        
        // Accept demo credentials
        if ("demo@farm.com".equals(email) && "Demo@123".equals(password)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("token", "demo-jwt-token-" + System.currentTimeMillis());
            response.put("user", Map.of(
                "id", 1,
                "email", email,
                "name", "Demo Farmer",
                "role", "FARMER"
            ));
            
            return ResponseEntity.ok(response);
        } else if ("admin@farm.com".equals(email) && "Admin@123".equals(password)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("token", "demo-jwt-token-" + System.currentTimeMillis());
            response.put("user", Map.of(
                "id", 2,
                "email", email,
                "name", "Demo Admin",
                "role", "ADMIN"
            ));
            
            return ResponseEntity.ok(response);
        }
        
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("error", "Invalid email or password");
        error.put("message", "Invalid credentials");
        
        return ResponseEntity.badRequest().body(error);
    }

    @PostMapping("/demo-register")
    public ResponseEntity<Map<String, Object>> demoRegister(
            @RequestBody Map<String, String> request
    ) {
        log.info("Demo registration request for: {}", request.get("email"));
        
        String email = request.getOrDefault("email", "");
        String name = request.getOrDefault("name", "User");
        
        if (email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Email is required"
            ));
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Registration successful");
        response.put("token", "demo-jwt-token-" + System.currentTimeMillis());
        response.put("user", Map.of(
            "id", System.currentTimeMillis(),
            "email", email,
            "name", name,
            "role", "FARMER"
        ));
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "online", "auth", "demo-mode"));
    }
}
