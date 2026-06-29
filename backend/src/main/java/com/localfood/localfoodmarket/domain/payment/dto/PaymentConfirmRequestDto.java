package com.localfood.localfoodmarket.domain.payment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class PaymentConfirmRequestDto {

    @NotBlank(message = "결제 키가 필요해요.")
    private String paymentKey;

    @NotBlank(message = "주문 번호가 필요해요.")
    private String orderId;

    @NotNull(message = "결제 금액이 필요해요.")
    @Min(value = 1, message = "결제 금액이 올바르지 않아요.")
    private Integer amount;
}
