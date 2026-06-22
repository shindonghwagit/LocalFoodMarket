package com.localfood.localfoodmarket.domain.order.service;

import com.localfood.localfoodmarket.domain.farm.entity.Farm;
import com.localfood.localfoodmarket.domain.farm.repository.FarmRepository;
import com.localfood.localfoodmarket.domain.order.dto.OrderItemRequestDto;
import com.localfood.localfoodmarket.domain.order.dto.OrderRequestDto;
import com.localfood.localfoodmarket.domain.order.dto.OrderResponseDto;
import com.localfood.localfoodmarket.domain.order.dto.OrderStatusUpdateRequestDto;
import com.localfood.localfoodmarket.domain.order.entity.DeliveryMethod;
import com.localfood.localfoodmarket.domain.order.entity.Escrow;
import com.localfood.localfoodmarket.domain.order.entity.Order;
import com.localfood.localfoodmarket.domain.order.entity.OrderItem;
import com.localfood.localfoodmarket.domain.order.entity.OrderStatus;
import com.localfood.localfoodmarket.domain.order.repository.EscrowRepository;
import com.localfood.localfoodmarket.domain.order.repository.OrderItemRepository;
import com.localfood.localfoodmarket.domain.order.repository.OrderRepository;
import com.localfood.localfoodmarket.domain.point.service.PointService;
import com.localfood.localfoodmarket.domain.product.entity.Product;
import com.localfood.localfoodmarket.domain.product.repository.ProductRepository;
import com.localfood.localfoodmarket.domain.user.entity.Role;
import com.localfood.localfoodmarket.domain.user.entity.User;
import com.localfood.localfoodmarket.domain.user.repository.UserRepository;
import com.localfood.localfoodmarket.global.exception.BusinessException;
import com.localfood.localfoodmarket.global.exception.ErrorCode;
import com.localfood.localfoodmarket.global.sse.SseEmitterManager;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final int MAX_RETRY = 3;

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final FarmRepository farmRepository;
    private final EscrowRepository escrowRepository;
    private final PointService pointService;
    private final SseEmitterManager sseEmitterManager;
    // 낙관적 락 충돌 시 새 트랜잭션으로 재시도하기 위해 프록시를 통해 자기 자신을 호출한다.
    private final ObjectProvider<OrderService> self;

    /**
     * 주문 생성 진입점. 트랜잭션 자체는 {@link #createOrderInTx}가 담당하며,
     * 낙관적 락 충돌(재고 동시 차감 등) 시 최대 {@value #MAX_RETRY}회 새 트랜잭션으로 재시도한다.
     * 재시도가 모두 실패하면 ORDER_CONFLICT로 명확히 응답한다.
     */
    public OrderResponseDto createOrder(Long userId, OrderRequestDto request) {
        return withOptimisticRetry(() -> self.getObject().createOrderInTx(userId, request));
    }

    /**
     * 낙관적 락 충돌 시 새 트랜잭션으로 최대 {@value #MAX_RETRY}회 재시도한다.
     * action은 반드시 self 프록시를 통해 @Transactional 메서드를 호출해야 매 시도가 새 트랜잭션이 된다.
     * 재시도가 모두 실패하면 ORDER_CONFLICT로 명확히 응답한다.
     */
    private <T> T withOptimisticRetry(Supplier<T> action) {
        for (int attempt = 1; ; attempt++) {
            try {
                return action.get();
            } catch (OptimisticLockingFailureException e) {
                if (attempt >= MAX_RETRY) {
                    throw new BusinessException(ErrorCode.ORDER_CONFLICT);
                }
                // 다음 시도 — 재고/잔액/상태를 최신 버전으로 다시 읽는다.
            }
        }
    }

    @Transactional
    public OrderResponseDto createOrderInTx(Long userId, OrderRequestDto request) {
        User user = findUser(userId);

        // 1단계: 모든 상품이 같은 농가인지 검증 (한 주문 = 한 농가, 정산 단위)
        List<Product> products = new ArrayList<>();
        int totalPrice = 0;

        for (OrderItemRequestDto item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
            products.add(product);
            totalPrice += product.getPrice() * item.getQuantity();
        }

        Farm farm = products.get(0).getFarm();
        boolean singleFarm = products.stream()
                .allMatch(p -> p.getFarm().getId().equals(farm.getId()));
        if (!singleFarm) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "한 번에 한 농가의 상품만 주문할 수 있어요. 농가별로 나눠서 주문해주세요.");
        }

        // 2단계: 수령 방법(픽업/배송)에 따른 필수값 검증
        validateDelivery(request);

        // 3단계: 재고 확인 (낙관적 락 — Product @Version) → 부족 시 OUT_OF_STOCK
        for (int i = 0; i < products.size(); i++) {
            if (products.get(i).getStock() < request.getItems().get(i).getQuantity()) {
                throw new BusinessException(ErrorCode.OUT_OF_STOCK);
            }
        }

        // 4단계: 구매자 포인트 잔액 확인 → 부족 시 INSUFFICIENT_POINT
        if (user.getPointBalance() < totalPrice) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_POINT);
        }

        // 5단계: 재고 차감
        for (int i = 0; i < products.size(); i++) {
            products.get(i).deductStock(request.getItems().get(i).getQuantity());
        }

        // 6단계: 주문 저장 (status: PAID, 농가 연결)
        Order order = orderRepository.save(Order.builder()
                .user(user)
                .farm(farm)
                .totalPrice(totalPrice)
                .status(OrderStatus.PAID)
                .deliveryMethod(request.getDeliveryMethod())
                .deliveryAddress(request.getDeliveryAddress())
                .pickupLocation(request.getPickupLocation())
                .pickupTime(request.getPickupTime())
                .buyerNote(request.getBuyerNote())
                .build());

        // 7단계: 주문 항목 저장
        List<OrderItem> savedItems = new ArrayList<>();
        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);
            savedItems.add(orderItemRepository.save(OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(request.getItems().get(i).getQuantity())
                    .priceAtOrder(product.getPrice())
                    .build()));
        }

        // 8단계: 구매자 포인트 차감 + point_logs(HOLD, balanceAfter, order 연결)
        pointService.hold(user, order, totalPrice);

        // 9단계: 에스크로 생성 (status: HELD, amount = totalPrice) — 시스템이 포인트 보관
        Escrow escrow = Escrow.builder()
                .order(order)
                .buyer(user)
                .farm(farm)
                .amount(totalPrice)
                .build();
        escrow.hold();
        escrowRepository.save(escrow);

        OrderResponseDto result = OrderResponseDto.of(order, savedItems,
                user.getPointBalance(), escrow.getStatus());

        // 10단계: 트랜잭션 커밋 이후 SSE 이벤트 전송 (커밋 전 전송 방지)
        DeliveryMethod deliveryMethod = order.getDeliveryMethod();
        record SsePayload(Long farmId, Long orderId, String productName, Long productId, int quantity, int totalPrice, int stock) {}
        List<SsePayload> ssePayloads = savedItems.stream()
                .map(item -> new SsePayload(
                        item.getProduct().getFarm().getId(),
                        order.getId(),
                        item.getProduct().getName(),
                        item.getProduct().getId(),
                        item.getQuantity(),
                        item.getQuantity() * item.getPriceAtOrder(),
                        item.getProduct().getStock()
                ))
                .toList();

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                ssePayloads.forEach(p -> {
                    sseEmitterManager.sendToFarm(p.farmId(), "new-order", Map.of(
                            "orderId", p.orderId(),
                            "productName", p.productName(),
                            "quantity", p.quantity(),
                            "totalPrice", p.totalPrice(),
                            "deliveryMethod", deliveryMethod.name()
                    ));
                    sseEmitterManager.sendStockUpdate(p.productId(), p.stock());
                });
            }
        });

        return result;
    }

    private void validateDelivery(OrderRequestDto request) {
        if (request.getDeliveryMethod() == DeliveryMethod.PICKUP) {
            if (isBlank(request.getPickupLocation()) || request.getPickupTime() == null) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                        "픽업 장소와 픽업 시간을 입력해주세요.");
            }
        } else if (request.getDeliveryMethod() == DeliveryMethod.DELIVERY) {
            if (isBlank(request.getDeliveryAddress())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                        "배송지 주소를 입력해주세요.");
            }
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    @Transactional(readOnly = true)
    public Page<OrderResponseDto> getOrders(Long userId, Pageable pageable) {
        User user = findUser(userId);
        return orderRepository.findByUser(user, pageable)
                .map(order -> OrderResponseDto.of(order, orderItemRepository.findByOrder(order)));
    }

    @Transactional(readOnly = true)
    public OrderResponseDto getOrder(Long userId, Long orderId) {
        User user = findUser(userId);
        Order order = orderRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
        var escrowStatus = escrowRepository.findByOrder(order)
                .map(Escrow::getStatus)
                .orElse(null);
        return OrderResponseDto.of(order, orderItemRepository.findByOrder(order), escrowStatus);
    }

    // ===== 농가: 주문 상태 진행 (PAID → READY / PREPARING → SHIPPING → DELIVERED) =====

    public OrderResponseDto updateOrderStatus(Long farmUserId, Long orderId,
                                              OrderStatusUpdateRequestDto request) {
        return withOptimisticRetry(() -> self.getObject().updateOrderStatusInTx(farmUserId, orderId, request));
    }

    @Transactional
    public OrderResponseDto updateOrderStatusInTx(Long farmUserId, Long orderId,
                                                  OrderStatusUpdateRequestDto request) {
        User farmUser = findUser(farmUserId);

        if (farmUser.getRole() != Role.FARMER) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "농가만 주문 상태를 변경할 수 있어요.");
        }

        Farm farm = farmRepository.findByUser(farmUser)
                .orElseThrow(() -> new BusinessException(ErrorCode.FARM_NOT_FOUND));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        // 본인 농가 주문인지 검증 (정산 단위인 order.farm 기준)
        if (order.getFarm() == null || !order.getFarm().getId().equals(farm.getId())) {
            throw new BusinessException(ErrorCode.ORDER_STATUS_FORBIDDEN);
        }

        // 허용 전이만 가능 — 전이 규칙·필수값은 엔티티 메서드가 강제한다.
        switch (request.getStatus()) {
            case READY -> order.markReady();                                   // PICKUP:   PAID → READY
            case PREPARING -> order.markPreparing();                           // DELIVERY: PAID → PREPARING
            case SHIPPING -> order.markShipping(request.getCourier(),          // → SHIPPING (송장 저장)
                    request.getTrackingNumber());
            case DELIVERED -> order.markDelivered();                           // → DELIVERED (deliveredAt = now)
            default -> throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS,
                    "농가가 변경할 수 없는 상태예요.");
        }

        return OrderResponseDto.of(order, orderItemRepository.findByOrder(order));
    }

    // ===== 구매자: 수령 확인 → 정산 (CONFIRMED → SETTLED, 에스크로 RELEASE) =====

    public OrderResponseDto confirmOrder(Long userId, Long orderId) {
        return withOptimisticRetry(() -> self.getObject().confirmOrderInTx(userId, orderId));
    }

    @Transactional
    public OrderResponseDto confirmOrderInTx(Long userId, Long orderId) {
        User user = findUser(userId);

        Order order = orderRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        Escrow escrow = escrowRepository.findByOrder(order)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND,
                        "에스크로 정보를 찾을 수 없어요."));

        // 1) READY(픽업)/DELIVERED(배송)에서만 수령확인 가능 → CONFIRMED
        order.confirm();
        // 2) 에스크로 잠금 해제 HELD → RELEASED
        escrow.release();
        // 3·4) 농가 포인트 지급 + point_logs(RELEASE, balanceAfter)
        User farmOwner = order.getFarm().getUser();
        pointService.release(farmOwner, order, escrow.getAmount());
        // 정산 완료 CONFIRMED → SETTLED
        order.settle();

        return OrderResponseDto.of(order, orderItemRepository.findByOrder(order), escrow.getStatus());
    }

    // ===== 취소 → 환불 (CANCELED, 에스크로 REFUND, 재고·포인트 복원) =====

    public OrderResponseDto cancelOrder(Long requesterUserId, Long orderId) {
        return withOptimisticRetry(() -> self.getObject().cancelOrderInTx(requesterUserId, orderId));
    }

    @Transactional
    public OrderResponseDto cancelOrderInTx(Long requesterUserId, Long orderId) {
        User requester = findUser(requesterUserId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        boolean isBuyer = order.getUser().getId().equals(requester.getId());
        boolean isFarmOwner = order.getFarm() != null
                && order.getFarm().getUser().getId().equals(requester.getId());

        if (!isBuyer && !isFarmOwner) {
            throw new BusinessException(ErrorCode.ORDER_FORBIDDEN, "해당 주문을 취소할 권한이 없어요.");
        }

        // 취소 가능 상태 검증 — CONSUMER: PAID만 / FARMER: PAID~PREPARING/READY
        OrderStatus status = order.getStatus();
        if (isFarmOwner) {
            if (status != OrderStatus.PAID && status != OrderStatus.PREPARING && status != OrderStatus.READY) {
                throw new BusinessException(ErrorCode.ORDER_NOT_CANCELABLE);
            }
        } else { // 구매자 단독 취소
            if (status != OrderStatus.PAID) {
                throw new BusinessException(ErrorCode.ORDER_NOT_CANCELABLE);
            }
        }

        Escrow escrow = escrowRepository.findByOrder(order)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND,
                        "에스크로 정보를 찾을 수 없어요."));

        List<OrderItem> items = orderItemRepository.findByOrder(order);

        // 1) 재고 복원
        items.forEach(item -> item.getProduct().increaseStock(item.getQuantity()));
        // 2) 주문 취소 CANCELED
        order.cancel();
        // 3) 에스크로 환불 HELD → REFUNDED
        escrow.refund();
        // 4·5) 구매자 포인트 복원 + point_logs(REFUND, balanceAfter)
        pointService.refund(order.getUser(), order, escrow.getAmount());

        return OrderResponseDto.of(order, items, escrow.getStatus());
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자 정보를 찾을 수 없어요."));
    }
}
