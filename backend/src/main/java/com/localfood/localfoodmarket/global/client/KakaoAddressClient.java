package com.localfood.localfoodmarket.global.client;

import com.localfood.localfoodmarket.global.client.dto.KakaoAddressResponseDto;
import com.localfood.localfoodmarket.global.config.KakaoAddressConfig;
import com.localfood.localfoodmarket.global.exception.BusinessException;
import com.localfood.localfoodmarket.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class KakaoAddressClient {

    private final KakaoAddressConfig config;
    private final RestTemplate restTemplate;

    public List<KakaoAddressResponseDto.Document> searchAddress(String query) {
        URI uri = UriComponentsBuilder.fromUriString(config.getUrl())
                .queryParam("query", query)
                .encode(StandardCharsets.UTF_8)
                .build()
                .toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + config.getApiKey());
        headers.set("KA", "sdk/1.0.0 os/java lang/ko-KR origin/http://localhost:8080");

        log.info("[KakaoAddress] request query={} uri={}", query, uri);
        try {
            ResponseEntity<KakaoAddressResponseDto> response = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    KakaoAddressResponseDto.class
            );
            KakaoAddressResponseDto body = response.getBody();
            List<KakaoAddressResponseDto.Document> docs =
                    body != null && body.getDocuments() != null ? body.getDocuments() : List.of();
            log.info("[KakaoAddress] result count={}", docs.size());
            return docs;
        } catch (RestClientResponseException e) {
            log.error("[KakaoAddress] status={} body={}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException(ErrorCode.KAKAO_API_ERROR);
        } catch (Exception e) {
            log.error("[KakaoAddress] unexpected error", e);
            throw new BusinessException(ErrorCode.KAKAO_API_ERROR);
        }
    }
}
