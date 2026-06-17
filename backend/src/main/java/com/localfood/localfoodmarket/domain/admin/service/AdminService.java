package com.localfood.localfoodmarket.domain.admin.service;

import com.localfood.localfoodmarket.domain.admin.dto.AdminPostResponseDto;
import com.localfood.localfoodmarket.domain.admin.dto.AdminStatsResponseDto;
import com.localfood.localfoodmarket.domain.admin.dto.FarmStatusUpdateRequestDto;
import com.localfood.localfoodmarket.domain.admin.dto.UserRoleUpdateRequestDto;
import com.localfood.localfoodmarket.domain.farm.dto.FarmResponseDto;
import com.localfood.localfoodmarket.domain.farm.entity.Farm;
import com.localfood.localfoodmarket.domain.farm.entity.FarmStatus;
import com.localfood.localfoodmarket.domain.farm.repository.FarmRepository;
import com.localfood.localfoodmarket.domain.order.repository.OrderRepository;
import com.localfood.localfoodmarket.domain.post.entity.Post;
import com.localfood.localfoodmarket.domain.post.repository.PostRepository;
import com.localfood.localfoodmarket.domain.user.dto.UserResponseDto;
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

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final FarmRepository farmRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final PostRepository postRepository;

    @Transactional(readOnly = true)
    public Page<FarmResponseDto> getFarms(FarmStatus status, Pageable pageable) {
        Page<Farm> farms = (status == null)
                ? farmRepository.findAll(pageable)
                : farmRepository.findByStatus(status, pageable);
        return farms.map(FarmResponseDto::from);
    }

    @Transactional
    public FarmResponseDto updateFarmStatus(Long farmId, FarmStatusUpdateRequestDto request) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FARM_NOT_FOUND));

        if (request.getStatus() == FarmStatus.APPROVED) {
            farm.approve();
        } else if (request.getStatus() == FarmStatus.REJECTED) {
            farm.reject();
        } else {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "APPROVED 또는 REJECTED 상태만 설정할 수 있어요.");
        }

        return FarmResponseDto.from(farm);
    }

    @Transactional(readOnly = true)
    public Page<UserResponseDto> getUsers(String keyword, Pageable pageable) {
        Page<User> users = (keyword == null || keyword.isBlank())
                ? userRepository.findAll(pageable)
                : userRepository.findByEmailContainingIgnoreCase(keyword.trim(), pageable);
        return users.map(UserResponseDto::from);
    }

    @Transactional(readOnly = true)
    public Page<AdminPostResponseDto> getPosts(Pageable pageable) {
        return postRepository.findAllForAdmin(pageable).map(AdminPostResponseDto::from);
    }

    @Transactional
    public void suspendUser(Long targetUserId) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자 정보를 찾을 수 없어요."));
        if (user.getRole() == Role.ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "관리자 계정은 정지할 수 없어요.");
        }
        user.suspend();
    }

    @Transactional
    public UserResponseDto updateUserRole(Long targetUserId, UserRoleUpdateRequestDto request) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자 정보를 찾을 수 없어요."));

        user.updateRole(request.getRole());
        return UserResponseDto.from(user);
    }

    @Transactional
    public void blindPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
        post.blind();
    }

    @Transactional(readOnly = true)
    public AdminStatsResponseDto getStats() {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();

        return AdminStatsResponseDto.builder()
                .totalFarms(farmRepository.count())
                .pendingFarms(farmRepository.countByStatus(FarmStatus.PENDING))
                .totalUsers(userRepository.count())
                .reportedPosts(postRepository.countByReportCountGreaterThan(0))
                .todaySignups(userRepository.countByCreatedAtAfter(startOfToday))
                .todayOrders(orderRepository.countByCreatedAtAfter(startOfToday))
                .todayRevenue(orderRepository.sumTotalPriceSince(startOfToday))
                .todayPosts(postRepository.countByCreatedAtAfter(startOfToday))
                .build();
    }

    private void checkAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자 정보를 찾을 수 없어요."));
        if (user.getRole() != Role.ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "관리자만 접근할 수 있어요.");
        }
    }
}
