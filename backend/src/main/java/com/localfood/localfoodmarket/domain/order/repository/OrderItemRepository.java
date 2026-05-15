package com.localfood.localfoodmarket.domain.order.repository;

import com.localfood.localfoodmarket.domain.order.entity.Order;
import com.localfood.localfoodmarket.domain.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT oi FROM OrderItem oi JOIN FETCH oi.product WHERE oi.order = :order")
    List<OrderItem> findByOrder(@Param("order") Order order);
}
