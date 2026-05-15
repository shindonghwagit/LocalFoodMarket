package com.localfood.localfoodmarket.domain.order.repository;

import com.localfood.localfoodmarket.domain.order.entity.Order;
import com.localfood.localfoodmarket.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUser(User user, Pageable pageable);

    Optional<Order> findByIdAndUser(Long id, User user);

    long countByCreatedAtAfter(LocalDateTime dateTime);
}
