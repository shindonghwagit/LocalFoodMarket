package com.localfood.localfoodmarket.domain.admin.dto;

import com.localfood.localfoodmarket.domain.farm.entity.FarmStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class FarmStatusUpdateRequestDto {

    @NotNull(message = "변경할 농가 상태를 선택해주세요.")
    private FarmStatus status;
}
