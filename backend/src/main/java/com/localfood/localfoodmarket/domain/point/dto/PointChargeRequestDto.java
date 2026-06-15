package com.localfood.localfoodmarket.domain.point.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class PointChargeRequestDto {

    @NotNull(message = "충전 금액을 입력해주세요.")
    @Min(value = 1, message = "충전 금액은 1포인트 이상이어야 해요.")
    private Integer amount;
}
