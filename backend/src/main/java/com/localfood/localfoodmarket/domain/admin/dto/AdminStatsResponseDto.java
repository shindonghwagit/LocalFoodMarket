package com.localfood.localfoodmarket.domain.admin.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminStatsResponseDto {

    private final long totalFarms;
    private final long pendingFarms;
    private final long totalUsers;
    private final long reportedPosts;
    private final long todaySignups;
    private final long todayOrders;
    private final long todayRevenue;
    private final long todayPosts;
}
