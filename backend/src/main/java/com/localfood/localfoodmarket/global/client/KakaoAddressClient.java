package com.localfood.localfoodmarket.global.client;

import com.localfood.localfoodmarket.global.client.dto.KakaoAddressResponseDto;
import com.localfood.localfoodmarket.global.config.KakaoAddressConfig;
import com.localfood.localfoodmarket.global.exception.BusinessException;
import com.localfood.localfoodmarket.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@Component
@RequiredArgsConstructor
public class KakaoAddressClient {

    private final KakaoAddressConfig config;
    private final RestTemplate restTemplate;

    public List<KakaoAddressResponseDto.Document> searchAddress(String query) {
        String url = UriComponentsBuilder.fromUriString(config.getUrl())
                .queryParam("query", query)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + config.getApiKey());

        try {
            ResponseEntity<KakaoAddressResponseDto> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    KakaoAddressResponseDto.class
            );
            KakaoAddressResponseDto body = response.getBody();
            return body != null ? body.getDocuments() : List.of();
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.KAKAO_API_ERROR);
        }
    }
}
