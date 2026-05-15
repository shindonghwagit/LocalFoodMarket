package com.localfood.localfoodmarket.domain.farm.controller;

import com.localfood.localfoodmarket.domain.farm.dto.FarmRegisterRequestDto;
import com.localfood.localfoodmarket.domain.farm.dto.FarmResponseDto;
import com.localfood.localfoodmarket.domain.farm.dto.FarmUpdateRequestDto;
import com.localfood.localfoodmarket.domain.farm.service.FarmService;
import com.localfood.localfoodmarket.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/farms")
@RequiredArgsConstructor
public class FarmController {

    private final FarmService farmService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FarmResponseDto> register(
            @AuthenticationPrincipal Long userId,
            @RequestBody @Valid FarmRegisterRequestDto request) {
        return ApiResponse.success(farmService.registerFarm(userId, request), "농가 등록이 완료됐어요. 관리자 승인 후 이용 가능해요.");
    }

    @GetMapping
    public ApiResponse<Page<FarmResponseDto>> getFarms(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String certification,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(farmService.getFarms(category, certification, keyword, pageable));
    }

    @GetMapping("/{farmId}")
    public ApiResponse<FarmResponseDto> getFarm(@PathVariable Long farmId) {
        return ApiResponse.success(farmService.getFarmById(farmId));
    }

    @PatchMapping("/me")
    public ApiResponse<FarmResponseDto> updateMyFarm(
            @AuthenticationPrincipal Long userId,
            @RequestBody @Valid FarmUpdateRequestDto request) {
        return ApiResponse.success(farmService.updateMyFarm(userId, request), "농가 정보가 수정됐어요.");
    }
}
