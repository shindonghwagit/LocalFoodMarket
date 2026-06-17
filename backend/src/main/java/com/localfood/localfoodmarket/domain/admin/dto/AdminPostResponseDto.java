package com.localfood.localfoodmarket.domain.admin.dto;

import com.localfood.localfoodmarket.domain.post.entity.Post;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminPostResponseDto {

    private final Long id;
    private final String title;
    private final String authorEmail;
    private final int reportCount;
    private final LocalDateTime createdAt;

    public static AdminPostResponseDto from(Post post) {
        return AdminPostResponseDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .authorEmail(post.getUser().getEmail())
                .reportCount(post.getReportCount())
                .createdAt(post.getCreatedAt())
                .build();
    }
}
