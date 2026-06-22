package com.smartlogix.auth.dto;

public record AuthResponse(
        String token,
        String tokenType,
        Long userId,
        String username,
        String role,
        long expiresInMs
) {
    public AuthResponse(String token, Long userId, String username, String role, long expiresInMs) {
        this(token, "Bearer", userId, username, role, expiresInMs);
    }
}