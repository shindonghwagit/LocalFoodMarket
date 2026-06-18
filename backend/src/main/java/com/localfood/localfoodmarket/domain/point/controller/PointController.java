package com.localfood.localfoodmarket.domain.point.controller;

import com.localfood.localfoodmarket.domain.point.dto.PointBalanceResponseDto;
import com.localfood.localfoodmarket.domain.point.dto.PointChargeRequestDto;
import com.localfood.localfoodmarket.domain.point.dto.PointLogResponseDto;
import com.localfood.localfoodmarket.domain.point.entity.PointLogType;
import com.localfood.localfoodmarket.domain.point.service.PointService;
import com.localfood.localfoodmarket.global.response.ApiResponse;
import com.localfood.localfoodmarket.global.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/points")
@RequiredArgsConstructor
public class PointController {

    private final PointService pointService;

    @GetMapping("/balance")
    public ApiResponse<Map<String, Long>> getBalance(@AuthenticationPrincipal Long userId) {
        return ApiResponse.success(Map.of("balance", pointService.getBalance(userId)));
    }

    @GetMapping("/logs")
    public ApiResponse<PageResponse<PointLogResponseDto>> getLogs(
            @AuthenticationPrincipal Long userId,
            @RequestParam(required = false) PointLogType type,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(PageResponse.from(pointService.getLogs(userId, type, pageable)));
    }

    @PostMapping("/charge")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PointBalanceResponseDto> charge(
            @AuthenticationPrincipal Long userId,
            @RequestBody @Valid PointChargeRequestDto request) {
        return ApiResponse.success(pointService.chargePoint(userId, request), "포인트가 충전됐어요.");
    }
}
