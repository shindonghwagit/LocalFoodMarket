package com.localfood.localfoodmarket.domain.admin.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminStatsResponseDto {

    private final long userCount;
    private final long farmCount;
    private final long todayOrderCount;
}
