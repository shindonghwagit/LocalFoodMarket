package com.localfood.localfoodmarket.domain.review.controller;

import com.localfood.localfoodmarket.domain.review.dto.ReviewRequestDto;
import com.localfood.localfoodmarket.domain.review.dto.ReviewResponseDto;
import com.localfood.localfoodmarket.domain.review.service.ReviewService;
import com.localfood.localfoodmarket.global.response.ApiResponse;
import com.localfood.localfoodmarket.global.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ReviewResponseDto> createReview(
            @AuthenticationPrincipal Long userId,
            @RequestBody @Valid ReviewRequestDto request) {
        return ApiResponse.success(reviewService.createReview(userId, request), "리뷰가 등록됐어요.");
    }

    @GetMapping("/products/{productId}")
    public ApiResponse<PageResponse<ReviewResponseDto>> getReviewsByProductPath(
            @PathVariable Long productId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(PageResponse.from(reviewService.getReviews(productId, pageable)));
    }

    @GetMapping
    public ApiResponse<PageResponse<ReviewResponseDto>> getReviews(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long farmId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        if (farmId != null) {
            return ApiResponse.success(PageResponse.from(reviewService.getReviewsByFarm(farmId, pageable)));
        }
        if (productId != null) {
            return ApiResponse.success(PageResponse.from(reviewService.getReviews(productId, pageable)));
        }
        return ApiResponse.success(PageResponse.from(org.springframework.data.domain.Page.<ReviewResponseDto>empty(pageable)));
    }

    @DeleteMapping("/{reviewId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReview(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long reviewId) {
        reviewService.deleteReview(userId, reviewId);
    }
}
