package com.localfood.localfoodmarket.domain.point.service;

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
                .build());

        return PointBalanceResponseDto.builder()
                .pointBalance(user.getPointBalance())
                .build();
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자 정보를 찾을 수 없어요."));
    }
}
