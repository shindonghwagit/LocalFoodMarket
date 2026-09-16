package com.localfood.localfoodmarket.global.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "toss")
@Validated
public class TossPaymentConfig {

    @NotBlank
    private String clientKey;   // 프론트 노출용
    @NotBlank
    private String secretKey;   // 서버 전용 — 절대 프론트로 내려보내지 않음
    @NotBlank
    private String confirmUrl;
}
