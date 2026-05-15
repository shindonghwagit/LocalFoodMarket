package com.localfood.localfoodmarket.domain.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class ProductRequestDto {

    @NotBlank(message = "상품명을 입력해주세요.")
    @Size(max = 100, message = "상품명은 100자 이하로 입력해주세요.")
    private String name;

    @NotNull(message = "가격을 입력해주세요.")
    @Min(value = 0, message = "가격은 0원 이상이어야 해요.")
    private Integer price;

    @NotNull(message = "재고를 입력해주세요.")
    @Min(value = 0, message = "재고는 0개 이상이어야 해요.")
    private Integer stock;

    @Size(max = 50, message = "카테고리는 50자 이하로 입력해주세요.")
    private String category;

    private LocalDate harvestDate;

    private String description;
}
