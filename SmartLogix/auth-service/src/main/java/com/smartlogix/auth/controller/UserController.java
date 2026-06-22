package com.smartlogix.auth.controller;

import com.smartlogix.auth.domain.UserEntity;
import com.smartlogix.auth.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PutMapping("/{id}/add-point")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addPoint(@PathVariable Long id) {

        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.agregarPunto();

        userRepository.save(user);
    }

    @GetMapping("/{id}/points")
    public UserPointsResponse getPoints(@PathVariable Long id) {

        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return new UserPointsResponse(
                user.getId(),
                user.getUsername(),
                user.getPuntos(),
                user.getEnviosGratis()
        );
    }

    public record UserPointsResponse(
            Long userId,
            String username,
            Integer puntos,
            Integer enviosGratis
    ) {}

    @GetMapping
    public List<UserSummaryResponse> getUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserSummaryResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getRole().name(),
                        user.getPuntos(),
                        user.getEnviosGratis()
                ))
                .toList();
    }

    public record UserSummaryResponse(
            Long id,
            String username,
            String email,
            String role,
            Integer puntos,
            Integer enviosGratis
    ) {}
}