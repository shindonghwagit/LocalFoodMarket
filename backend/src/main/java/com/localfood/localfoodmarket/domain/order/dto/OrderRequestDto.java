package com.localfood.localfoodmarket.domain.order.dto;

import com.localfood.localfoodmarket.domain.order.entity.DeliveryMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
public class OrderRequestDto {

    @NotNull(message = "수령 방법(픽업/배송)을 선택해주세요.")
    private DeliveryMethod deliveryMethod;

    // DELIVERY일 때 필수 — 구체 검증은 OrderService에서 deliveryMethod에 따라 수행
    private String deliveryAddress;

    // PICKUP일 때 필수
    private String pickupLocation;
    private LocalDateTime pickupTime;

    private String buyerNote;

    @NotEmpty(message = "주문할 상품을 선택해주세요.")
    @Valid
    private List<OrderItemRequestDto> items;
}
