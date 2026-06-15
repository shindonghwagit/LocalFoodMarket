package com.localfood.localfoodmarket.domain.post.dto;

import com.localfood.localfoodmarket.domain.post.entity.Post;
import com.localfood.localfoodmarket.domain.post.entity.PostProduct;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class PostResponseDto {

    private final Long id;
    private final String authorEmail;
    private final String title;
    private final String content;
    private final String category;
    private final Integer likes;
    private final Integer viewCount;
    private final boolean blinded;
    private final boolean liked;
    private final List<String> imageUrls;
    private final List<TaggedProductDto> taggedProducts;
    private final LocalDateTime createdAt;

    @Getter
    @Builder
    public static class TaggedProductDto {
        private final Long id;
        private final String name;
        private final Integer price;

        public static TaggedProductDto from(PostProduct pp) {
            return TaggedProductDto.builder()
                    .id(pp.getProduct().getId())
                    .name(pp.getProduct().getName())
                    .price(pp.getProduct().getPrice())
                    .build();
        }
    }

    public static PostResponseDto from(Post post) {
        return from(post, false);
    }

    public static PostResponseDto from(Post post, boolean liked) {
        return PostResponseDto.builder()
                .id(post.getId())
                .authorEmail(maskEmail(post.getUser().getEmail()))
                .title(post.getTitle())
                .content(post.getContent())
                .category(post.getCategory())
                .likes(post.getLikes())
                .viewCount(post.getViewCount())
                .blinded(post.isBlinded())
                .liked(liked)
                .imageUrls(post.getImages().stream()
                        .map(img -> img.getImageUrl())
                        .toList())
                .taggedProducts(post.getTaggedProducts().stream()
                        .map(TaggedProductDto::from)
                        .toList())
                .createdAt(post.getCreatedAt())
                .build();
    }

    private static String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 2) {
            return email.charAt(0) + "**" + email.substring(atIndex);
        }
        return email.substring(0, 2) + "**" + email.substring(atIndex);
    }
}
