package com.localfood.localfoodmarket.domain.order.scheduler;

import com.localfood.localfoodmarket.domain.order.entity.Order;
import com.localfood.localfoodmarket.domain.order.entity.OrderStatus;
import com.localfood.localfoodmarket.domain.order.repository.OrderRepository;
import com.localfood.localfoodmarket.domain.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 배송완료(DELIVERED) 후 일정 기간(기본 7일) 동안 구매자가 수령확인하지 않은 주문을
 * 매일 0시에 자동으로 확정·정산한다.
 */
@Component
@RequiredArgsConstructor
public class OrderAutoConfirmScheduler {

    private static final Logger log = LoggerFactory.getLogger(OrderAutoConfirmScheduler.class);

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @Value("${order.auto-confirm-days:7}")
    private long autoConfirmDays;

    @Scheduled(cron = "0 0 0 * * *")
    public void autoConfirmDeliveredOrders() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(autoConfirmDays);
        List<Order> targets = orderRepository
                .findByStatusAndDeliveredAtBefore(OrderStatus.DELIVERED, threshold);

        if (targets.isEmpty()) {
            log.info("주문 자동확정 — 대상 없음 (기준 {}일, threshold={})", autoConfirmDays, threshold);
            return;
        }

        int success = 0;
        int failed = 0;
        // 건별로 독립 트랜잭션 — 한 건이 실패해도 나머지는 계속 진행한다.
        for (Order order : targets) {
            try {
                orderService.autoConfirm(order.getId());
                success++;
            } catch (Exception e) {
                failed++;
                log.error("주문 자동확정 실패 — orderId={}", order.getId(), e);
            }
        }

        log.info("주문 자동확정 완료 — 대상 {}건, 성공 {}건, 실패 {}건",
                targets.size(), success, failed);
    }
}
