package com.localfood.localfoodmarket.domain.payment.entity;

public enum PaymentStatus {
    PENDING,   // 결제 준비 (토스 승인 전)
    DONE,      // 결제 승인 완료 → 포인트 적립됨
    FAILED,    // 토스 승인 실패
    CANCELED   // 결제 취소
}
