package com.localfood.localfoodmarket.domain.order.dto;

import com.localfood.localfoodmarket.domain.order.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class OrderStatusUpdateRequestDto {

    @NotNull(message = "변경할 주문 상태를 선택해주세요.")
    private OrderStatus status;

    // SHIPPING으로 전이할 때 송장 정보 (그 외 전이에서는 무시)
    private String courier;
    private String trackingNumber;
}
