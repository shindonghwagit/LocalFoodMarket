package com.localfood.localfoodmarket.domain.post.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "post_images")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PostImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(nullable = false, length = 500)
    private String imageUrl;

    @Column(nullable = false)
    private Integer orderIndex = 0;

    @Builder
    private PostImage(Post post, String imageUrl, Integer orderIndex) {
        this.post = post;
        this.imageUrl = imageUrl;
        this.orderIndex = orderIndex != null ? orderIndex : 0;
    }
}
