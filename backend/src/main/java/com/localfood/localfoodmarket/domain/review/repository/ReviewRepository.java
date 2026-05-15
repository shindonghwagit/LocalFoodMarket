package com.localfood.localfoodmarket.domain.review.repository;

import com.localfood.localfoodmarket.domain.order.entity.Order;
import com.localfood.localfoodmarket.domain.product.entity.Product;
import com.localfood.localfoodmarket.domain.review.entity.Review;
import com.localfood.localfoodmarket.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT r FROM Review r JOIN FETCH r.user WHERE r.product = :product")
    Page<Review> findByProduct(@Param("product") Product product, Pageable pageable);

    boolean existsByOrderAndProduct(Order order, Product product);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Optional<Double> findAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId")
    long countByProductId(@Param("productId") Long productId);

    boolean existsByIdAndUser(Long id, User user);
}
