package com.localfood.localfoodmarket.domain.point.entity;

public enum PointLogType {
    CHARGE,   // 충전 — balance +
    HOLD,     // 주문 결제(잠금) — balance -, escrow로 이동
    RELEASE,  // 농가 정산 — 농가 balance + (수령확인 후)
    REFUND    // 주문 취소·환불 — 구매자 balance + (복원)
}
