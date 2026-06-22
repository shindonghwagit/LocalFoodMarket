package com.localfood.localfoodmarket.domain.point.service;

import com.localfood.localfoodmarket.domain.order.entity.Order;
import com.localfood.localfoodmarket.domain.point.dto.PointBalanceResponseDto;
import com.localfood.localfoodmarket.domain.point.dto.PointChargeRequestDto;
import com.localfood.localfoodmarket.domain.point.dto.PointLogResponseDto;
import com.localfood.localfoodmarket.domain.point.entity.PointLog;
import com.localfood.localfoodmarket.domain.point.entity.PointLogType;
import com.localfood.localfoodmarket.domain.point.repository.PointLogRepository;
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
public class PointService {

    private final PointLogRepository pointLogRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public long getBalance(Long userId) {
        return findUser(userId).getPointBalance();
    }

    @Transactional(readOnly = true)
    public Page<PointLogResponseDto> getLogs(Long userId, PointLogType type, Pageable pageable) {
        User user = findUser(userId);

        Page<PointLog> logs = (type == null)
                ? pointLogRepository.findByUser(user, pageable)
                : pointLogRepository.findByUserAndType(user, type, pageable);

        return logs.map(PointLogResponseDto::from);
    }

    @Transactional
    public PointBalanceResponseDto chargePoint(Long userId, PointChargeRequestDto request) {
        User user = findUser(userId);

        user.chargePoint(request.getAmount());

        pointLogRepository.save(PointLog.builder()
                .user(user)
                .amount(request.getAmount())
                .type(PointLogType.CHARGE)
                .balanceAfter(user.getPointBalance())
                .build());

        return PointBalanceResponseDto.builder()
                .pointBalance(user.getPointBalance())
                .build();
    }

    /**
     * 결제 잠금(HOLD) — 구매자 포인트를 차감하고 에스크로로 이동.
     * 호출자(OrderService)의 트랜잭션에 참여한다(REQUIRED).
     */
    @Transactional
    public void hold(User buyer, Order order, int amount) {
        if (buyer.getPointBalance() < amount) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_POINT);
        }
        buyer.deductPoint(amount);
        pointLogRepository.save(PointLog.builder()
                .user(buyer)
                .order(order)
                .amount(amount)
                .type(PointLogType.HOLD)
                .balanceAfter(buyer.getPointBalance())
                .build());
    }

    /**
     * 정산(RELEASE) — 수령확인 후 농가에게 에스크로 금액 지급.
     */
    @Transactional
    public void release(User farmOwner, Order order, int amount) {
        farmOwner.chargePoint(amount);
        pointLogRepository.save(PointLog.builder()
                .user(farmOwner)
                .order(order)
                .amount(amount)
                .type(PointLogType.RELEASE)
                .balanceAfter(farmOwner.getPointBalance())
                .build());
    }

    /**
     * 환불(REFUND) — 주문 취소 시 구매자에게 에스크로 금액 복원.
     */
    @Transactional
    public void refund(User buyer, Order order, int amount) {
        buyer.chargePoint(amount);
        pointLogRepository.save(PointLog.builder()
                .user(buyer)
                .order(order)
                .amount(amount)
                .type(PointLogType.REFUND)
                .balanceAfter(buyer.getPointBalance())
                .build());
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자 정보를 찾을 수 없어요."));
    }
}
