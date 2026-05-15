package com.localfood.localfoodmarket.domain.admin.dto;

import com.localfood.localfoodmarket.domain.user.entity.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class UserRoleUpdateRequestDto {

    @NotNull(message = "변경할 권한을 선택해주세요.")
    private Role role;
}
