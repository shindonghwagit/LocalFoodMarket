package com.localfood.localfoodmarket.domain.payment.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.localfood.localfoodmarket.domain.payment.entity.Payment;
import com.localfood.localfoodmarket.domain.payment.entity.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentResponseDto {

    private final Long paymentId;
    private final String orderId;
    private final Integer amount;
    private final PaymentStatus status;

    // 준비(prepare) 응답 — 프론트 토스 SDK 초기화용 (clientKey만, secretKey는 절대 미포함)
    private final String clientKey;

    // 승인(confirm) 응답
    private final String paymentKey;
    private final LocalDateTime approvedAt;
    private final Long pointBalance;   // 충전 후 잔액

    public static PaymentResponseDto forPrepare(Payment payment, String clientKey) {
        return PaymentResponseDto.builder()
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .clientKey(clientKey)
                .build();
    }

    public static PaymentResponseDto forConfirm(Payment payment, long pointBalance) {
        return PaymentResponseDto.builder()
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .paymentKey(payment.getPaymentKey())
                .approvedAt(payment.getApprovedAt())
                .pointBalance(pointBalance)
                .build();
    }
}
