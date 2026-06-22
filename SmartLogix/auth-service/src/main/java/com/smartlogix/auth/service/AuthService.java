package com.smartlogix.auth.service;

import com.smartlogix.auth.domain.Role;
import com.smartlogix.auth.domain.UserEntity;
import com.smartlogix.auth.dto.*;
import com.smartlogix.auth.exception.AuthException;
import com.smartlogix.auth.repository.UserRepository;
import com.smartlogix.auth.security.JwtProvider;
import com.smartlogix.auth.strategy.AuthStrategyResolver;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final AuthStrategyResolver strategyResolver;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtProvider jwtProvider,
                       AuthStrategyResolver strategyResolver) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
        this.strategyResolver = strategyResolver;
    }

    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new AuthException("El nombre de usuario ya está en uso: " + request.username());
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new AuthException("El email ya está registrado: " + request.email());
        }

        UserEntity user = new UserEntity();
        user.setUsername(request.username().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.ROLE_USER);
        user.setEnabled(true);

        userRepository.save(user);

        return new RegisterResponse(
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                "Usuario registrado exitosamente."
        );
    }

    public AuthResponse login(LoginRequest request) {
        try {
            UserEntity user = strategyResolver
                    .resolve(request.credential())
                    .authenticate(request.credential(), request.password());

            String token = jwtProvider.generateToken(
                    user.getUsername(),
                    user.getRole().name()
            );

            return new AuthResponse(
                    token,
                    user.getId(),
                    user.getUsername(),
                    user.getRole().name(),
                    3600000L
            );
        } catch (RuntimeException e) {
            throw new AuthException("Credenciales invalidas.");
        }
    }

    @Transactional(readOnly = true)
    public AuthResponse validateToken(String token) {
        if (!jwtProvider.validateToken(token)) {
            throw new AuthException("Token inválido o expirado.");
        }

        String username = jwtProvider.getUsernameFromToken(token);

        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("Usuario no encontrado."));

        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                3600000L
        );
    }
}