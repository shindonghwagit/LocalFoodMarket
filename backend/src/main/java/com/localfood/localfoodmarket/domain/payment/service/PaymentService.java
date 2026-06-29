package com.localfood.localfoodmarket.domain.payment.service;

import com.localfood.localfoodmarket.domain.payment.client.TossConfirmResponse;
import com.localfood.localfoodmarket.domain.payment.client.TossPaymentClient;
import com.localfood.localfoodmarket.domain.payment.dto.PaymentResponseDto;
import com.localfood.localfoodmarket.domain.payment.entity.Payment;
import com.localfood.localfoodmarket.domain.payment.repository.PaymentRepository;
import com.localfood.localfoodmarket.domain.point.entity.PointLog;
import com.localfood.localfoodmarket.domain.point.entity.PointLogType;
import com.localfood.localfoodmarket.domain.point.repository.PointLogRepository;
import com.localfood.localfoodmarket.domain.user.entity.User;
import com.localfood.localfoodmarket.domain.user.repository.UserRepository;
import com.localfood.localfoodmarket.global.config.TossPaymentConfig;
import com.localfood.localfoodmarket.global.exception.BusinessException;
import com.localfood.localfoodmarket.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PointLogRepository pointLogRepository;
    private final TossPaymentClient tossPaymentClient;
    private final TossPaymentConfig tossConfig;
    // 토스 호출 실패를 별도 트랜잭션으로 커밋하기 위해 프록시를 통해 자기 자신을 호출한다.
    private final ObjectProvider<PaymentService> self;

    /**
     * 충전 준비 — 토스 orderId를 생성하고 PENDING 결제를 기록한 뒤 clientKey/orderId/amount를 반환.
     */
    @Transactional
    public PaymentResponseDto preparePayment(Long userId, int amount) {
        User user = findUser(userId);

        String orderId = "order_" + UUID.randomUUID().toString().replace("-", "");

        Payment payment = paymentRepository.save(Payment.builder()
                .user(user)
                .orderId(orderId)
                .amount(amount)
                .build());

        return PaymentResponseDto.forPrepare(payment, tossConfig.getClientKey());
    }

    /**
     * 결제 승인 — 위변조 검증 후 토스 /confirm을 호출하고, 성공 시 포인트를 적립한다.
     * 트랜잭션을 단계별로 분리해 토스 실패 시에도 FAILED 상태가 독립적으로 커밋되도록 한다.
     */
    public PaymentResponseDto confirmPayment(Long userId, String paymentKey, String orderId, int amount) {
        // 1~3) DB 조회 + 금액 일치 + 중복(DONE) 검증 (토스 호출 전에 차단)
        self.getObject().validateConfirmable(userId, orderId, amount);

        // 4) 토스 결제 승인 API 호출
        TossConfirmResponse tossResponse;
        try {
            tossResponse = tossPaymentClient.confirm(paymentKey, orderId, amount);
        } catch (Exception e) {
            self.getObject().markFailed(orderId);   // 실패 상태를 별도 트랜잭션으로 기록
            throw new BusinessException(ErrorCode.PAYMENT_CONFIRM_FAILED);
        }

        // 5) 승인 성공 → 결제 완료 + 포인트 적립
        return self.getObject().completeAndCredit(orderId, paymentKey, tossResponse);
    }

    @Transactional(readOnly = true)
    public void validateConfirmable(Long userId, String orderId, int amount) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));

        if (!payment.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "본인의 결제만 승인할 수 있어요.");
        }
        // 위변조 방지 — 준비 시 기록한 금액과 일치해야 한다.
        if (!payment.getAmount().equals(amount)) {
            throw new BusinessException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
        }
        if (payment.isDone()) {
            throw new BusinessException(ErrorCode.PAYMENT_ALREADY_DONE);
        }
    }

    @Transactional
    public void markFailed(String orderId) {
        paymentRepository.findByOrderId(orderId).ifPresent(Payment::fail);
    }

    @Transactional
    public PaymentResponseDto completeAndCredit(String orderId, String paymentKey, TossConfirmResponse tossResponse) {
        // 비관적 락으로 다시 읽어 동시 중복 적립을 차단
        Payment payment = paymentRepository.findByOrderIdForUpdate(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.isDone()) {
            throw new BusinessException(ErrorCode.PAYMENT_ALREADY_DONE);
        }

        LocalDateTime approvedAt = tossResponse.approvedAt() != null
                ? tossResponse.approvedAt().toLocalDateTime()
                : LocalDateTime.now();
        payment.complete(paymentKey, approvedAt);

        // 포인트 적립 + 로그 (type: CHARGE, balanceAfter 기록)
        User user = payment.getUser();
        user.chargePoint(payment.getAmount());
        pointLogRepository.save(PointLog.builder()
                .user(user)
                .amount(payment.getAmount())
                .type(PointLogType.CHARGE)
                .balanceAfter(user.getPointBalance())
                .build());

        return PaymentResponseDto.forConfirm(payment, user.getPointBalance());
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자 정보를 찾을 수 없어요."));
    }
}
