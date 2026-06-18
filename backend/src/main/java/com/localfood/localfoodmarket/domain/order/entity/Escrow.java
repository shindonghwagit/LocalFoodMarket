package com.localfood.localfoodmarket.domain.order.entity;

import com.localfood.localfoodmarket.domain.farm.entity.Farm;
import com.localfood.localfoodmarket.domain.user.entity.User;
import com.localfood.localfoodmarket.global.exception.BusinessException;
import com.localfood.localfoodmarket.global.exception.ErrorCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "escrows")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Escrow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @Column(nullable = false)
    private Integer amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EscrowStatus status;

    @Column(name = "held_at", nullable = false)
    private LocalDateTime heldAt;

    @Column(name = "released_at")
    private LocalDateTime releasedAt;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @Builder
    private Escrow(Order order, User buyer, Farm farm, Integer amount) {
        this.order = order;
        this.buyer = buyer;
        this.farm = farm;
        this.amount = amount;
    }

    // 결제 시점에 잠금 — 생성과 동시에 호출
    public void hold() {
        if (this.status != null) {
            throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS,
                    "이미 처리된 에스크로예요.");
        }
        this.status = EscrowStatus.HELD;
        this.heldAt = LocalDateTime.now();
    }

    // 농가 정산 — 수령확인 후 호출
    public void release() {
        if (this.status != EscrowStatus.HELD) {
            throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS,
                    "잠금된 에스크로만 정산할 수 있어요.");
        }
        this.status = EscrowStatus.RELEASED;
        this.releasedAt = LocalDateTime.now();
    }

    // 구매자 환불 — 주문 취소 후 호출
    public void refund() {
        if (this.status != EscrowStatus.HELD) {
            throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS,
                    "잠금된 에스크로만 환불할 수 있어요.");
        }
        this.status = EscrowStatus.REFUNDED;
        this.refundedAt = LocalDateTime.now();
    }
}
