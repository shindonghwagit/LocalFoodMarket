package com.localfood.localfoodmarket.global.sse;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Component
public class SseEmitterManager {

    private static final long TIMEOUT = 30_000L;

    private final Map<Long, SseEmitter> farmEmitters = new ConcurrentHashMap<>();
    private final Map<Long, CopyOnWriteArrayList<SseEmitter>> productEmitters = new ConcurrentHashMap<>();

    public SseEmitter addEmitter(Long farmId, SseEmitter emitter) {
        farmEmitters.put(farmId, emitter);
        emitter.onCompletion(() -> removeEmitter(farmId));
        emitter.onTimeout(() -> removeEmitter(farmId));
        return emitter;
    }

    public void removeEmitter(Long farmId) {
        farmEmitters.remove(farmId);
    }

    public SseEmitter addProductEmitter(Long productId, SseEmitter emitter) {
        productEmitters.computeIfAbsent(productId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        emitter.onCompletion(() -> removeProductEmitter(productId, emitter));
        emitter.onTimeout(() -> removeProductEmitter(productId, emitter));
        return emitter;
    }

    public void removeProductEmitter(Long productId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> list = productEmitters.get(productId);
        if (list != null) {
            list.remove(emitter);
        }
    }

    public void sendToFarm(Long farmId, String eventName, Object data) {
        SseEmitter emitter = farmEmitters.get(farmId);
        if (emitter == null) return;
        try {
            emitter.send(SseEmitter.event().name(eventName).data(data, MediaType.APPLICATION_JSON));
        } catch (IOException e) {
            log.warn("농가 SSE 전송 실패 farmId={}", farmId);
            removeEmitter(farmId);
        }
    }

    public void sendStockUpdate(Long productId, int stock) {
        List<SseEmitter> emitters = productEmitters.get(productId);
        if (emitters == null || emitters.isEmpty()) return;
        Map<String, Object> payload = Map.of("productId", productId, "stock", stock);
        for (SseEmitter emitter : List.copyOf(emitters)) {
            try {
                emitter.send(SseEmitter.event().name("stock-update").data(payload, MediaType.APPLICATION_JSON));
            } catch (IOException e) {
                log.warn("재고 SSE 전송 실패 productId={}", productId);
                removeProductEmitter(productId, emitter);
            }
        }
    }

    public SseEmitter createFarmEmitter(Long farmId) {
        SseEmitter emitter = new SseEmitter(TIMEOUT);
        return addEmitter(farmId, emitter);
    }

    public SseEmitter createProductEmitter(Long productId) {
        SseEmitter emitter = new SseEmitter(TIMEOUT);
        return addProductEmitter(productId, emitter);
    }
}
