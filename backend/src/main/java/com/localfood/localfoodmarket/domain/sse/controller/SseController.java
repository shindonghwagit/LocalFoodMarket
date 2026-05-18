package com.localfood.localfoodmarket.domain.sse.controller;

import com.localfood.localfoodmarket.domain.farm.entity.Farm;
import com.localfood.localfoodmarket.domain.farm.repository.FarmRepository;
import com.localfood.localfoodmarket.domain.user.entity.Role;
import com.localfood.localfoodmarket.domain.user.entity.User;
import com.localfood.localfoodmarket.domain.user.repository.UserRepository;
import com.localfood.localfoodmarket.global.exception.BusinessException;
import com.localfood.localfoodmarket.global.exception.ErrorCode;
import com.localfood.localfoodmarket.global.sse.SseEmitterManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

@RestController
@RequestMapping("/sse")
@RequiredArgsConstructor
public class SseController {

    private final SseEmitterManager sseEmitterManager;
    private final UserRepository userRepository;
    private final FarmRepository farmRepository;

    @GetMapping(value = "/farm", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeFarmOrders(@AuthenticationPrincipal Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자 정보를 찾을 수 없어요."));

        if (user.getRole() != Role.FARMER) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "농가만 주문 알림을 받을 수 있어요.");
        }

        Farm farm = farmRepository.findByUser(user)
                .orElseThrow(() -> new BusinessException(ErrorCode.FARM_NOT_FOUND));

        SseEmitter emitter = sseEmitterManager.createFarmEmitter(farm.getId());

        try {
            emitter.send(SseEmitter.event().name("connected").data("연결되었습니다."));
        } catch (IOException ignored) {
            // 초기 connected 이벤트 전송 실패 시 무시 — 이미 onTimeout/onCompletion으로 정리됨
        }

        return emitter;
    }

    @GetMapping(value = "/products/{productId}/stock", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeProductStock(@PathVariable Long productId) {
        return sseEmitterManager.createProductEmitter(productId);
    }
}
