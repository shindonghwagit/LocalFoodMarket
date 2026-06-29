package com.localfood.localfoodmarket.global.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "toss")
public class TossPaymentConfig {

    private String clientKey;   // 프론트 노출용
    private String secretKey;   // 서버 전용 — 절대 프론트로 내려보내지 않음
    private String confirmUrl;
}
