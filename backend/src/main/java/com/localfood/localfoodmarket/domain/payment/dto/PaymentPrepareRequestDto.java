package com.localfood.localfoodmarket.domain.payment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class PaymentPrepareRequestDto {

    @NotNull(message = "충전 금액을 입력해주세요.")
    @Min(value = 1000, message = "최소 충전 금액은 1,000원이에요.")
    private Integer amount;
}
