package com.localfood.localfoodmarket.domain.point.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PointBalanceResponseDto {
    private final Long pointBalance;
}
