package com.localfood.localfoodmarket.domain.point.entity;

import com.localfood.localfoodmarket.domain.order.entity.Order;
import com.localfood.localfoodmarket.domain.user.entity.User;
import com.localfood.localfoodmarket.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "point_logs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PointLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 관련 주문 — 충전(CHARGE)은 NULL
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(nullable = false)
    private Integer amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PointLogType type;

    // 변동 후 잔액 — 정산 감사(audit)용
    @Column(name = "balance_after")
    private Long balanceAfter;

    @Builder
    private PointLog(User user, Order order, Integer amount, PointLogType type, Long balanceAfter) {
        this.user = user;
        this.order = order;
        this.amount = amount;
        this.type = type;
        this.balanceAfter = balanceAfter;
    }
}
