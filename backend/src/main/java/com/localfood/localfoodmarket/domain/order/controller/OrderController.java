package com.localfood.localfoodmarket.domain.order.controller;

import com.localfood.localfoodmarket.domain.order.dto.OrderRequestDto;
import com.localfood.localfoodmarket.domain.order.dto.OrderResponseDto;
import com.localfood.localfoodmarket.domain.order.dto.OrderStatusUpdateRequestDto;
import com.localfood.localfoodmarket.domain.order.service.OrderService;
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
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<OrderResponseDto> createOrder(
            @AuthenticationPrincipal Long userId,
            @RequestBody @Valid OrderRequestDto request) {
        return ApiResponse.success(orderService.createOrder(userId, request), "주문이 완료됐어요.");
    }

    @GetMapping
    public ApiResponse<PageResponse<OrderResponseDto>> getOrders(
            @AuthenticationPrincipal Long userId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(PageResponse.from(orderService.getOrders(userId, pageable)));
    }

    @GetMapping("/{orderId}")
    public ApiResponse<OrderResponseDto> getOrder(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long orderId) {
        return ApiResponse.success(orderService.getOrder(userId, orderId));
    }

    // 농가: 주문 상태 진행 (READY / PREPARING / SHIPPING / DELIVERED)
    @PatchMapping("/{orderId}/status")
    public ApiResponse<OrderResponseDto> updateStatus(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long orderId,
            @RequestBody @Valid OrderStatusUpdateRequestDto request) {
        return ApiResponse.success(orderService.updateOrderStatus(userId, orderId, request), "주문 상태가 변경됐어요.");
    }

    // 구매자: 수령 확인 → 정산
    @PatchMapping("/{orderId}/confirm")
    public ApiResponse<OrderResponseDto> confirm(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long orderId) {
        return ApiResponse.success(orderService.confirmOrder(userId, orderId),
                "수령이 확인됐어요. 거래가 완료됐습니다.");
    }

    // 구매자 또는 농가: 주문 취소 → 환불
    @PatchMapping("/{orderId}/cancel")
    public ApiResponse<OrderResponseDto> cancel(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long orderId) {
        return ApiResponse.success(orderService.cancelOrder(userId, orderId),
                "주문이 취소됐어요. 포인트가 환불됐습니다.");
    }
}
