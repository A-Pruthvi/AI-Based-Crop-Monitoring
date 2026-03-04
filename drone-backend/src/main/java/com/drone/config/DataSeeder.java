package com.drone.config;

import com.drone.model.User;
import com.drone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createDemoUserIfNotExists(
                "demo@farm.com",
                "Demo@123",
                "Demo User",
                "Demo Farm",
                "1234567890",
                User.Role.FARMER
        );

        createDemoUserIfNotExists(
                "admin@farm.com",
                "Admin@123",
                "Admin User",
                "Admin Farm",
                "0987654321",
                User.Role.ADMIN
        );

        log.info("========================================");
        log.info("  Demo Credentials:");
        log.info("  Farmer: demo@farm.com / Demo@123");
        log.info("  Admin:  admin@farm.com / Admin@123");
        log.info("========================================");
    }

    private void createDemoUserIfNotExists(String email, String password, String name,
                                            String farmName, String phone, User.Role role) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .farmName(farmName)
                    .phoneNumber(phone)
                    .role(role)
                    .enabled(true)
                    .build();
            userRepository.save(user);
            log.info("Created demo user: {} ({})", email, role);
        } else {
            log.info("Demo user already exists: {}", email);
        }
    }
}
