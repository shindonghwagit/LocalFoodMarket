package com.localfood.localfoodmarket.domain.order.dto;

import com.localfood.localfoodmarket.domain.order.entity.DeliveryMethod;
import com.localfood.localfoodmarket.domain.order.entity.EscrowStatus;
import com.localfood.localfoodmarket.domain.order.entity.Order;
import com.localfood.localfoodmarket.domain.order.entity.OrderItem;
import com.localfood.localfoodmarket.domain.order.entity.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderResponseDto {

    private final Long orderId;
    private final Long userId;
    private final Long farmId;
    private final Integer totalPrice;
    private final OrderStatus status;

    private final DeliveryMethod deliveryMethod;

    // 배송 정보
    private final String deliveryAddress;
    private final String courier;
    private final String trackingNumber;

    // 픽업 정보
    private final String pickupLocation;
    private final LocalDateTime pickupTime;

    private final String buyerNote;

    // 에스크로 상태 (HELD / RELEASED / REFUNDED) — 조회 시점에 없으면 null
    private final EscrowStatus escrowStatus;

    private final Long remainingPoint;   // 주문 직후 응답에만 포함, 이후 null
    private final List<OrderItemResponseDto> items;
    private final LocalDateTime createdAt;

    public static OrderResponseDto of(Order order, List<OrderItem> items,
                                      Long remainingPoint, EscrowStatus escrowStatus) {
        return OrderResponseDto.builder()
                .orderId(order.getId())
                .userId(order.getUser().getId())
                .farmId(order.getFarm() != null ? order.getFarm().getId() : null)
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .deliveryMethod(order.getDeliveryMethod())
                .deliveryAddress(order.getDeliveryAddress())
                .courier(order.getCourier())
                .trackingNumber(order.getTrackingNumber())
                .pickupLocation(order.getPickupLocation())
                .pickupTime(order.getPickupTime())
                .buyerNote(order.getBuyerNote())
                .escrowStatus(escrowStatus)
                .remainingPoint(remainingPoint)
                .items(items.stream().map(OrderItemResponseDto::from).toList())
                .createdAt(order.getCreatedAt())
                .build();
    }

    public static OrderResponseDto of(Order order, List<OrderItem> items, Long remainingPoint) {
        return of(order, items, remainingPoint, null);
    }

    public static OrderResponseDto of(Order order, List<OrderItem> items, EscrowStatus escrowStatus) {
        return of(order, items, null, escrowStatus);
    }

    public static OrderResponseDto of(Order order, List<OrderItem> items) {
        return of(order, items, null, null);
    }
}
