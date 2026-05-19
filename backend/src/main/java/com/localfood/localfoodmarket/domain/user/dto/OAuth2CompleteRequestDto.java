package com.localfood.localfoodmarket.domain.user.dto;

import com.localfood.localfoodmarket.domain.user.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class OAuth2CompleteRequestDto {

    @NotBlank(message = "임시 토큰이 필요해요.")
    private String tempToken;

    @NotNull(message = "역할을 선택해주세요.")
    private Role role;
}
