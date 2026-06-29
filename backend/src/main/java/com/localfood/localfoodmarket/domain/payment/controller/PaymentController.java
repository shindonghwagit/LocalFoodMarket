package com.localfood.localfoodmarket.domain.payment.controller;

import com.localfood.localfoodmarket.domain.payment.dto.PaymentConfirmRequestDto;
import com.localfood.localfoodmarket.domain.payment.dto.PaymentPrepareRequestDto;
import com.localfood.localfoodmarket.domain.payment.dto.PaymentResponseDto;
import com.localfood.localfoodmarket.domain.payment.service.PaymentService;
import com.localfood.localfoodmarket.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // 충전 준비 — 토스 결제창 호출용 orderId/clientKey 발급
    @PostMapping("/prepare")
    public ApiResponse<PaymentResponseDto> prepare(
            @AuthenticationPrincipal Long userId,
            @RequestBody @Valid PaymentPrepareRequestDto request) {
        return ApiResponse.success(
                paymentService.preparePayment(userId, request.getAmount()),
                "결제 준비가 완료됐어요.");
    }

    // 결제 승인 — 토스 검증 후 포인트 적립
    @PostMapping("/confirm")
    public ApiResponse<PaymentResponseDto> confirm(
            @AuthenticationPrincipal Long userId,
            @RequestBody @Valid PaymentConfirmRequestDto request) {
        return ApiResponse.success(
                paymentService.confirmPayment(userId, request.getPaymentKey(),
                        request.getOrderId(), request.getAmount()),
                "포인트가 충전됐어요.");
    }
}
