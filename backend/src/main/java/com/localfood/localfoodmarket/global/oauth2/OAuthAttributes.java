package com.localfood.localfoodmarket.global.oauth2;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;

import java.util.Map;

@Getter
@RequiredArgsConstructor
public class OAuthAttributes {

    private final String provider;
    private final String providerId;
    private final String email;

    public static OAuthAttributes of(String registrationId, Map<String, Object> attributes) {
        if ("kakao".equals(registrationId)) {
            return ofKakao(attributes);
        }
        return ofGoogle(attributes);
    }

    @SuppressWarnings("unchecked")
    private static OAuthAttributes ofKakao(Map<String, Object> attributes) {
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        if (kakaoAccount == null) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("missing_kakao_account"), "카카오 계정 정보를 가져올 수 없어요.");
        }

        String email = (String) kakaoAccount.get("email");
        if (email == null) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("missing_email"), "카카오 계정의 이메일 동의가 필요해요.");
        }

        String providerId = String.valueOf(attributes.get("id"));
        return new OAuthAttributes("KAKAO", providerId, email);
    }

    private static OAuthAttributes ofGoogle(Map<String, Object> attributes) {
        String email = (String) attributes.get("email");
        if (email == null) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("missing_email"), "구글 계정의 이메일 정보를 가져올 수 없어요.");
        }

        String providerId = (String) attributes.get("sub");
        return new OAuthAttributes("GOOGLE", providerId, email);
    }
}
