package com.localfood.localfoodmarket.domain.order.repository;

import com.localfood.localfoodmarket.domain.order.entity.Escrow;
import com.localfood.localfoodmarket.domain.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EscrowRepository extends JpaRepository<Escrow, Long> {

    Optional<Escrow> findByOrder(Order order);
}
