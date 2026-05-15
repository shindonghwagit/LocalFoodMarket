package com.localfood.localfoodmarket.domain.point.service;

import com.localfood.localfoodmarket.domain.point.dto.PointChargeRequestDto;
import com.localfood.localfoodmarket.domain.point.dto.PointLogResponseDto;
import com.localfood.localfoodmarket.domain.point.entity.PointLog;
import com.localfood.localfoodmarket.domain.point.entity.PointType;
import com.localfood.localfoodmarket.domain.point.repository.PointLogRepository;
import com.localfood.localfoodmarket.domain.user.entity.Role;
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
    public Page<PointLogResponseDto> getLogs(Long userId, PointType type, Pageable pageable) {
        User user = findUser(userId);

        Page<PointLog> logs = (type == null)
                ? pointLogRepository.findByUser(user, pageable)
                : pointLogRepository.findByUserAndType(user, type, pageable);

        return logs.map(PointLogResponseDto::from);
    }

    @Transactional
    public PointLogResponseDto chargePoint(Long adminUserId, PointChargeRequestDto request) {
        User admin = findUser(adminUserId);

        if (admin.getRole() != Role.ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "관리자만 포인트를 충전할 수 있어요.");
        }

        User target = userRepository.findById(request.getTargetUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "대상 사용자를 찾을 수 없어요."));

        target.chargePoint(request.getAmount());

        PointLog log = pointLogRepository.save(PointLog.builder()
                .user(target)
                .amount(request.getAmount())
                .type(PointType.CHARGE)
                .build());

        return PointLogResponseDto.from(log);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자 정보를 찾을 수 없어요."));
    }
}
