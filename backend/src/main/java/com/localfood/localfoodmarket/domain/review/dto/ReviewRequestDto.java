package com.localfood.localfoodmarket.domain.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ReviewRequestDto {

    @NotNull(message = "상품 ID를 입력해주세요.")
    private Long productId;

    @NotNull(message = "주문 ID를 입력해주세요.")
    private Long orderId;

    @NotNull(message = "평점을 입력해주세요.")
    @Min(value = 1, message = "평점은 1점 이상이어야 해요.")
    @Max(value = 5, message = "평점은 5점 이하여야 해요.")
    private Integer rating;

    private String content;
}
