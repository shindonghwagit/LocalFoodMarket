package com.localfood.localfoodmarket.global.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2UserPrincipal principal = (OAuth2UserPrincipal) authentication.getPrincipal();

        String targetUrl;
        if (principal.isNewUser()) {
            targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/callback")
                    .queryParam("isNewUser", true)
                    .queryParam("tempToken", principal.getTempToken())
                    .queryParam("provider", principal.getProvider())
                    .queryParam("email", principal.getEmail())
                    .toUriString();
        } else {
            targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/callback")
                    .queryParam("accessToken", principal.getAccessToken())
                    .queryParam("refreshToken", principal.getRefreshToken())
                    .toUriString();
        }

        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
