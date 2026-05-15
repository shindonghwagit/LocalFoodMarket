package com.localfood.localfoodmarket.domain.order.dto;

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
    private final Integer totalPrice;
    private final OrderStatus status;
    private final String deliveryAddress;
    private final Long remainingPoint;   // 주문 직후 응답에만 포함, 이후 null
    private final List<OrderItemResponseDto> items;
    private final LocalDateTime createdAt;

    public static OrderResponseDto of(Order order, List<OrderItem> items, Long remainingPoint) {
        return OrderResponseDto.builder()
                .orderId(order.getId())
                .userId(order.getUser().getId())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .deliveryAddress(order.getDeliveryAddress())
                .remainingPoint(remainingPoint)
                .items(items.stream().map(OrderItemResponseDto::from).toList())
                .createdAt(order.getCreatedAt())
                .build();
    }

    public static OrderResponseDto of(Order order, List<OrderItem> items) {
        return of(order, items, null);
    }
}
