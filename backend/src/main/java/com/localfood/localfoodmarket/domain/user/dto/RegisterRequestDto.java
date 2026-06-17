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
    @Size(min = 8, message = "비밀번호는 8자 이상이어야 해요.")
    private String password;

    @NotNull(message = "역할을 선택해주세요.")
    private Role role;

    @Size(max = 100, message = "농장명은 100자 이하로 입력해주세요.")
    private String farmName;

    @Size(max = 100, message = "지역은 100자 이하로 입력해주세요.")
    private String region;

    @Size(max = 50, message = "카테고리는 50자 이하로 입력해주세요.")
    private String category;

    @Size(max = 100, message = "인증 정보는 100자 이하로 입력해주세요.")
    private String certification;

    private String description;
}
