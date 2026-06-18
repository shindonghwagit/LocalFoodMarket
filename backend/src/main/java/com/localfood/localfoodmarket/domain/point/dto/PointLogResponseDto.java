package com.localfood.localfoodmarket.domain.point.dto;

import com.localfood.localfoodmarket.domain.point.entity.PointLog;
import com.localfood.localfoodmarket.domain.point.entity.PointLogType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PointLogResponseDto {

    private final Long id;
    private final Integer amount;
    private final PointLogType type;
    private final LocalDateTime createdAt;

    public static PointLogResponseDto from(PointLog log) {
        return PointLogResponseDto.builder()
                .id(log.getId())
                .amount(log.getAmount())
                .type(log.getType())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
