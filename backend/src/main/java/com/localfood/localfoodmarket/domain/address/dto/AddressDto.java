package com.localfood.localfoodmarket.domain.address.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AddressDto {
    private String addressName;
    private String x;
    private String y;
}
