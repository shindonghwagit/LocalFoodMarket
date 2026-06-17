package com.localfood.localfoodmarket.domain.admin.controller;

import com.localfood.localfoodmarket.domain.admin.dto.AdminPostResponseDto;
import com.localfood.localfoodmarket.domain.admin.dto.AdminStatsResponseDto;
import com.localfood.localfoodmarket.domain.admin.dto.FarmStatusUpdateRequestDto;
import com.localfood.localfoodmarket.domain.admin.dto.UserRoleUpdateRequestDto;
import com.localfood.localfoodmarket.domain.admin.service.AdminService;
import com.localfood.localfoodmarket.domain.farm.dto.FarmResponseDto;
import com.localfood.localfoodmarket.domain.farm.entity.FarmStatus;
import com.localfood.localfoodmarket.domain.user.dto.UserResponseDto;
import com.localfood.localfoodmarket.global.response.ApiResponse;
import com.localfood.localfoodmarket.global.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public ApiResponse<PageResponse<FarmResponseDto>> getFarms(
            @RequestParam(required = false) FarmStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(PageResponse.from(adminService.getFarms(status, pageable)));
    }

    @PatchMapping("/farms/{farmId}/status")
    public ApiResponse<FarmResponseDto> updateFarmStatus(
            @PathVariable Long farmId,
            @RequestBody @Valid FarmStatusUpdateRequestDto request) {
        return ApiResponse.success(adminService.updateFarmStatus(farmId, request),
                request.getStatus() == FarmStatus.APPROVED ? "농가가 승인됐어요." : "농가가 반려됐어요.");
    }

    @GetMapping("/users")
    public ApiResponse<PageResponse<UserResponseDto>> getUsers(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(PageResponse.from(adminService.getUsers(keyword, pageable)));
    }

    @PatchMapping("/users/{userId}/role")
    public ApiResponse<UserResponseDto> updateUserRole(
            @PathVariable Long userId,
            @RequestBody @Valid UserRoleUpdateRequestDto request) {
        return ApiResponse.success(adminService.updateUserRole(userId, request), "사용자 권한이 변경됐어요.");
    }

    @PatchMapping("/users/{userId}/suspend")
    public ApiResponse<Void> suspendUser(@PathVariable Long userId) {
        adminService.suspendUser(userId);
        return ApiResponse.<Void>success(null, "사용자 계정이 정지됐어요.");
    }

    @GetMapping("/posts")
    public ApiResponse<PageResponse<AdminPostResponseDto>> getPosts(
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success(PageResponse.from(adminService.getPosts(pageable)));
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
