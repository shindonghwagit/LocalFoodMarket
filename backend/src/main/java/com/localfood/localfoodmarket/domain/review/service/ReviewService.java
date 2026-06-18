package com.localfood.localfoodmarket.domain.review.service;

import com.localfood.localfoodmarket.domain.order.entity.Order;
import com.localfood.localfoodmarket.domain.order.entity.OrderStatus;
import com.localfood.localfoodmarket.domain.order.repository.OrderItemRepository;
import com.localfood.localfoodmarket.domain.order.repository.OrderRepository;
import com.localfood.localfoodmarket.domain.product.entity.Product;
import com.localfood.localfoodmarket.domain.product.repository.ProductRepository;
import com.localfood.localfoodmarket.domain.review.dto.ReviewRequestDto;
import com.localfood.localfoodmarket.domain.review.dto.ReviewResponseDto;
import com.localfood.localfoodmarket.domain.review.entity.Review;
import com.localfood.localfoodmarket.domain.review.repository.ReviewRepository;
import com.localfood.localfoodmarket.domain.user.entity.User;
import com.localfood.localfoodmarket.domain.user.repository.UserRepository;
import com.localfood.localfoodmarket.global.exception.BusinessException;
import com.localfood.localfoodmarket.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewResponseDto createReview(Long userId, ReviewRequestDto request) {
        User user = findUser(userId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

        // 1단계: 해당 주문이 본인 주문인지 확인
        Order order = orderRepository.findByIdAndUser(request.getOrderId(), user)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_REQUIRED));

        // 2단계: 주문에 해당 상품이 포함돼 있는지 확인
        boolean productInOrder = orderItemRepository.findByOrder(order).stream()
                .anyMatch(item -> item.getProduct().getId().equals(product.getId()));

        if (!productInOrder) {
            throw new BusinessException(ErrorCode.ORDER_REQUIRED);
        }

        // 3단계: 수령확인된 주문만 리뷰 가능 (CONFIRMED 또는 SETTLED)
        if (order.getStatus() != OrderStatus.CONFIRMED && order.getStatus() != OrderStatus.SETTLED) {
            throw new BusinessException(ErrorCode.ORDER_NOT_DONE);
        }

        // 4단계: 중복 리뷰 확인
        if (reviewRepository.existsByOrderAndProduct(order, product)) {
            throw new BusinessException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        Review review = reviewRepository.save(Review.builder()
                .user(user)
                .product(product)
                .order(order)
                .rating(request.getRating())
                .content(request.getContent())
                .build());

        return ReviewResponseDto.from(review);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponseDto> getReviews(Long productId, Pageable pageable) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

        return reviewRepository.findByProduct(product, pageable)
                .map(ReviewResponseDto::from);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponseDto> getReviewsByFarm(Long farmId, Pageable pageable) {
        return reviewRepository.findByFarmId(farmId, pageable)
                .map(ReviewResponseDto::from);
    }

    @Transactional
    public void deleteReview(Long userId, Long reviewId) {
        User user = findUser(userId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new BusinessException(ErrorCode.REVIEW_NOT_FOUND));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.REVIEW_FORBIDDEN);
        }

        reviewRepository.delete(review);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자 정보를 찾을 수 없어요."));
    }
}
