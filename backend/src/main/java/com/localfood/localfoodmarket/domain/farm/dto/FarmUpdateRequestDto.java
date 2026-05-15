package com.localfood.localfoodmarket.domain.farm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class FarmUpdateRequestDto {

    @NotBlank(message = "농장명을 입력해주세요.")
    @Size(max = 100, message = "농장명은 100자 이하로 입력해주세요.")
    private String farmName;

    @NotBlank(message = "지역을 입력해주세요.")
    @Size(max = 100, message = "지역은 100자 이하로 입력해주세요.")
    private String region;

    @NotBlank(message = "카테고리를 선택해주세요.")
    @Size(max = 50, message = "카테고리는 50자 이하로 입력해주세요.")
    private String category;

    @Size(max = 100, message = "인증 정보는 100자 이하로 입력해주세요.")
    private String certification;

    private String description;
}
