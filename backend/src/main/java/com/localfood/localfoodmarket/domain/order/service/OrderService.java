package com.localfood.localfoodmarket.domain.order.service;

import com.localfood.localfoodmarket.domain.farm.entity.Farm;
import com.localfood.localfoodmarket.domain.farm.repository.FarmRepository;
import com.localfood.localfoodmarket.domain.order.dto.OrderItemRequestDto;
import com.localfood.localfoodmarket.domain.order.dto.OrderRequestDto;
import com.localfood.localfoodmarket.domain.order.dto.OrderResponseDto;
import com.localfood.localfoodmarket.domain.order.dto.OrderStatusUpdateRequestDto;
import com.localfood.localfoodmarket.domain.order.entity.Order;
import com.localfood.localfoodmarket.domain.order.entity.OrderItem;
import com.localfood.localfoodmarket.domain.order.entity.OrderStatus;
import com.localfood.localfoodmarket.domain.order.repository.OrderItemRepository;
import com.localfood.localfoodmarket.domain.order.repository.OrderRepository;
import com.localfood.localfoodmarket.domain.point.entity.PointLog;
import com.localfood.localfoodmarket.domain.point.entity.PointType;
import com.localfood.localfoodmarket.domain.point.repository.PointLogRepository;
import com.localfood.localfoodmarket.domain.product.entity.Product;
import com.localfood.localfoodmarket.domain.product.repository.ProductRepository;
import com.localfood.localfoodmarket.domain.user.entity.Role;
import com.localfood.localfoodmarket.domain.user.entity.User;
import com.localfood.localfoodmarket.domain.user.repository.UserRepository;
import com.localfood.localfoodmarket.global.exception.BusinessException;
import com.localfood.localfoodmarket.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final FarmRepository farmRepository;
    private final PointLogRepository pointLogRepository;

    @Transactional
    public OrderResponseDto createOrder(Long userId, OrderRequestDto request) {
        User user = findUser(userId);

        // 1단계: 비관적 락으로 상품 조회 → 재고 확인
        List<Product> lockedProducts = new ArrayList<>();
        int totalPrice = 0;

        for (OrderItemRequestDto item : request.getItems()) {
            Product product = productRepository.findByIdWithLock(item.getProductId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

            if (product.getStock() < item.getQuantity()) {
                throw new BusinessException(ErrorCode.OUT_OF_STOCK);
            }

            lockedProducts.add(product);
            totalPrice += product.getPrice() * item.getQuantity();
        }

        // 2단계: 포인트 잔액 확인
        if (user.getPointBalance() < totalPrice) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_POINT);
        }

        // 3단계: 재고 차감
        for (int i = 0; i < lockedProducts.size(); i++) {
            lockedProducts.get(i).deductStock(request.getItems().get(i).getQuantity());
        }

        // 4단계: 포인트 차감
        user.deductPoint(totalPrice);

        // 5단계: 포인트 로그 저장
        pointLogRepository.save(PointLog.builder()
                .user(user)
                .amount(totalPrice)
                .type(PointType.USE)
                .build());

        // 6단계: 주문 저장
        Order order = orderRepository.save(Order.builder()
                .user(user)
                .totalPrice(totalPrice)
                .status(OrderStatus.PAID)
                .deliveryAddress(request.getDeliveryAddress())
                .build());

        // 7단계: 주문 항목 저장
        List<OrderItem> savedItems = new ArrayList<>();
        for (int i = 0; i < lockedProducts.size(); i++) {
            Product product = lockedProducts.get(i);
            savedItems.add(orderItemRepository.save(OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(request.getItems().get(i).getQuantity())
                    .priceAtOrder(product.getPrice())
                    .build()));
        }

        return OrderResponseDto.of(order, savedItems, user.getPointBalance());
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
        return OrderResponseDto.of(order, orderItemRepository.findByOrder(order));
    }

    @Transactional
    public OrderResponseDto updateOrderStatus(Long farmUserId, Long orderId,
                                              OrderStatusUpdateRequestDto request) {
        User farmUser = findUser(farmUserId);

        if (farmUser.getRole() != Role.FARMER) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "농가만 주문 상태를 변경할 수 있어요.");
        }

        Farm farm = farmRepository.findByUser(farmUser)
                .orElseThrow(() -> new BusinessException(ErrorCode.FARM_NOT_FOUND));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        List<OrderItem> items = orderItemRepository.findByOrder(order);

        // 해당 농가 상품이 포함된 주문인지 검증
        boolean hasFarmProduct = items.stream()
                .anyMatch(item -> item.getProduct().getFarm().getId().equals(farm.getId()));

        if (!hasFarmProduct) {
            throw new BusinessException(ErrorCode.ORDER_STATUS_FORBIDDEN);
        }

        order.updateStatus(request.getStatus());
        return OrderResponseDto.of(order, items);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자 정보를 찾을 수 없어요."));
    }
}
