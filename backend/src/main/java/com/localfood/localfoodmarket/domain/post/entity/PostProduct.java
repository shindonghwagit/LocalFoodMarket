package com.localfood.localfoodmarket.domain.post.entity;

import com.localfood.localfoodmarket.domain.product.entity.Product;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "post_products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PostProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Builder
    private PostProduct(Post post, Product product) {
        this.post = post;
        this.product = product;
    }
}
