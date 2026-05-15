package com.localfood.localfoodmarket.domain.user.dto;

import com.localfood.localfoodmarket.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponseDto {

    private final String accessToken;
    private final String refreshToken;
    private final UserResponseDto user;

    public static AuthResponseDto of(String accessToken, String refreshToken, User user) {
        return AuthResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(UserResponseDto.from(user))
                .build();
    }
}
