package com.localfood.localfoodmarket.global.client.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.util.List;

@Getter
public class KakaoAddressResponseDto {

    @JsonProperty("documents")
    private List<Document> documents;

    @Getter
    public static class Document {
        @JsonProperty("address_name")
        private String addressName;
        private String x;
        private String y;
    }
}
