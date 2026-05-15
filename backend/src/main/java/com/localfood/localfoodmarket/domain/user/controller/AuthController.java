package com.localfood.localfoodmarket.domain.user.controller;

import com.localfood.localfoodmarket.domain.user.dto.AuthResponseDto;
import com.localfood.localfoodmarket.domain.user.dto.LoginRequestDto;
import com.localfood.localfoodmarket.domain.user.dto.RegisterRequestDto;
import com.localfood.localfoodmarket.domain.user.service.AuthService;
import com.localfood.localfoodmarket.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AuthResponseDto> register(@RequestBody @Valid RegisterRequestDto request) {
        return ApiResponse.success(authService.register(request), "회원가입이 완료됐어요.");
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponseDto> login(@RequestBody @Valid LoginRequestDto request) {
        return ApiResponse.success(authService.login(request), "로그인됐어요.");
    }
}
