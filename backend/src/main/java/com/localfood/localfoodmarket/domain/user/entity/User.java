package com.localfood.localfoodmarket.domain.user.entity;

import com.localfood.localfoodmarket.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

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

    // 토스 SDK 고객 식별값. 이메일·순번처럼 추측 가능한 값은 사용하지 않는다.
    @Column(name = "payment_customer_key", unique = true, length = 64)
    private String paymentCustomerKey;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean suspended = false;

    @Builder
    private User(String email, String passwordHash, Role role) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.pointBalance = 0L;
        this.suspended = false;
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

    public String getOrCreatePaymentCustomerKey() {
        if (paymentCustomerKey == null) {
            paymentCustomerKey = "customer_" + UUID.randomUUID().toString().replace("-", "");
        }
        return paymentCustomerKey;
    }

    public void suspend() {
        this.suspended = true;
    }

    public void unsuspend() {
        this.suspended = false;
    }
}
