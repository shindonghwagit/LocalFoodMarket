package com.localfood.localfoodmarket.domain.admin.controller;

import com.localfood.localfoodmarket.domain.admin.dto.AdminStatsResponseDto;
import com.localfood.localfoodmarket.domain.admin.dto.FarmStatusUpdateRequestDto;
import com.localfood.localfoodmarket.domain.admin.dto.UserRoleUpdateRequestDto;
import com.localfood.localfoodmarket.domain.admin.service.AdminService;
import com.localfood.localfoodmarket.domain.farm.dto.FarmResponseDto;
import com.localfood.localfoodmarket.domain.farm.entity.FarmStatus;
import com.localfood.localfoodmarket.domain.user.dto.UserResponseDto;
import com.localfood.localfoodmarket.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/farms")
    public ApiResponse<Page<FarmResponseDto>> getFarms(
            @RequestParam(required = false) FarmStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(adminService.getFarms(status, pageable));
    }

    @PatchMapping("/farms/{farmId}/status")
    public ApiResponse<FarmResponseDto> updateFarmStatus(
            @PathVariable Long farmId,
            @RequestBody @Valid FarmStatusUpdateRequestDto request) {
        return ApiResponse.success(adminService.updateFarmStatus(farmId, request),
                request.getStatus() == FarmStatus.APPROVED ? "농가가 승인됐어요." : "농가가 반려됐어요.");
    }

    @GetMapping("/users")
    public ApiResponse<Page<UserResponseDto>> getUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(adminService.getUsers(pageable));
    }

    @PatchMapping("/users/{userId}/role")
    public ApiResponse<UserResponseDto> updateUserRole(
            @PathVariable Long userId,
            @RequestBody @Valid UserRoleUpdateRequestDto request) {
        return ApiResponse.success(adminService.updateUserRole(userId, request), "사용자 권한이 변경됐어요.");
    }

    @DeleteMapping("/posts/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void blindPost(@PathVariable Long postId) {
        adminService.blindPost(postId);
    }

    @GetMapping("/stats")
    public ApiResponse<AdminStatsResponseDto> getStats() {
        return ApiResponse.success(adminService.getStats());
    }
}
