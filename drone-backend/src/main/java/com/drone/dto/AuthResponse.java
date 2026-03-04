package com.drone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String type;
    private Long id;
    private String name;
    private String email;
    private String role;
    private String farmName;
    private String phoneNumber;
    private String profileImage;

    public static AuthResponse create(String token, Long id, String name, String email, 
                                       String role, String farmName, String phoneNumber, String profileImage) {
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(id)
                .name(name)
                .email(email)
                .role(role)
                .farmName(farmName)
                .phoneNumber(phoneNumber)
                .profileImage(profileImage)
                .build();
    }
}
