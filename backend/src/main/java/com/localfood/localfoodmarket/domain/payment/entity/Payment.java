package com.localfood.localfoodmarket.domain.payment.entity;

import com.localfood.localfoodmarket.domain.user.entity.User;
import com.localfood.localfoodmarket.global.entity.BaseEntity;
import com.localfood.localfoodmarket.global.exception.BusinessException;
import com.localfood.localfoodmarket.global.exception.ErrorCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Payment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 토스 주문 ID — 결제 준비 시 서버가 생성, 위변조 검증의 기준
    @Column(name = "order_id", nullable = false, unique = true, length = 64)
    private String orderId;

    // 토스 결제 키 — 승인(confirm) 시점에 채워짐
    @Column(name = "payment_key", length = 200)
    private String paymentKey;

    @Column(nullable = false)
    private Integer amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Builder
    private Payment(User user, String orderId, Integer amount) {
        this.user = user;
        this.orderId = orderId;
        this.amount = amount;
        this.status = PaymentStatus.PENDING;
    }

    // 토스 승인 성공 → 결제 완료
    public void complete(String paymentKey, LocalDateTime approvedAt) {
        if (this.status == PaymentStatus.DONE) {
            throw new BusinessException(ErrorCode.PAYMENT_ALREADY_DONE);
        }
        this.paymentKey = paymentKey;
        this.approvedAt = approvedAt;
        this.status = PaymentStatus.DONE;
    }

    // 토스 승인 실패
    public void fail() {
        this.status = PaymentStatus.FAILED;
    }

    public boolean isDone() {
        return this.status == PaymentStatus.DONE;
    }
}
