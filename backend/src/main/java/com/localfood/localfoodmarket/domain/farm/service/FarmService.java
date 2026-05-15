package com.localfood.localfoodmarket.domain.farm.service;

import com.localfood.localfoodmarket.domain.farm.dto.FarmRegisterRequestDto;
import com.localfood.localfoodmarket.domain.farm.dto.FarmResponseDto;
import com.localfood.localfoodmarket.domain.farm.dto.FarmUpdateRequestDto;
import com.localfood.localfoodmarket.domain.farm.entity.Farm;
import com.localfood.localfoodmarket.domain.farm.entity.FarmStatus;
import com.localfood.localfoodmarket.domain.farm.repository.FarmRepository;
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
public class FarmService {

    private final FarmRepository farmRepository;
    private final UserRepository userRepository;

    @Transactional
    public FarmResponseDto registerFarm(Long userId, FarmRegisterRequestDto request) {
        User user = findUser(userId);

        if (user.getRole() != Role.FARMER) {
            throw new BusinessException(ErrorCode.FORBIDDEN,
                    "농가 등록은 FARMER 계정만 가능해요.");
        }

        if (farmRepository.existsByUser(user)) {
            throw new BusinessException(ErrorCode.FARM_ALREADY_EXISTS);
        }

        Farm farm = Farm.builder()
                .user(user)
                .name(request.getFarmName())
                .region(request.getRegion())
                .category(request.getCategory())
                .certification(request.getCertification())
                .description(request.getDescription())
                .build();

        return FarmResponseDto.from(farmRepository.save(farm));
    }

    @Transactional(readOnly = true)
    public FarmResponseDto getMyFarm(Long userId) {
        User user = findUser(userId);
        Farm farm = farmRepository.findByUser(user)
                .orElseThrow(() -> new BusinessException(ErrorCode.FARM_NOT_FOUND));
        return FarmResponseDto.from(farm);
    }

    @Transactional
    public FarmResponseDto updateMyFarm(Long userId, FarmUpdateRequestDto request) {
        User user = findUser(userId);
        Farm farm = farmRepository.findByUser(user)
                .orElseThrow(() -> new BusinessException(ErrorCode.FARM_NOT_FOUND));

        farm.update(
                request.getFarmName(),
                request.getRegion(),
                request.getCategory(),
                request.getCertification(),
                request.getDescription()
        );

        return FarmResponseDto.from(farm);
    }

    @Transactional(readOnly = true)
    public Page<FarmResponseDto> getFarms(String category, String certification,
                                          String keyword, Pageable pageable) {
        return farmRepository
                .findByFilter(FarmStatus.APPROVED, category, certification, keyword, pageable)
                .map(FarmResponseDto::from);
    }

    @Transactional(readOnly = true)
    public FarmResponseDto getFarmById(Long farmId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FARM_NOT_FOUND));
        return FarmResponseDto.from(farm);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "사용자 정보를 찾을 수 없어요."));
    }
}
