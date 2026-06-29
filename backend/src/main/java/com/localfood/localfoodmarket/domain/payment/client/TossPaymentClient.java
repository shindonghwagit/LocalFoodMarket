package com.localfood.localfoodmarket.domain.payment.client;

import com.localfood.localfoodmarket.global.config.TossPaymentConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

/**
 * 토스페이먼츠 결제 승인 API 호출 전용 클라이언트.
 * secretKey는 이 서버 안에서만 사용한다.
 */
@Component
public class TossPaymentClient {

    private static final Logger log = LoggerFactory.getLogger(TossPaymentClient.class);

    private final RestClient restClient = RestClient.create();
    private final String confirmUrl;
    private final String authHeader;

    public TossPaymentClient(TossPaymentConfig config) {
        this.confirmUrl = config.getConfirmUrl();
        // 토스 인증: Basic base64(secretKey + ":")
        String raw = config.getSecretKey() + ":";
        this.authHeader = "Basic " + Base64.getEncoder()
                .encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 결제 승인. 토스가 2xx가 아니면 RestClientResponseException을 던진다(호출 측에서 처리).
     */
    public TossConfirmResponse confirm(String paymentKey, String orderId, int amount) {
        try {
            return restClient.post()
                    .uri(confirmUrl)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "paymentKey", paymentKey,
                            "orderId", orderId,
                            "amount", amount
                    ))
                    .retrieve()
                    .body(TossConfirmResponse.class);
        } catch (RestClientResponseException e) {
            // 토스가 내려준 에러 본문을 로깅 (카드 거절 등). 민감정보 없음.
            log.warn("토스 결제 승인 실패 - orderId={}, status={}, body={}",
                    orderId, e.getStatusCode(), e.getResponseBodyAsString());
            throw e;
        }
    }
}
