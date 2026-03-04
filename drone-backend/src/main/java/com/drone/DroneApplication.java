package com.drone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class DroneApplication {

    public static void main(String[] args) {
        SpringApplication.run(DroneApplication.class, args);
        System.out.println("========================================");
        System.out.println("  Drone Crop Monitoring System Started  ");
        System.out.println("  Server running on port 8081           ");
        System.out.println("========================================");
    }
}
