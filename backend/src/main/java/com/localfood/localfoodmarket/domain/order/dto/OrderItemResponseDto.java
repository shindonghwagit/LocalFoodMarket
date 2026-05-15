package com.localfood.localfoodmarket.domain.order.dto;

import com.localfood.localfoodmarket.domain.order.entity.OrderItem;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderItemResponseDto {

    private final Long productId;
    private final String productName;
    private final Integer quantity;
    private final Integer priceAtOrder;

    public static OrderItemResponseDto from(OrderItem item) {
        return OrderItemResponseDto.builder()
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .quantity(item.getQuantity())
                .priceAtOrder(item.getPriceAtOrder())
                .build();
    }
}
