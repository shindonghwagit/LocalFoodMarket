package com.localfood.localfoodmarket.domain.post.dto;

import com.localfood.localfoodmarket.domain.post.entity.Comment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CommentResponseDto {

    private final Long id;
    private final String authorEmail;
    private final String content;
    private final LocalDateTime createdAt;

    public static CommentResponseDto from(Comment comment) {
        return CommentResponseDto.builder()
                .id(comment.getId())
                .authorEmail(maskEmail(comment.getUser().getEmail()))
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
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
