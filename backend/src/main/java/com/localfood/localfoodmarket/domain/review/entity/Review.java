package com.localfood.localfoodmarket.domain.review.entity;

import com.localfood.localfoodmarket.domain.order.entity.Order;
import com.localfood.localfoodmarket.domain.product.entity.Product;
import com.localfood.localfoodmarket.domain.user.entity.User;
import com.localfood.localfoodmarket.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Check;

@Entity
@Table(
    name = "reviews",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_review_order_product",
        columnNames = {"order_id", "product_id"}
    )
)
@Check(constraints = "rating >= 1 AND rating <= 5")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Review extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Builder
    private Review(User user, Product product, Order order, Integer rating, String content) {
        this.user = user;
        this.product = product;
        this.order = order;
        this.rating = rating;
        this.content = content;
    }
}
