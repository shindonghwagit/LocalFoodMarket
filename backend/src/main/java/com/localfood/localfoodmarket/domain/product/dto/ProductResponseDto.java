package com.localfood.localfoodmarket.domain.product.dto;

import com.localfood.localfoodmarket.domain.product.entity.Product;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class ProductResponseDto {

    private final Long id;
    private final Long farmId;
    private final String farmName;
    private final String name;
    private final Integer price;
    private final Integer stock;
    private final String category;
    private final LocalDate harvestDate;
    private final String description;
    private final LocalDateTime createdAt;

    public static ProductResponseDto from(Product product) {
        return ProductResponseDto.builder()
                .id(product.getId())
                .farmId(product.getFarm().getId())
                .farmName(product.getFarm().getName())
                .name(product.getName())
                .price(product.getPrice())
                .stock(product.getStock())
                .category(product.getCategory())
                .harvestDate(product.getHarvestDate())
                .description(product.getDescription())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
