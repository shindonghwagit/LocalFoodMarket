package com.localfood.localfoodmarket.domain.user.dto;

import com.localfood.localfoodmarket.domain.user.entity.Role;
import com.localfood.localfoodmarket.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class UserResponseDto {

    private final Long id;
    private final String email;
    private final Role role;
    private final Long pointBalance;
    private final List<String> connectedProviders;
    private final LocalDateTime createdAt;

    public static UserResponseDto from(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .pointBalance(user.getPointBalance())
                .connectedProviders(List.of())
                .createdAt(user.getCreatedAt())
                .build();
    }

    // SocialAccount 목록이 조회된 경우 사용
    public static UserResponseDto from(User user, List<String> connectedProviders) {
        return UserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .pointBalance(user.getPointBalance())
                .connectedProviders(connectedProviders)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
