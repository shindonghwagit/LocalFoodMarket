package com.localfood.localfoodmarket.domain.order.entity;

import com.localfood.localfoodmarket.domain.farm.entity.Farm;
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
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 정산 대상 농가 — 한 주문은 한 농가의 상품만 담는다
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id")
    private Farm farm;

    @Column(nullable = false)
    private Integer totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_method")
    private DeliveryMethod deliveryMethod;

    // 배송용 필드
    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Column(length = 50)
    private String courier;

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    // 픽업용 필드
    @Column(name = "pickup_location")
    private String pickupLocation;

    @Column(name = "pickup_time")
    private LocalDateTime pickupTime;

    @Column(name = "buyer_note", length = 500)
    private String buyerNote;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    @Column(name = "canceled_at")
    private LocalDateTime canceledAt;

    @Version
    private Long version;

    @Builder
    private Order(User user, Farm farm, Integer totalPrice, OrderStatus status,
                  DeliveryMethod deliveryMethod, String deliveryAddress,
                  String courier, String trackingNumber,
                  String pickupLocation, LocalDateTime pickupTime,
                  String buyerNote) {
        this.user = user;
        this.farm = farm;
        this.totalPrice = totalPrice;
        this.status = status;
        this.deliveryMethod = deliveryMethod;
        this.deliveryAddress = deliveryAddress;
        this.courier = courier;
        this.trackingNumber = trackingNumber;
        this.pickupLocation = pickupLocation;
        this.pickupTime = pickupTime;
        this.buyerNote = buyerNote;
    }

    // 픽업 — 수령 준비 완료
    public void markReady() {
        if (this.deliveryMethod != DeliveryMethod.PICKUP) {
            throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS,
                    "픽업 주문만 수령 준비 처리할 수 있어요.");
        }
        if (this.status != OrderStatus.PAID) {
            throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS,
                    "결제 완료 상태에서만 수령 준비 처리할 수 있어요.");
        }
        this.status = OrderStatus.READY;
    }

    // 배송 — 준비중
    public void markPreparing() {
        if (this.deliveryMethod != DeliveryMethod.DELIVERY) {
            throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS,
                    "배송 주문만 준비중 처리할 수 있어요.");
        }
        if (this.status != OrderStatus.PAID) {
            throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS,
                    "결제 완료 상태에서만 준비중 처리할 수 있어요.");
        }
        this.status = OrderStatus.PREPARING;
    }

    // 배송 — 발송 (송장 등록)
    public void markShipping(String courier, String trackingNumber) {
        if (this.status != OrderStatus.PREPARING) {
            throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS,
                    "준비중 상태에서만 배송 시작 처리할 수 있어요.");
        }
        this.status = OrderStatus.SHIPPING;
        this.courier = courier;
        this.trackingNumber = trackingNumber;
    }

    // 배송 — 배송완료 (자동확정 기준 시각 기록)
    public void markDelivered() {
        if (this.status != OrderStatus.SHIPPING) {
            throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS,
                    "배송중 상태에서만 배송완료 처리할 수 있어요.");
        }
        this.status = OrderStatus.DELIVERED;
        this.deliveredAt = LocalDateTime.now();
    }

    // 구매자 수령확인 — 픽업(READY) 또는 배송(DELIVERED)에서 가능
    public void confirm() {
        if (this.status != OrderStatus.READY && this.status != OrderStatus.DELIVERED) {
            throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS,
                    "수령 준비 또는 배송 완료 상태에서만 수령확인할 수 있어요.");
        }
        this.status = OrderStatus.CONFIRMED;
        this.confirmedAt = LocalDateTime.now();
    }

    // 정산 — 농가 포인트 지급 완료
    public void settle() {
        if (this.status != OrderStatus.CONFIRMED) {
            throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS,
                    "수령확인된 주문만 정산할 수 있어요.");
        }
        this.status = OrderStatus.SETTLED;
        this.settledAt = LocalDateTime.now();
    }

    // 취소 — 배송 시작 전(PAID/READY/PREPARING)까지 가능
    public void cancel() {
        if (this.status != OrderStatus.PAID
                && this.status != OrderStatus.READY
                && this.status != OrderStatus.PREPARING) {
            throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS,
                    "배송 시작 전 주문만 취소할 수 있어요.");
        }
        this.status = OrderStatus.CANCELED;
        this.canceledAt = LocalDateTime.now();
    }

    // 환불 완료 처리 (에스크로 refund 후 호출)
    public void markRefunded() {
        if (this.status != OrderStatus.CANCELED) {
            throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS,
                    "취소된 주문만 환불 완료 처리할 수 있어요.");
        }
        this.status = OrderStatus.REFUNDED;
    }

    // 기존 호환용 — 다음 단계에서 제거 예정
    @Deprecated
    public void updateStatus(OrderStatus status) {
        this.status = status;
    }
}
