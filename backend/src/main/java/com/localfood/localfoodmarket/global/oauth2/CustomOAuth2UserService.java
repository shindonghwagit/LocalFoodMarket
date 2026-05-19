package com.localfood.localfoodmarket.global.oauth2;

import com.localfood.localfoodmarket.domain.user.entity.SocialAccount;
import com.localfood.localfoodmarket.domain.user.entity.User;
import com.localfood.localfoodmarket.domain.user.repository.SocialAccountRepository;
import com.localfood.localfoodmarket.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final SocialAccountRepository socialAccountRepository;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuthAttributes attrs = OAuthAttributes.of(registrationId, oAuth2User.getAttributes());

        Optional<SocialAccount> existingAccount =
                socialAccountRepository.findByProviderAndProviderId(attrs.getProvider(), attrs.getProviderId());

        if (existingAccount.isPresent()) {
            User user = existingAccount.get().getUser();
            String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
            String refreshToken = jwtUtil.generateRefreshToken(user.getId());
            return new OAuth2UserPrincipal(accessToken, refreshToken, attrs.getEmail(),
                    attrs.getProvider(), oAuth2User.getAttributes());
        }

        String tempToken = jwtUtil.generateTempToken(attrs.getEmail(), attrs.getProvider(), attrs.getProviderId());
        return new OAuth2UserPrincipal(tempToken, attrs.getEmail(),
                attrs.getProvider(), oAuth2User.getAttributes());
    }
}
