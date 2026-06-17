package com.localfood.localfoodmarket.domain.user.controller;

import com.localfood.localfoodmarket.domain.user.dto.UserResponseDto;
import com.localfood.localfoodmarket.domain.user.entity.User;
import com.localfood.localfoodmarket.domain.user.repository.UserRepository;
import com.localfood.localfoodmarket.global.exception.BusinessException;
import com.localfood.localfoodmarket.global.exception.ErrorCode;
import com.localfood.localfoodmarket.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ApiResponse<UserResponseDto> getMe(@AuthenticationPrincipal Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자 정보를 찾을 수 없어요."));
        return ApiResponse.success(UserResponseDto.from(user));
    }
}
