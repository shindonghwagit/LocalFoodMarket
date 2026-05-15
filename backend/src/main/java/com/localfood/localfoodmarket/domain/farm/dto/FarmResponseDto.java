package com.localfood.localfoodmarket.domain.farm.dto;

import com.localfood.localfoodmarket.domain.farm.entity.Farm;
import com.localfood.localfoodmarket.domain.farm.entity.FarmStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class FarmResponseDto {

    private final Long id;
    private final Long userId;
    private final String userEmail;
    private final String name;
    private final String region;
    private final String category;
    private final String certification;
    private final FarmStatus status;
    private final String description;
    private final LocalDateTime createdAt;

    public static FarmResponseDto from(Farm farm) {
        return FarmResponseDto.builder()
                .id(farm.getId())
                .userId(farm.getUser().getId())
                .userEmail(farm.getUser().getEmail())
                .name(farm.getName())
                .region(farm.getRegion())
                .category(farm.getCategory())
                .certification(farm.getCertification())
                .status(farm.getStatus())
                .description(farm.getDescription())
                .createdAt(farm.getCreatedAt())
                .build();
    }
}
