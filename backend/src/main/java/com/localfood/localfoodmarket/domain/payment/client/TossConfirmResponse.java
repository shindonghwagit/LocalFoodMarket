package com.localfood.localfoodmarket.domain.payment.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.OffsetDateTime;

/** 토스페이먼츠 /confirm 응답 중 우리가 사용하는 필드만 매핑 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record TossConfirmResponse(
        String paymentKey,
        String orderId,
        String status,
        Integer totalAmount,
        OffsetDateTime approvedAt
) {
}
