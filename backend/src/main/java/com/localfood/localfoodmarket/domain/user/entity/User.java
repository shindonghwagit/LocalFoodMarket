package com.localfood.localfoodmarket.domain.user.entity;

import com.localfood.localfoodmarket.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    // 소셜 전용 계정은 NULL
    @Column(name = "password_hash")
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "point_balance", nullable = false)
    private Long pointBalance = 0L;

    @Builder
    private User(String email, String passwordHash, Role role) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.pointBalance = 0L;
    }

    public void updateEmail(String email) {
        this.email = email;
    }

    public void updateRole(Role role) {
        this.role = role;
    }

    public void updatePassword(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void deductPoint(long amount) {
        this.pointBalance -= amount;
    }

    public void chargePoint(long amount) {
        this.pointBalance += amount;
    }
}
