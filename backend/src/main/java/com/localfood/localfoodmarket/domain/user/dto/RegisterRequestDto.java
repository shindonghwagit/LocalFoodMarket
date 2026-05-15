package com.localfood.localfoodmarket.domain.user.dto;

import com.localfood.localfoodmarket.domain.user.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class RegisterRequestDto {

    @NotBlank(message = "이메일을 입력해주세요.")
    @Email(message = "이메일 형식이 올바르지 않아요.")
    private String email;

    @NotBlank(message = "비밀번호를 입력해주세요.")
    @Size(min = 12, message = "비밀번호는 12자 이상이어야 해요.")
    private String password;

    @NotNull(message = "역할을 선택해주세요.")
    private Role role;
}
