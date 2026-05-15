package com.localfood.localfoodmarket.domain.review.dto;

import com.localfood.localfoodmarket.domain.review.entity.Review;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReviewResponseDto {

    private final Long id;
    private final Long productId;
    private final String authorName;   // 이메일 마스킹 처리
    private final Integer rating;
    private final String content;
    private final LocalDateTime createdAt;

    public static ReviewResponseDto from(Review review) {
        return ReviewResponseDto.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .authorName(maskEmail(review.getUser().getEmail()))
                .rating(review.getRating())
                .content(review.getContent())
                .createdAt(review.getCreatedAt())
                .build();
    }

    // "user@example.com" → "us**@example.com"
    private static String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 2) {
            return email.charAt(0) + "**" + email.substring(atIndex);
        }
        return email.substring(0, 2) + "**" + email.substring(atIndex);
    }
}
