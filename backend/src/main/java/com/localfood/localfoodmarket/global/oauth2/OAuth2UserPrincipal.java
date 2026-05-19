package com.localfood.localfoodmarket.global.oauth2;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@Getter
public class OAuth2UserPrincipal implements OAuth2User {

    private final boolean newUser;
    private final String tempToken;
    private final String accessToken;
    private final String refreshToken;
    private final String email;
    private final String provider;
    private final Map<String, Object> attributes;

    // 신규 사용자 — tempToken만 발급
    public OAuth2UserPrincipal(String tempToken, String email, String provider,
                               Map<String, Object> attributes) {
        this.newUser = true;
        this.tempToken = tempToken;
        this.accessToken = null;
        this.refreshToken = null;
        this.email = email;
        this.provider = provider;
        this.attributes = attributes;
    }

    // 기존 사용자 — accessToken + refreshToken 즉시 발급
    public OAuth2UserPrincipal(String accessToken, String refreshToken, String email,
                               String provider, Map<String, Object> attributes) {
        this.newUser = false;
        this.tempToken = null;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.email = email;
        this.provider = provider;
        this.attributes = attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getName() {
        return email;
    }
}
