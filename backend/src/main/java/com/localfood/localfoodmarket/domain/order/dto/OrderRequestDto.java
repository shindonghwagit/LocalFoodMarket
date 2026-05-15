package com.localfood.localfoodmarket.domain.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;

import java.util.List;

@Getter
public class OrderRequestDto {

    @NotBlank(message = "배송지 주소를 입력해주세요.")
    private String deliveryAddress;

    @NotEmpty(message = "주문할 상품을 선택해주세요.")
    @Valid
    private List<OrderItemRequestDto> items;
}
