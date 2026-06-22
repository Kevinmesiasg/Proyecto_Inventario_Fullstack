package com.smartlogix.auth.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad JPA que representa un usuario registrado en SmartLogix.
 */
@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Role role = Role.ROLE_USER;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private Integer puntos = 0;

    @Column(nullable = false)
    private Integer enviosGratis = 0;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Suma un punto por envío realizado.
     * Cada 15 puntos se obtiene 1 envío gratis.
     */
    public void agregarPunto() {
        this.puntos++;

        if (this.puntos >= 15) {
            this.puntos -= 15;
            this.enviosGratis++;
        }
    }

    /**
     * Consume un envío gratis.
     */
    public boolean usarEnvioGratis() {
        if (this.enviosGratis > 0) {
            this.enviosGratis--;
            return true;
        }
        return false;
    }

    // ===== GETTERS Y SETTERS =====

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public Integer getPuntos() {
        return puntos;
    }

    public void setPuntos(Integer puntos) {
        this.puntos = puntos;
    }

    public Integer getEnviosGratis() {
        return enviosGratis;
    }

    public void setEnviosGratis(Integer enviosGratis) {
        this.enviosGratis = enviosGratis;
    }
}